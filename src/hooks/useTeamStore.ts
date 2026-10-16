import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { TeamInvite, TeamMember, TimeEntry } from '@/lib/types';
import { entryDurationHours } from '@/lib/timeEntryUtils';
import { teamApi, type TeamSnapshot } from '@/lib/teamApi';
import { readLocalTimeEntries, saveLocalTimeEntry, deleteLocalTimeEntry } from '@/lib/localTimeEntries';

export type HoursScope = 'me' | 'team';
export type CalendarViewMode = 'personal' | 'team';

interface TeamStore {
  members: TeamMember[];
  invites: TeamInvite[];
  timeEntries: TimeEntry[];
  localTimeEntries: TimeEntry[];
  activeMemberId: string | null;
  activateMember: (memberId: string) => void;
  workspaceId: string | null;
  hoursScope: HoursScope;
  calendarView: CalendarViewMode;
  isSyncing: boolean;
  lastError: string | null;
  setHoursScope: (scope: HoursScope) => void;
  setCalendarView: (view: CalendarViewMode) => void;
  applySnapshot: (snapshot: TeamSnapshot) => void;
  bootstrap: (accessToken: string) => Promise<void>;
  inviteMember: (accessToken: string, input: { name: string; email: string }) => Promise<TeamInvite>;
  revokeInvite: (accessToken: string, inviteId: string) => Promise<void>;
  acceptInvite: (accessToken: string, token: string) => Promise<{ ok: boolean; error?: string }>;
  removeMember: (accessToken: string, memberId: string) => Promise<void>;
  addTimeEntry: (
    accessToken: string | null,
    entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TimeEntry['status'] }
  ) => Promise<TimeEntry>;
  updateTimeEntry: (accessToken: string | null, id: string, patch: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (accessToken: string | null, id: string) => Promise<void>;
  syncGoogleEntries: (
    accessToken: string,
    entries: Array<{
      googleEventId: string;
      title: string;
      description?: string;
      projectId?: string | null;
      projectName: string;
      activityType: string;
      color?: string;
      startTime: string;
      endTime: string;
    }>
  ) => Promise<void>;
  getMemberHours: (memberId: string, start?: Date, end?: Date) => number;
  seedDemoTeam: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      members: [],
      invites: [],
      timeEntries: [],
      localTimeEntries: [],
      activeMemberId: null,
      workspaceId: null,
      hoursScope: 'me',
      calendarView: 'personal',
      isSyncing: false,
      lastError: null,

      activateMember: (memberId) => {
        if (get().activeMemberId === memberId) return;
        set({ activeMemberId: null, localTimeEntries: [], timeEntries: [],
          workspaceId: null, members: [], invites: [], lastError: null });
        const localTimeEntries = readLocalTimeEntries(memberId);
        set({ activeMemberId: memberId, localTimeEntries, timeEntries: localTimeEntries,
          workspaceId: null, members: [], invites: [], lastError: null });
      },

      setHoursScope: (scope) => set({ hoursScope: scope }),
      setCalendarView: (view) => set({ calendarView: view }),

      applySnapshot: (snapshot) => {
        set({
          workspaceId: snapshot.workspace?.id ?? get().workspaceId,
          members: snapshot.members ?? [],
          invites: snapshot.invites ?? [],
          timeEntries: [
            ...(snapshot.timeEntries ?? []).filter((entry) => !get().localTimeEntries.some((local) => local.id === entry.id)),
            ...get().localTimeEntries,
          ],
          lastError: null,
        });
      },

      bootstrap: async (accessToken) => {
        const memberId = get().activeMemberId;
        set({ isSyncing: true, lastError: null });
        try {
          const snapshot = await teamApi.bootstrap(accessToken);
          if (memberId === get().activeMemberId) get().applySnapshot(snapshot);
        } catch (error) {
          set({ lastError: error instanceof Error ? error.message : 'Failed to load team' });
        } finally {
          set({ isSyncing: false });
        }
      },

      inviteMember: async (accessToken, input) => {
        const snapshot = await teamApi.createInvite(accessToken, input);
        get().applySnapshot(snapshot);
        return snapshot.invite;
      },

      revokeInvite: async (accessToken, inviteId) => {
        const snapshot = await teamApi.revokeInvite(accessToken, inviteId);
        get().applySnapshot(snapshot);
      },

      acceptInvite: async (accessToken, token) => {
        try {
          const snapshot = await teamApi.acceptInvite(accessToken, token);
          get().applySnapshot(snapshot);
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Could not accept invite' };
        }
      },

      removeMember: async (accessToken, memberId) => {
        if (memberId.startsWith('pending-')) {
          const inviteId = memberId.replace('pending-', '');
          await get().revokeInvite(accessToken, inviteId);
          return;
        }
        const snapshot = await teamApi.removeMember(accessToken, memberId);
        get().applySnapshot(snapshot);
      },

      // Personal time tracking saves on this device, independently of Google
      // authentication and availability of the hosted team workspace.
      addTimeEntry: async (_accessToken, input) => {
        const ownerId = get().activeMemberId;
        if (!ownerId) throw new Error('Your calendar is still loading. Please try again.');
        const stamp = nowIso();
        const entry: TimeEntry = {
          ...input,
          id: uuidv4(),
          status: input.status ?? 'confirmed',
          source: input.source ?? 'manual',
          createdAt: stamp,
          updatedAt: stamp,
        };
        const localTimeEntries = saveLocalTimeEntry(ownerId, entry);
        set((state) => ({ localTimeEntries, timeEntries: [...state.timeEntries, entry] }));
        return entry;
      },

      updateTimeEntry: async (accessToken, id, patch) => {
        const state = get();
        const existing = state.timeEntries.find((entry) => entry.id === id);
        if (!existing) throw new Error('This time entry could not be found.');
        if (state.localTimeEntries.some((entry) => entry.id === id) || !accessToken) {
          if (!state.activeMemberId) throw new Error('Your calendar is still loading. Please try again.');
          const updated = { ...existing, ...patch, id: existing.id, memberId: existing.memberId, updatedAt: nowIso() };
          const localTimeEntries = saveLocalTimeEntry(state.activeMemberId, updated);
          set((current) => ({ localTimeEntries, timeEntries: current.timeEntries.map((entry) => entry.id === id ? updated : entry) }));
          return;
        }
        const snapshot = await teamApi.updateEntry(accessToken, id, patch);
        if (state.activeMemberId === get().activeMemberId) get().applySnapshot(snapshot);
      },

      deleteTimeEntry: async (accessToken, id) => {
        const state = get();
        if (state.localTimeEntries.some((entry) => entry.id === id) || !accessToken) {
          if (!state.activeMemberId) throw new Error('Your calendar is still loading. Please try again.');
          const localTimeEntries = deleteLocalTimeEntry(state.activeMemberId, id);
          set((current) => ({ localTimeEntries, timeEntries: current.timeEntries.filter((entry) => entry.id !== id) }));
          return;
        }
        const snapshot = await teamApi.deleteEntry(accessToken, id);
        if (state.activeMemberId === get().activeMemberId) get().applySnapshot(snapshot);
      },

      syncGoogleEntries: async (accessToken, entries) => {
        const memberId = get().activeMemberId;
        const snapshot = await teamApi.syncGoogleEntries(accessToken, entries);
        if (memberId === get().activeMemberId) get().applySnapshot(snapshot);
      },

      getMemberHours: (memberId, start, end) => {
        return get().timeEntries.reduce((sum, entry) => {
          if (entry.memberId !== memberId) return sum;
          const startMs = new Date(entry.startTime).getTime();
          if (start && startMs < start.getTime()) return sum;
          if (end && startMs > end.getTime()) return sum;
          return sum + entryDurationHours(entry);
        }, 0);
      },

      seedDemoTeam: () => {
        if (get().workspaceId === 'demo-workspace') return;
        set({
          workspaceId: 'demo-workspace',
          members: [
            {
              id: 'demo-user',
              name: 'Alex Demo',
              email: 'alex@vrema.dev',
              imageUrl: '',
              hoursLogged: 12,
              role: 'owner',
              status: 'active',
            },
            {
              id: 'demo-member-1',
              name: 'Sam Rivera',
              email: 'sam@vrema.dev',
              imageUrl: '',
              hoursLogged: 8,
              role: 'member',
              status: 'active',
            },
          ],
          invites: [],
          timeEntries: get().localTimeEntries,
        });
      },
    }),
    {
      name: 'vrema-team-store',
      partialize: (state) => ({
        hoursScope: state.hoursScope,
        calendarView: state.calendarView,
      }),
    }
  )
);
