import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours } from '@/lib/eventStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function WeeklyProjectHours() {
  const { weeklySummaries } = useProjectStats();

  const projectNames = Array.from(
    new Set(weeklySummaries.flatMap((week) => week.projects.map((project) => project.name)))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly time by project</CardTitle>
        <CardDescription>Hours per project across the last 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        {projectNames.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No tracked time yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                {weeklySummaries.map((week) => (
                  <TableHead key={week.weekLabel} className="text-right">
                    {week.weekLabel}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectNames.map((projectName) => (
                <TableRow key={projectName}>
                  <TableCell className="font-medium">{projectName}</TableCell>
                  {weeklySummaries.map((week) => {
                    const project = week.projects.find((entry) => entry.name === projectName);
                    return (
                      <TableCell key={`${projectName}-${week.weekLabel}`} className="text-right font-mono text-muted-foreground">
                        {project ? formatHours(project.hours) : '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell className="font-semibold">Total</TableCell>
                {weeklySummaries.map((week) => (
                  <TableCell key={`total-${week.weekLabel}`} className="text-right font-mono font-semibold">
                    {formatHours(week.totalHours)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
