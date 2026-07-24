import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Users } from 'lucide-react';
import { WeekCalendar } from '@/components/calendar-tracker/WeekCalendar';
import { TeamRosterView } from '@/components/calendar-tracker/TeamRosterView';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sounds';

export default function CalendarPage() {
  const { authState, isDemoMode } = useGoogleAuth();
  const calendarView = useTeamStore((s) => s.calendarView);
  const setCalendarView = useTeamStore((s) => s.setCalendarView);
  const ensureOwner = useTeamStore((s) => s.ensureOwner);
  const seedDemoTeam = useTeamStore((s) => s.seedDemoTeam);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

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

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
      <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-wrap items-end justify-between gap-4 pb-5">
        <header className="space-y-1">
          <p className="text-base font-semibold tracking-tight text-foreground/30">Calendar</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">Track your time</h1>
        </header>

        <div className="inline-flex rounded-xl bg-[#f6f6f6] p-1 dark:bg-white/[0.06]">
          {(
            [
              { id: 'personal' as const, label: 'My week', icon: CalendarDays },
              { id: 'team' as const, label: 'Team', icon: Users },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = calendarView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.toggle(id === 'team');
                  setCalendarView(id);
                }}
                className={cn(
                  'relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="calendar-view-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-elevated"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'mx-auto w-full max-w-6xl',
          calendarView === 'personal' ? 'min-h-0 flex-1' : 'shrink-0'
        )}
      >
        {calendarView === 'personal' ? (
          <WeekCalendar weekAnchor={weekAnchor} onWeekChange={setWeekAnchor} />
        ) : (
          <TeamRosterView weekAnchor={weekAnchor} onWeekChange={setWeekAnchor} />
        )}
      </div>
    </div>
  );
}
