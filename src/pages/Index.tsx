import React from 'react';
import { motion } from 'motion/react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
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
import InvoiceCreator from '@/components/invoice/InvoiceCreator';
import { HoursScopeToggle } from '@/components/HoursScopeToggle';
import { TeamHoursBreakdown } from '@/components/TeamHoursBreakdown';
import { useTeamStore } from '@/hooks/useTeamStore';
import { Link } from 'react-router-dom';
import { useAppPath } from '@/lib/app-paths';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { UploadIcon, type UploadIconHandle } from '@/components/icons/upload';
import { FileTextIcon, type FileTextIconHandle } from '@/components/icons/file-text';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const cardClass =
  'w-full space-y-8 rounded-2xl border border-[#ebebeb] bg-elevated p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] md:p-8 dark:border-white/[0.08] dark:shadow-none';

export default function Dashboard() {
  const { authState, isDemoMode } = useGoogleAuth();
  const { syncCalendar } = useCalendarSync();
  const { lastSynced, filters, ensureActivityColors } = useSharedState();
  const { filteredProjects } = useProjectStats();
  const hoursScope = useTeamStore((s) => s.hoursScope);
  const appPath = useAppPath();
  const { toast } = useToast();
  const uploadIconRef = React.useRef<UploadIconHandle>(null);
  const invoiceIconRef = React.useRef<FileTextIconHandle>(null);

  const [showInvoice, setShowInvoice] = React.useState(false);
  const frontRef = React.useRef<HTMLDivElement>(null);
  const backRef = React.useRef<HTMLDivElement>(null);
  const [faceHeights, setFaceHeights] = React.useState({ front: 0, back: 0 });

  React.useLayoutEffect(() => {
    const measure = () =>
      setFaceHeights({
        front: frontRef.current?.offsetHeight ?? 0,
        back: backRef.current?.offsetHeight ?? 0,
      });
    measure();
    const ro = new ResizeObserver(measure);
    if (frontRef.current) ro.observe(frontRef.current);
    if (backRef.current) ro.observe(backRef.current);
    return () => ro.disconnect();
  }, []);

  const activeHeight = showInvoice ? faceHeights.back : faceHeights.front;

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

  React.useEffect(() => {
    ensureActivityColors(activities.map((a) => a.type));
  }, [activities, ensureActivityColors]);

  const firstName = authState.user?.name?.split(' ')[0];

  const handleExportHours = () => {
    const rangeLabel = rangeLabels[filters.dateRange];
    const rows = [
      ['Project', 'Hours'],
      ...filteredProjects.map((project) => [project.name, formatHours(project.totalHours)]),
      ['Total', formatHours(totalHours)],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vrema-hours-${rangeLabel.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Hours exported', description: `Downloaded CSV for ${rangeLabel.toLowerCase()}.` });
  };

  return (
    <div className="flex min-h-full flex-col">
      <DashboardBanner />

      <div className="relative z-10 -mt-40 flex-1 px-4 pb-6 md:-mt-52 md:px-8 md:pb-8">
        <div className="mx-auto w-full max-w-3xl" style={{ perspective: 2200 }}>
          <motion.div
            className="relative w-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: showInvoice ? 180 : 0, height: activeHeight || 'auto' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Front: timesheet */}
            <div
              ref={frontRef}
              className="absolute inset-x-0 top-0"
              style={{ backfaceVisibility: 'hidden', pointerEvents: showInvoice ? 'none' : 'auto' }}
              aria-hidden={showInvoice}
            >
              <div className={cardClass}>
                {/* Hero */}
                <section className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold tracking-tight text-foreground/30">
                        Welcome back{firstName ? `, ${firstName}` : ''}
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                        Your timesheet
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInvoice(true)}
                        onMouseEnter={() => invoiceIconRef.current?.startAnimation()}
                        onMouseLeave={() => invoiceIconRef.current?.stopAnimation()}
                        className="gap-1.5 rounded-lg border-[#ebebeb] bg-white text-neutral-950 shadow-sm hover:bg-neutral-50 hover:text-neutral-950 active:scale-[0.97] dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <FileTextIcon ref={invoiceIconRef} size={15} className="shrink-0" />
                        Create invoice
                      </Button>
                      {(() => {
                        const exportButton = (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportHours}
                            onMouseEnter={() => uploadIconRef.current?.startAnimation()}
                            onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
                            className={cn(
                              'gap-1.5 rounded-lg border-[#ebebeb] bg-white text-neutral-950 shadow-sm hover:bg-neutral-50 hover:text-neutral-950 active:scale-[0.97] dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5 dark:hover:text-white',
                              isDemoMode && 'cursor-default active:scale-100'
                            )}
                          >
                            <UploadIcon ref={uploadIconRef} size={14} className="shrink-0" />
                            Export hours
                          </Button>
                        );

                        return isDemoMode ? (
                          exportButton
                        ) : (
                          <WithTooltip content="Download hours as CSV">{exportButton}</WithTooltip>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-end gap-2.5">
                        <span className="font-mono text-5xl font-semibold leading-none tracking-tight tabular-nums md:text-6xl">
                          {formatHours(totalHours)}
                        </span>
                        <span className="mb-1 text-sm text-muted-foreground md:mb-1.5">
                          {hoursScope === 'team' ? 'team hours' : 'total hours'}
                        </span>
                      </div>
                      <div className="mb-1 flex items-center gap-2 md:mb-1.5">
                        <HoursScopeToggle />
                        <DateRangeSelect />
                      </div>
                    </div>

                    {totalHours > 0 ? (
                      <ActivityBar activities={activities} size="lg" />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tracked time yet. Drag to create entries on the{' '}
                        <Link to={appPath('/calendar')} className="font-medium text-foreground underline-offset-4 hover:underline">
                          calendar
                        </Link>
                        , or name Google events like{' '}
                        <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">vrema#design homepage mockups</code>.
                      </p>
                    )}

                    <TeamHoursBreakdown />
                  </div>
                </section>

                <ProjectsOverview />
                <RecentEventsTable />
              </div>
            </div>

            {/* Back: invoice creator */}
            <div
              ref={backRef}
              className="absolute inset-x-0 top-0"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                pointerEvents: showInvoice ? 'auto' : 'none',
              }}
              aria-hidden={!showInvoice}
            >
              <div className={cardClass}>
                <InvoiceCreator
                  projects={filteredProjects}
                  user={authState.user}
                  rangeLabel={rangeLabels[filters.dateRange]}
                  rangeKey={filters.dateRange}
                  onBack={() => setShowInvoice(false)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
