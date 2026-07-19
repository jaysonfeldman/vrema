import { useSharedState } from '@/hooks/useSharedState';
import { formatHours } from '@/lib/eventStats';
import { cn } from '@/lib/utils';
import { WithTooltip } from '@/components/ui/tooltip';

interface ActivityLike {
  id?: string;
  type: string;
  hours: number;
}

const FALLBACK_COLORS = ['#22C55F', '#6EE7B7', '#7ED3FC', '#FEF18B', '#FED8AA', '#D946EF'];

export function useActivityColor() {
  const { activityColors } = useSharedState();
  return (type: string) => {
    const match = activityColors.find((ac) => ac.type.toLowerCase() === type.toLowerCase());
    if (match) return match.color;
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  };
}

interface ActivityBarProps {
  activities: ActivityLike[];
  size?: 'sm' | 'lg';
  showLegend?: boolean;
  className?: string;
}

export default function ActivityBar({ activities, size = 'sm', showLegend = true, className }: ActivityBarProps) {
  const getColor = useActivityColor();
  const sorted = [...activities].filter((a) => a.hours > 0).sort((a, b) => b.hours - a.hours);
  const total = sorted.reduce((sum, a) => sum + a.hours, 0);

  if (total === 0) {
    return (
      <div className={cn('h-2 w-full rounded-full bg-muted', size === 'lg' && 'h-2.5', className)} />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('flex w-full overflow-hidden rounded-full bg-muted', size === 'lg' ? 'h-2.5' : 'h-2')}>
        {sorted.map((activity) => (
          <WithTooltip
            key={activity.id ?? activity.type}
            content={`#${activity.type} · ${formatHours(activity.hours)}`}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${Math.max((activity.hours / total) * 100, 2)}%`,
                backgroundColor: getColor(activity.type),
              }}
            />
          </WithTooltip>
        ))}
      </div>

      {showLegend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {sorted.map((activity) => (
            <div key={activity.id ?? activity.type} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: getColor(activity.type) }}
              />
              <span className="text-muted-foreground">#{activity.type}</span>
              <span className="font-mono font-medium tabular-nums">{formatHours(activity.hours)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
