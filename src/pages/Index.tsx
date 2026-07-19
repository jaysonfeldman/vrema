import React from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useSharedState } from '@/hooks/useSharedState';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours } from '@/lib/eventStats';
import { Activity } from '@/lib/types';
import ActivityBar from '@/components/ActivityBar';
import ProjectsOverview from '@/components/ProjectsOverview';
import RecentEventsTable from '@/components/RecentEventsTable';
import DateRangeSelect, { rangeLabels } from '@/components/DateRangeSelect';
import DashboardBanner from '@/components/DashboardBanner';

export default function Dashboard() {
  const { authState } = useGoogleAuth();
  const { user: supabaseUser } = useAuth();
  const { syncCalendar } = useCalendarSync();
  const { lastSynced, filters } = useSharedState();
  const { filteredProjects } = useProjectStats();

  React.useEffect(() => {
    if (authState.isAuthenticated && !lastSynced) {
      syncCalendar();
    }
  }, [authState.isAuthenticated, lastSynced, syncCalendar]);

  const totalHours = filteredProjects.reduce((sum, p) => sum + p.totalHours, 0);

  const activities = React.useMemo(() => {
    const map = new Map<string, Activity>();
    filteredProjects
      .flatMap((p) => p.activities)
      .forEach((activity) => {
        const key = activity.type.toLowerCase();
        const existing = map.get(key);
        if (existing) existing.hours += activity.hours;
        else map.set(key, { ...activity });
      });
    return Array.from(map.values());
  }, [filteredProjects]);

  const firstName =
    authState.user?.name?.split(' ')[0] ?? supabaseUser?.name?.split(' ')[0];

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardBanner />

      <div className="relative z-10 -mt-40 flex-1 px-4 pb-6 md:-mt-52 md:px-8 md:pb-8">
        <div className="mx-auto w-full max-w-3xl space-y-8 rounded-2xl border border-[#ebebeb] bg-elevated p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] md:p-8 dark:border-white/[0.08] dark:shadow-none">
          {/* Hero */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Welcome back{firstName ? `, ${firstName}` : ''}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                  Your time at a glance
                </h2>
              </div>
              <DateRangeSelect className="mt-0.5" />
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums md:text-6xl">
                  {formatHours(totalHours)}
                </span>
                <span className="mb-1.5 text-sm text-muted-foreground">
                  {rangeLabels[filters.dateRange].toLowerCase()}
                </span>
              </div>

              {totalHours > 0 ? (
                <ActivityBar activities={activities} size="lg" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tracked time yet. Name calendar events like{' '}
                  <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">mx#design user flows</code>{' '}
                  to get started.
                </p>
              )}
            </div>
          </section>

          <ProjectsOverview />
          <RecentEventsTable />
        </div>
      </div>
    </div>
  );
}
