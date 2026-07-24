import { useProjectStats } from '@/hooks/useProjectStats';
import { useTeamStore } from '@/hooks/useTeamStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatHours } from '@/lib/eventStats';
import { initialsFromName } from '@/lib/timeEntryUtils';

/** Compact per-member hours strip shown when dashboard scope is Team. */
export function TeamHoursBreakdown() {
  const hoursScope = useTeamStore((s) => s.hoursScope);
  const { memberHourBreakdown } = useProjectStats();

  if (hoursScope !== 'team' || memberHourBreakdown.length === 0) return null;

  const max = Math.max(...memberHourBreakdown.map((row) => row.hours), 0.01);

  return (
    <div className="space-y-2.5 rounded-xl bg-[#f6f6f6] p-3 dark:bg-white/[0.04]">
      <p className="text-xs font-medium text-muted-foreground">Hours by teammate</p>
      <div className="space-y-2">
        {memberHourBreakdown.map(({ member, hours }) => (
          <div key={member.id} className="flex items-center gap-2.5">
            <Avatar className="size-6">
              <AvatarImage src={member.imageUrl} />
              <AvatarFallback className="text-[10px]">{initialsFromName(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{member.name}</span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {formatHours(hours)}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(4, (hours / max) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
