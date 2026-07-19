import { useMemo } from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours } from '@/lib/eventStats';
import DateRangeSelect from '@/components/DateRangeSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const FALLBACK_COLORS = ['#22C55E', '#6EE7B7', '#7ED3FC', '#FEF18B', '#FED8AA', '#D946EF'];

export default function Activities() {
  const { activityColors } = useSharedState();
  const { filteredProjects } = useProjectStats();

  const getColor = (type: string) => {
    const match = activityColors.find((ac) => ac.type.toLowerCase() === type.toLowerCase());
    if (match) return match.color;
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  };

  const activities = useMemo(() => {
    const map = new Map<string, { type: string; hours: number; projects: Set<string> }>();
    filteredProjects.forEach((project) => {
      project.activities.forEach((activity) => {
        const key = activity.type.toLowerCase();
        const entry = map.get(key) ?? { type: activity.type, hours: 0, projects: new Set<string>() };
        entry.hours += activity.hours;
        entry.projects.add(project.name);
        map.set(key, entry);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [filteredProjects]);

  const total = activities.reduce((sum, a) => sum + a.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Activities</h2>
          <p className="text-sm text-muted-foreground">How your time splits across activity categories</p>
        </div>
        <DateRangeSelect />
      </div>

      {activities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No activity data for this period.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => {
            const percent = total > 0 ? (activity.hours / total) * 100 : 0;
            return (
              <Card key={activity.type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getColor(activity.type) }} />
                    #{activity.type}
                  </CardTitle>
                  <span className="font-mono text-lg font-semibold">{formatHours(activity.hours)}</span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={percent} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percent.toFixed(0)}% of tracked time</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {Array.from(activity.projects).slice(0, 3).map((name) => (
                        <Badge key={name} variant="secondary" className="font-normal">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
