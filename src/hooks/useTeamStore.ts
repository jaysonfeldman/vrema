import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { TeamInvite, TeamMember, TimeEntry } from '@/lib/types';
import { entryDurationHours } from '@/lib/timeEntryUtils';

export type HoursScope = 'me' | 'team';
export type CalendarViewMode = 'personal' | 'team';

interface TeamStore {
  members: TeamMember[];
  invites: TeamInvite[];
  timeEntries: TimeEntry[];
  hoursScope: HoursScope;
  calendarView: CalendarViewMode;
  ensureOwner: (user: { id: string; name: string; email: string; imageUrl?: string }) => void;
  setHoursScope: (scope: HoursScope) => void;
  setCalendarView: (view: CalendarViewMode) => void;
  inviteMember: (input: {
    name: string;
    email: string;
    invitedById: string;
    invitedByName: string;
  }) => TeamInvite;
  revokeInvite: (inviteId: string) => void;
  acceptInvite: (token: string, accepter?: { id: string; name: string; email: string; imageUrl?: string }) => {
    ok: boolean;
    member?: TeamMember;
    error?: string;
  };
  removeMember: (memberId: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TimeEntry['status'] }) => TimeEntry;
  updateTimeEntry: (id: string, patch: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getMemberHours: (memberId: string, start?: Date, end?: Date) => number;
  seedDemoTeam: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

type InvitePayload = {
  v: 1;
  name: string;
  email: string;
  invitedById: string;
  invitedByName: string;
  id: string;
};

function encodeInviteToken(payload: InvitePayload): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeInviteToken(token: string): InvitePayload | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(padded)));
    const data = JSON.parse(json) as InvitePayload;
    if (data?.v !== 1 || !data.email || !data.name) return null;
    return data;
  } catch {
    return null;
  }
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      members: [],
      invites: [],
      timeEntries: [],
      hoursScope: 'me',
      calendarView: 'personal',

      ensureOwner: (user) => {
        const { members } = get();
        const existingSelf = members.find((m) => m.id === user.id);
        const existingOwner = members.find((m) => m.role === 'owner');

        if (existingSelf) {
          set({
            members: members.map((m) =>
              m.id === user.id
                ? {
                    ...m,
                    name: user.name,
                    email: user.email,
                    imageUrl: user.imageUrl ?? m.imageUrl,
                    status: 'active',
                  }
                : m
            ),
          });
          return;
        }

        if (existingOwner) {
          // Workspace already has an owner (e.g. after accepting an invite) — join as member.
          set({
            members: [
              ...members,
              {
                id: user.id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl ?? '',
                hoursLogged: 0,
                role: 'member',
                status: 'active',
              },
            ],
          });
          return;
        }

        set({
          members: [
            {
              id: user.id,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl ?? '',
              hoursLogged: 0,
              role: 'owner',
              status: 'active',
            },
            ...members,
          ],
        });
      },

      setHoursScope: (hoursScope) => set({ hoursScope }),
      setCalendarView: (calendarView) => set({ calendarView }),

      inviteMember: ({ name, email, invitedById, invitedByName }) => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const existing = get().members.find((m) => m.email?.toLowerCase() === trimmedEmail);
        if (existing) {
          throw new Error('Someone with this email is already on the team.');
        }
        const pending = get().invites.find(
          (i) => i.email.toLowerCase() === trimmedEmail && i.status === 'pending'
        );
        if (pending) {
          throw new Error('An invite is already pending for this email.');
        }

        const inviteId = uuidv4();
        const token = encodeInviteToken({
          v: 1,
          id: inviteId,
          name: trimmedName,
          email: trimmedEmail,
          invitedById,
          invitedByName,
        });

        const invite: TeamInvite = {
          id: inviteId,
          token,
          name: trimmedName,
          email: trimmedEmail,
          invitedById,
          invitedByName,
          createdAt: nowIso(),
          status: 'pending',
        };

        const pendingMember: TeamMember = {
          id: `pending-${invite.id}`,
          name: trimmedName,
          email: trimmedEmail,
          imageUrl: '',
          hoursLogged: 0,
          role: 'member',
          status: 'pending',
        };

        set((state) => ({
          invites: [invite, ...state.invites],
          members: [...state.members, pendingMember],
        }));

        return invite;
      },

      revokeInvite: (inviteId) => {
        set((state) => ({
          invites: state.invites.map((i) =>
            i.id === inviteId ? { ...i, status: 'revoked' as const } : i
          ),
          members: state.members.filter((m) => m.id !== `pending-${inviteId}`),
        }));
      },

      acceptInvite: (token, accepter) => {
        const existing = get().invites.find((i) => i.token === token);
        const decoded = decodeInviteToken(token);

        if (!existing && !decoded) {
          return { ok: false, error: 'This invite link is invalid or has expired.' };
        }
        if (existing?.status === 'revoked') {
          return { ok: false, error: 'This invite was revoked.' };
        }
        if (existing?.status === 'accepted') {
          return { ok: false, error: 'This invite was already accepted.' };
        }

        const inviteMeta = existing ?? {
          id: decoded!.id,
          token,
          name: decoded!.name,
          email: decoded!.email,
          invitedById: decoded!.invitedById,
          invitedByName: decoded!.invitedByName,
          createdAt: nowIso(),
          status: 'pending' as const,
        };

        const memberId = accepter?.id ?? uuidv4();
        const member: TeamMember = {
          id: memberId,
          name: accepter?.name?.trim() || inviteMeta.name,
          email: accepter?.email?.trim().toLowerCase() || inviteMeta.email,
          imageUrl: accepter?.imageUrl ?? '',
          hoursLogged: 0,
          role: 'member',
          status: 'active',
        };

        // Placeholder owner so the accepter still sees a team workspace
        const placeholderOwner: TeamMember = {
          id: inviteMeta.invitedById,
          name: inviteMeta.invitedByName,
          email: '',
          imageUrl: '',
          hoursLogged: 0,
          role: 'owner',
          status: 'active',
        };

        set((state) => {
          const hasOwner = state.members.some((m) => m.role === 'owner');
          const nextInvites = existing
            ? state.invites.map((i) =>
                i.token === token
                  ? { ...i, status: 'accepted' as const, acceptedAt: nowIso() }
                  : i
              )
            : [
                { ...inviteMeta, status: 'accepted' as const, acceptedAt: nowIso() },
                ...state.invites,
              ];

          const withoutPending = state.members.filter(
            (m) =>
              m.id !== `pending-${inviteMeta.id}` &&
              m.email?.toLowerCase() !== inviteMeta.email.toLowerCase()
          );

          return {
            invites: nextInvites,
            members: [
              ...(hasOwner ? withoutPending : [placeholderOwner, ...withoutPending]),
              member,
            ],
          };
        });

        return { ok: true, member };
      },

      removeMember: (memberId) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== memberId || m.role === 'owner'),
          timeEntries: state.timeEntries.filter((e) => e.memberId !== memberId),
        }));
      },

      addTimeEntry: (input) => {
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
          createdAt: stamp,
          updatedAt: stamp,
        };
        set((state) => ({ timeEntries: [...state.timeEntries, entry] }));
        return entry;
      },

      updateTimeEntry: (id, patch) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === id ? { ...entry, ...patch, updatedAt: nowIso() } : entry
          ),
        }));
      },

      deleteTimeEntry: (id) => {
        set((state) => ({
          timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
        }));
      },

      getMemberHours: (memberId, start, end) => {
        return get()
          .timeEntries.filter((entry) => {
            if (entry.memberId !== memberId || entry.status !== 'confirmed') return false;
            const s = new Date(entry.startTime);
            if (start && s < start) return false;
            if (end && s > end) return false;
            return true;
          })
          .reduce((sum, entry) => sum + entryDurationHours(entry), 0);
      },

      seedDemoTeam: () => {
        const { members, timeEntries } = get();
        if (members.length > 1 || timeEntries.length > 0) return;

        const owner =
          members.find((m) => m.role === 'owner') ??
          ({
            id: 'demo-user',
            name: 'Alex Rivera',
            email: 'alex@example.com',
            imageUrl: '',
            hoursLogged: 0,
            role: 'owner' as const,
            status: 'active' as const,
          } satisfies TeamMember);

        const jayson: TeamMember = {
          id: 'member-jayson',
          name: 'Jayson',
          email: 'jayson@example.com',
          imageUrl: '',
          hoursLogged: 0,
          role: 'member',
          status: 'active',
        };
        const sur: TeamMember = {
          id: 'member-sur',
          name: 'Sur Feldman',
          email: 'sur@example.com',
          imageUrl: '',
          hoursLogged: 0,
          role: 'member',
          status: 'active',
        };

        const weekStart = startOfWeekMonday(new Date());
        const at = (dayOffset: number, hour: number, minute = 0) => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() + dayOffset);
          d.setHours(hour, minute, 0, 0);
          return d.toISOString();
        };

        const demoEntries: TimeEntry[] = [
          {
            id: 'demo-entry-1',
            title: 'Landing polish',
            projectId: 'vrema',
            projectName: 'vrema',
            activityType: 'design',
            startTime: at(0, 9),
            endTime: at(0, 11),
            memberId: owner.id,
            status: 'confirmed',
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
          {
            id: 'demo-entry-2',
            title: 'API work',
            projectId: 'neon',
            projectName: 'neon',
            activityType: 'dev',
            startTime: at(0, 13),
            endTime: at(0, 16),
            memberId: owner.id,
            status: 'confirmed',
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
          {
            id: 'demo-entry-3',
            title: 'Evening review',
            projectId: 'jayman',
            projectName: 'Jayman Jobs',
            activityType: 'meetings',
            startTime: at(0, 19),
            endTime: at(0, 20),
            memberId: jayson.id,
            status: 'confirmed',
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
          {
            id: 'demo-entry-4',
            title: 'Late deploy',
            projectId: 'jayman',
            projectName: 'Jayman Jobs',
            activityType: 'dev',
            startTime: at(0, 22),
            endTime: at(1, 0),
            memberId: jayson.id,
            status: 'draft',
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
        ];

        set({
          members: [owner, jayson, sur],
          timeEntries: demoEntries,
        });
      },
    }),
    {
      name: 'vrema-team-store',
      partialize: (state) => ({
        members: state.members,
        invites: state.invites,
        timeEntries: state.timeEntries,
        hoursScope: state.hoursScope,
        calendarView: state.calendarView,
      }),
    }
  )
);

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
