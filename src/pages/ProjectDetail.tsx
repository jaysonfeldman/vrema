import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { formatHours } from '@/lib/eventStats';
import ActivityPieChart from '@/components/charts/ActivityPieChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { events } = useSharedState();
  const { allProjects } = useProjectStats();

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

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
          <ChevronLeft className="h-4 w-4" /> Back to projects
        </Button>
        <p className="py-12 text-center text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate('/projects')}>
        <ChevronLeft className="h-4 w-4" /> Back to projects
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              {formatHours(project.totalHours)}
            </Badge>
            <Badge variant="secondary">
              <Calendar className="mr-1 h-3 w-3" />
              {projectEvents.length} events
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Activity split</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ActivityPieChart project={project} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      No events found for this project.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectEvents.map((event) => {
                    const { activityType, description } = parseEventTitle(event.summary ?? '');
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge variant="outline">#{activityType}</Badge>
                        </TableCell>
                        <TableCell>{description || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatEventDate(event.start!.dateTime!)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {calculateDuration(event.start!.dateTime!, event.end!.dateTime!)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
