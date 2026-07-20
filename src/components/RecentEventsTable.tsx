import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSharedState } from '@/hooks/useSharedState';
import { getDateRange, getEventDurationHours, formatHours } from '@/lib/eventStats';
import { parseEventTitle, formatEventDate } from '@/services/googleCalendarService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PAGE_SIZE = 6;

export default function RecentEventsTable() {
  const { events, filters } = useSharedState();
  const [page, setPage] = useState(0);

  const recentEvents = useMemo(() => {
    const { startDate, endDate } = getDateRange(filters.dateRange);

    return events
      .filter((event) => {
        if (!event.summary?.includes('#') || !event.start?.dateTime || !event.end?.dateTime) {
          return false;
        }
        if (getEventDurationHours(event) === null) return false;
        const start = new Date(event.start.dateTime);
        return start >= startDate && start <= endDate;
      })
      .sort(
        (a, b) =>
          new Date(b.start!.dateTime!).getTime() - new Date(a.start!.dateTime!).getTime()
      );
  }, [events, filters.dateRange]);

  const pageCount = Math.max(1, Math.ceil(recentEvents.length / PAGE_SIZE));

  // Keep the current page valid when the underlying data changes.
  useEffect(() => {
    setPage((prev) => Math.min(prev, pageCount - 1));
  }, [pageCount]);

  const pageEvents = useMemo(
    () => recentEvents.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [recentEvents, page]
  );

  const rangeStart = recentEvents.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(recentEvents.length, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-medium">Recent activity</h2>
        <span className="text-xs text-muted-foreground">
          {recentEvents.length} {recentEvents.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface bg-elevated dark:bg-transparent">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium">Project</TableHead>
              <TableHead className="text-xs font-medium">Activity</TableHead>
              <TableHead className="hidden text-xs font-medium sm:table-cell">Description</TableHead>
              <TableHead className="text-xs font-medium">Date</TableHead>
              <TableHead className="text-right text-xs font-medium">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No tracked events in this range.
                </TableCell>
              </TableRow>
            ) : (
              pageEvents.map((event) => {
                const { projectName, activityType, description } = parseEventTitle(
                  event.summary ?? ''
                );
                const hours = getEventDurationHours(event) ?? 0;

                return (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm font-medium">{projectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        #{activityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:table-cell">
                      {description || '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatEventDate(event.start!.dateTime!)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatHours(hours)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {recentEvents.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs text-muted-foreground">
            {rangeStart}–{rangeEnd} of {recentEvents.length}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-7 active:scale-[0.97] transition-transform"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-muted-foreground">
              {page + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7 active:scale-[0.97] transition-transform"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
