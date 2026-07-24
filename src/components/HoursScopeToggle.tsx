import { motion } from 'motion/react';
import { useTeamStore, type HoursScope } from '@/hooks/useTeamStore';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sounds';

const options: { id: HoursScope; label: string }[] = [
  { id: 'me', label: 'You' },
  { id: 'team', label: 'Team' },
];

export function HoursScopeToggle({ className }: { className?: string }) {
  const hoursScope = useTeamStore((s) => s.hoursScope);
  const setHoursScope = useTeamStore((s) => s.setHoursScope);
  const members = useTeamStore((s) => s.members);
  const hasTeam = members.filter((m) => m.status === 'active').length > 1;

  if (!hasTeam) return null;

  return (
    <div
      className={cn(
        'inline-flex rounded-lg bg-[#f6f6f6] p-0.5 dark:bg-white/[0.06]',
        className
      )}
    >
      {options.map((option) => {
        const active = hoursScope === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (option.id !== hoursScope) {
                sound.toggle(option.id === 'team');
                setHoursScope(option.id);
              }
            }}
            className={cn(
              'relative rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId="hours-scope-pill"
                className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-elevated"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
