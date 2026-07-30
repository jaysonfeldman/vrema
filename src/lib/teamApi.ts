import type { TeamInvite, TeamMember, TimeEntry } from '@/lib/types';

const TEAM_API_URL =
  import.meta.env.VITE_TEAM_API_URL ||
  'https://gtqdojchjznvkbzfgzei.supabase.co/functions/v1/team';

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type TeamSnapshot = {
  workspace?: { id: string; name: string; owner_id: string } | null;
  members: TeamMember[];
  invites: TeamInvite[];
  timeEntries: TimeEntry[];
};

async function teamRequest<T extends TeamSnapshot>(
  accessToken: string | null,
  body: Record<string, unknown>
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (ANON_KEY) headers.apikey = ANON_KEY;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(TEAM_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Team API failed (${res.status})`);
  }
  return data as T;
}

export const teamApi = {
  bootstrap: (accessToken: string) =>
    teamRequest(accessToken, { action: 'bootstrap' }),

  createInvite: (accessToken: string, input: { name: string; email: string }) =>
    teamRequest<{ invite: TeamInvite } & TeamSnapshot>(accessToken, {
      action: 'invite.create',
      ...input,
    }),

  revokeInvite: (accessToken: string, inviteId: string) =>
    teamRequest(accessToken, { action: 'invite.revoke', inviteId }),

  acceptInvite: (accessToken: string, token: string) =>
    teamRequest(accessToken, { action: 'invite.accept', token }),

  previewInvite: (token: string) =>
    teamRequest<{ invite: { id: string; name: string; email: string; status: string; invitedByName: string } }>(
      null,
      { action: 'invite.preview', token }
    ),

  removeMember: (accessToken: string, memberId: string) =>
    teamRequest(accessToken, { action: 'member.remove', memberId }),

  upsertEntry: (accessToken: string, entry: Partial<TimeEntry> & { googleEventId?: string }) =>
    teamRequest<{ entry: TimeEntry } & TeamSnapshot>(accessToken, {
      action: 'entries.upsert',
      entry,
    }),

  updateEntry: (accessToken: string, id: string, patch: Partial<TimeEntry>) =>
    teamRequest(accessToken, { action: 'entries.update', id, patch }),

  deleteEntry: (accessToken: string, id: string) =>
    teamRequest(accessToken, { action: 'entries.delete', id }),

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
  ) => teamRequest(accessToken, { action: 'entries.syncGoogle', entries }),
};
