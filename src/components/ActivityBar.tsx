import { useEffect, useRef, useState } from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { formatHours } from '@/lib/eventStats';
import { COLOR_PALETTE } from '@/lib/activityColors';
import { cn } from '@/lib/utils';
import { WithTooltip } from '@/components/ui/tooltip';

interface ActivityLike {
  id?: string;
  type: string;
  hours: number;
}

export function useActivityColor() {
  const { activityColors } = useSharedState();
  return (type: string) => {
    const match = activityColors.find((ac) => ac.type.toLowerCase() === type.toLowerCase());
    if (match) return match.color;
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COLOR_PALETTE[hash % COLOR_PALETTE.length];
  };
}

interface ActivityBarProps {
  activities: ActivityLike[];
  size?: 'sm' | 'lg';
  showLegend?: boolean;
  /**
   * `default` — bar + legend with activity name and time (no #).
   * `card` — distribution bar only (labels live elsewhere on the card).
   */
  variant?: 'default' | 'card';
  className?: string;
}

function TimesheetLegend({
  activities,
  getColor,
}: {
  activities: ActivityLike[];
  getColor: (type: string) => string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      setFade({
        left: el.scrollLeft > 2,
        right: max > 2 && el.scrollLeft < max - 2,
      });
    };

    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      ro.disconnect();
    };
  }, [activities]);

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex h-6 items-center gap-5 overflow-x-auto overflow-y-hidden"
      >
        {activities.map((activity) => (
          <WithTooltip
            key={activity.id ?? activity.type}
            content={`${activity.type} · ${formatHours(activity.hours)}`}
          >
            <div className="flex shrink-0 items-center gap-1.5 text-xs">
              <span
                className="size-2 shrink-0 rounded-sm"
                style={{ backgroundColor: getColor(activity.type) }}
              />
              <span className="text-muted-foreground">{activity.type}</span>
              <span className="font-mono font-medium tabular-nums">{formatHours(activity.hours)}</span>
            </div>
          </WithTooltip>
        ))}
      </div>

      {fade.left && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-background to-transparent"
        />
      )}
      {fade.right && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-background to-transparent"
        />
      )}
    </div>
  );
}

export default function ActivityBar({
  activities,
  size = 'sm',
  showLegend = true,
  variant = 'default',
  className,
}: ActivityBarProps) {
  const getColor = useActivityColor();
  const sorted = [...activities].filter((a) => a.hours > 0).sort((a, b) => b.hours - a.hours);
  const total = sorted.reduce((sum, a) => sum + a.hours, 0);
  const barHeight = size === 'lg' ? 'h-2.5' : 'h-2';

  if (total === 0) {
    return <div className={cn(barHeight, 'w-full rounded-full bg-muted', className)} />;
  }

  const bar = (
    <div className={cn('flex w-full overflow-hidden rounded-full bg-muted', barHeight)}>
      {sorted.map((activity) => (
        <WithTooltip
          key={activity.id ?? activity.type}
          content={`${activity.type} · ${formatHours(activity.hours)}`}
        >
          <div
            className="h-full min-w-[2px] transition-all"
            style={{
              width: `${Math.max((activity.hours / total) * 100, 2)}%`,
              backgroundColor: getColor(activity.type),
            }}
          />
        </WithTooltip>
      ))}
    </div>
  );

  if (!showLegend || variant === 'card') {
    return <div className={cn(variant === 'card' && 'mt-auto', className)}>{bar}</div>;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {bar}
      <TimesheetLegend activities={sorted} getColor={getColor} />
    </div>
  );
}
