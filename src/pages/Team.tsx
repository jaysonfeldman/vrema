import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { initialsFromName } from '@/lib/timeEntryUtils';
import { formatHours, getDateRange } from '@/lib/eventStats';
import { useSharedState } from '@/hooks/useSharedState';
import { sound } from '@/lib/sounds';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const { authState, isDemoMode } = useGoogleAuth();
  const members = useTeamStore((s) => s.members);
  const invites = useTeamStore((s) => s.invites);
  const ensureOwner = useTeamStore((s) => s.ensureOwner);
  const seedDemoTeam = useTeamStore((s) => s.seedDemoTeam);
  const removeMember = useTeamStore((s) => s.removeMember);
  const revokeInvite = useTeamStore((s) => s.revokeInvite);
  const getMemberHours = useTeamStore((s) => s.getMemberHours);
  const filters = useSharedState((s) => s.filters);
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (authState.user) {
      ensureOwner({
        id: authState.user.id,
        name: authState.user.name,
        email: authState.user.email,
        imageUrl: authState.user.imageUrl,
      });
    }
  }, [authState.user, ensureOwner]);

  useEffect(() => {
    if (isDemoMode) seedDemoTeam();
  }, [isDemoMode, seedDemoTeam]);

  const { startDate, endDate } = useMemo(() => getDateRange(filters.dateRange), [filters.dateRange]);

  const rows = useMemo(() => {
    return members.map((member) => {
      const hours = getMemberHours(member.id, startDate, endDate);
      const pendingInvite = invites.find(
        (i) => i.status === 'pending' && i.email === member.email?.toLowerCase()
      );
      return { member, hours, pendingInvite };
    });
  }, [members, invites, getMemberHours, startDate, endDate]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pt-6 md:pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-base font-semibold tracking-tight text-foreground/30">Team</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">Members</h1>
          <p className="text-sm text-muted-foreground">
            Invite people to log hours on your team calendar.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 rounded-xl"
          onClick={() => {
            sound.click();
            setInviteOpen(true);
          }}
        >
          <UserPlus className="size-3.5" />
          Invite
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-medium">People</h2>

        {rows.length === 0 ? (
          <div className="rounded-xl bg-[#f6f6f6] px-4 py-10 text-center dark:bg-white/[0.04]">
            <p className="text-sm font-medium">No teammates yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Invite someone to start tracking together.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-4 h-9 gap-1.5 rounded-xl"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-3.5" />
              Invite member
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[#ebebeb] overflow-hidden rounded-xl bg-[#f6f6f6] dark:divide-white/[0.06] dark:bg-white/[0.04]">
            {rows.map(({ member, hours, pendingInvite }) => {
              const statusLabel =
                member.role === 'owner'
                  ? 'Owner'
                  : member.status === 'pending'
                    ? 'Pending'
                    : 'Active';

              return (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-xs">{initialsFromName(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email || '—'}</p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="font-mono text-sm font-medium tabular-nums">{formatHours(hours)}</p>
                    <p className="text-[11px] text-muted-foreground">{statusLabel}</p>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium sm:hidden',
                      member.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'bg-white text-muted-foreground shadow-sm dark:bg-white/[0.06]'
                    )}
                  >
                    {statusLabel}
                  </span>

                  {/* Always reserve the action slot so rows stay aligned */}
                  <div className="flex size-8 shrink-0 items-center justify-center">
                    {member.role !== 'owner' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-muted-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Member actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {pendingInvite && (
                            <>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const url = `${window.location.origin}/invite/${pendingInvite.token}`;
                                  await navigator.clipboard.writeText(url);
                                  toast({ title: 'Invite link copied' });
                                  sound.pop();
                                }}
                              >
                                Copy invite link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  revokeInvite(pendingInvite.id);
                                  toast({ title: 'Invite revoked' });
                                }}
                              >
                                Revoke invite
                              </DropdownMenuItem>
                            </>
                          )}
                          {member.status === 'active' && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                removeMember(member.id);
                                toast({ title: 'Member removed' });
                                sound.pop();
                              }}
                            >
                              Remove from team
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
