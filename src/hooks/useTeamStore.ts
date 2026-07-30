import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { TeamInvite, TeamMember, TimeEntry } from '@/lib/types';
import { entryDurationHours } from '@/lib/timeEntryUtils';
import { teamApi, type TeamSnapshot } from '@/lib/teamApi';

export type HoursScope = 'me' | 'team';
export type CalendarViewMode = 'personal' | 'team';

interface TeamStore {
  members: TeamMember[];
  invites: TeamInvite[];
  timeEntries: TimeEntry[];
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
      workspaceId: null,
      hoursScope: 'me',
      calendarView: 'personal',
      isSyncing: false,
      lastError: null,

      setHoursScope: (scope) => set({ hoursScope: scope }),
      setCalendarView: (view) => set({ calendarView: view }),

      applySnapshot: (snapshot) => {
        set({
          workspaceId: snapshot.workspace?.id ?? get().workspaceId,
          members: snapshot.members ?? [],
          invites: snapshot.invites ?? [],
          timeEntries: snapshot.timeEntries ?? [],
          lastError: null,
        });
      },

      bootstrap: async (accessToken) => {
        set({ isSyncing: true, lastError: null });
        try {
          const snapshot = await teamApi.bootstrap(accessToken);
          get().applySnapshot(snapshot);
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

      addTimeEntry: async (accessToken, input) => {
        if (!accessToken) {
          const stamp = nowIso();
          const entry: TimeEntry = {
            id: uuidv4(),
            title: input.title,
            description: input.description,
            projectId: input.projectId,
            projectName: input.projectName,
            activityType: input.activityType,
            color: input.color,
            startTime: input.startTime,
            endTime: input.endTime,
            memberId: input.memberId,
            status: input.status ?? 'confirmed',
            source: input.source ?? 'manual',
            createdAt: stamp,
            updatedAt: stamp,
          };
          set((state) => ({ timeEntries: [...state.timeEntries, entry] }));
          return entry;
        }

        const snapshot = await teamApi.upsertEntry(accessToken, {
          ...input,
          status: input.status ?? 'confirmed',
          source: input.source ?? 'manual',
        });
        get().applySnapshot(snapshot);
        return snapshot.entry;
      },

      updateTimeEntry: async (accessToken, id, patch) => {
        if (!accessToken) {
          set((state) => ({
            timeEntries: state.timeEntries.map((entry) =>
              entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry
            ),
          }));
          return;
        }
        const snapshot = await teamApi.updateEntry(accessToken, id, patch);
        get().applySnapshot(snapshot);
      },

      deleteTimeEntry: async (accessToken, id) => {
        if (!accessToken) {
          set((state) => ({
            timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
          }));
          return;
        }
        const snapshot = await teamApi.deleteEntry(accessToken, id);
        get().applySnapshot(snapshot);
      },

      syncGoogleEntries: async (accessToken, entries) => {
        const snapshot = await teamApi.syncGoogleEntries(accessToken, entries);
        get().applySnapshot(snapshot);
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
        const stamp = nowIso();
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
          timeEntries: [
            {
              id: 'demo-entry-1',
              title: 'Design review',
              projectId: null,
              projectName: 'Acme',
              activityType: 'design',
              startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              memberId: 'demo-user',
              status: 'confirmed',
              source: 'manual',
              createdAt: stamp,
              updatedAt: stamp,
            },
          ],
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
