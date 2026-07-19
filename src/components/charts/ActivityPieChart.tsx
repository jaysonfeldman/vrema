import { PieChart, Pie, Cell, Label } from 'recharts';
import { Project } from '@/lib/types';
import { formatHours } from '@/lib/eventStats';
import { COLOR_PALETTE } from '@/lib/activityColors';
import { useSharedState } from '@/hooks/useSharedState';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

interface ActivityPieChartProps {
  project: Project;
  className?: string;
}

export default function ActivityPieChart({ project, className }: ActivityPieChartProps) {
  const { activityColors } = useSharedState();

  const chartData = project.activities
    .filter((activity) => activity.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .map((activity, index) => ({
      activity: activity.type,
      hours: activity.hours,
      fill:
        activityColors.find((entry) => entry.type.toLowerCase() === activity.type.toLowerCase())?.color
        ?? COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));

  const chartConfig = chartData.reduce<ChartConfig>((config, item) => {
    config[item.activity] = {
      label: `#${item.activity}`,
      color: item.fill,
    };
    return config;
  }, {});

  if (chartData.length === 0) {
    return (
      <div className={`flex h-40 items-center justify-center text-sm text-zinc-500 ${className ?? ''}`}>
        No activity data
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className={`mx-auto aspect-square h-44 ${className ?? ''}`}>
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <span className="font-mono">
                  {formatHours(Number(value))} · #{String(item.payload.activity)}
                </span>
              )}
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="hours"
          nameKey="activity"
          innerRadius={52}
          outerRadius={72}
          paddingAngle={2}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {chartData.map((entry) => (
            <Cell key={entry.activity} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                return null;
              }

              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-mono font-semibold">
                    {formatHours(project.totalHours)}
                  </tspan>
                  <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground text-[10px]">
                    total
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
