import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock } from 'lucide-react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { formatHours } from '@/lib/eventStats';
import ActivityBar, { useActivityColor } from '@/components/ActivityBar';
import ActivityPieChart from '@/components/charts/ActivityPieChart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { events } = useSharedState();
  const { allProjects } = useProjectStats();
  const getColor = useActivityColor();

  const project = allProjects.find((p) => p.id === projectId) ?? null;

  const projectEvents = useMemo(() => {
    if (!project) return [];
    return events
      .filter((event) => {
        if (!event.summary || !event.summary.includes('#')) return false;
        const { projectName } = parseEventTitle(event.summary);
        return projectName.toLowerCase() === project.name.toLowerCase();
      })
      .sort((a, b) => new Date(b.start!.dateTime!).getTime() - new Date(a.start!.dateTime!).getTime());
  }, [events, project]);

  const goBack = () => navigate('/');

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 pt-6 md:pt-8">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1" onClick={goBack}>
          <ChevronLeft className="size-4" />
          Back to dashboard
        </Button>
        <p className="py-12 text-center text-sm text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const activities = [...project.activities]
    .filter((a) => a.hours > 0)
    .sort((a, b) => b.hours - a.hours);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 pt-6 md:pt-8">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground" onClick={goBack}>
          <ChevronLeft className="size-4" />
          Back to dashboard
        </Button>

        <header className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-semibold tracking-tight text-foreground/30">Project</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{project.name}</h1>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-2.5">
              <span className="font-mono text-4xl font-semibold leading-none tracking-tight tabular-nums md:text-5xl">
                {formatHours(project.totalHours)}
              </span>
              <span className="mb-1 text-sm text-muted-foreground">total hours</span>
            </div>
            <p className="mb-1 text-sm text-muted-foreground">
              {projectEvents.length} event{projectEvents.length === 1 ? '' : 's'}
            </p>
          </div>

          {activities.length > 0 && <ActivityBar activities={activities} size="lg" />}
        </header>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:gap-10">
        <section className="space-y-3">
          <h2 className="text-base font-medium">Activities</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities yet.</p>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <ActivityPieChart project={project} className="!mx-0" />
              <ul className="w-full space-y-2">
                {activities.map((activity) => (
                  <li key={activity.id ?? activity.type} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-sm"
                        style={{ backgroundColor: getColor(activity.type) }}
                      />
                      <span className="truncate text-muted-foreground">#{activity.type}</span>
                    </span>
                    <span className="font-mono text-xs font-medium tabular-nums">
                      {formatHours(activity.hours)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium">Events</h2>
          {projectEvents.length === 0 ? (
            <p className="rounded-xl bg-[#f6f6f6] px-4 py-8 text-center text-sm text-muted-foreground dark:bg-white/[0.04]">
              No events found for this project.
            </p>
          ) : (
            <ul className="divide-y divide-[#ebebeb] overflow-hidden rounded-xl bg-[#f6f6f6] dark:divide-white/[0.06] dark:bg-white/[0.04]">
              {projectEvents.map((event) => {
                const { activityType, description } = parseEventTitle(event.summary ?? '');
                return (
                  <li
                    key={event.id}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium'
                          )}
                          style={{
                            backgroundColor: `${getColor(activityType)}18`,
                            color: getColor(activityType),
                          }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: getColor(activityType) }}
                          />
                          #{activityType}
                        </span>
                        <span className="truncate text-sm text-foreground">
                          {description || '—'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.start!.dateTime!)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-medium tabular-nums text-muted-foreground sm:shrink-0">
                      <Clock className="size-3" />
                      {calculateDuration(event.start!.dateTime!, event.end!.dateTime!)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
