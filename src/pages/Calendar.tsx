import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { WeekCalendar } from '@/components/calendar-tracker/WeekCalendar';
import { TeamRosterView } from '@/components/calendar-tracker/TeamRosterView';
import { CalendarDaysIcon, type CalendarDaysIconHandle } from '@/components/icons/calendar-days';
import { UsersIcon, type UsersIconHandle } from '@/components/icons/users';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sounds';

type ViewTab = {
  id: 'personal' | 'team';
  label: string;
};

const VIEW_TABS: ViewTab[] = [
  { id: 'personal', label: 'My week' },
  { id: 'team', label: 'Team' },
];

function CalendarViewTab({
  id,
  label,
  active,
  onSelect,
}: ViewTab & { active: boolean; onSelect: () => void }) {
  const calendarIconRef = useRef<CalendarDaysIconHandle>(null);
  const usersIconRef = useRef<UsersIconHandle>(null);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => {
        if (id === 'personal') calendarIconRef.current?.startAnimation();
        else usersIconRef.current?.startAnimation();
      }}
      onMouseLeave={() => {
        if (id === 'personal') calendarIconRef.current?.stopAnimation();
        else usersIconRef.current?.stopAnimation();
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
        {id === 'personal' ? (
          <CalendarDaysIcon ref={calendarIconRef} size={14} className="size-3.5 shrink-0" />
        ) : (
          <UsersIcon ref={usersIconRef} size={14} className="size-3.5 shrink-0" />
        )}
        {label}
      </span>
    </button>
  );
}

export default function CalendarPage() {
  const { isDemoMode } = useGoogleAuth();
  const calendarView = useTeamStore((s) => s.calendarView);
  const setCalendarView = useTeamStore((s) => s.setCalendarView);
  const seedDemoTeam = useTeamStore((s) => s.seedDemoTeam);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());

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
          {VIEW_TABS.map(({ id, label }) => (
            <CalendarViewTab
              key={id}
              id={id}
              label={label}
              active={calendarView === id}
              onSelect={() => {
                sound.toggle(id === 'team');
                setCalendarView(id);
              }}
            />
          ))}
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
