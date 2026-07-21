import { useSharedState } from '@/hooks/useSharedState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WithTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const rangeLabels: Record<string, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
  all: 'All time',
};

export const selectTriggerClass = cn(
  'h-8 w-auto border-0 bg-transparent px-2 text-sm font-medium text-muted-foreground shadow-none',
  'hover:bg-transparent hover:text-foreground focus:ring-0 focus:ring-offset-0',
  'data-[state=open]:text-foreground'
);

export default function DateRangeSelect({
  className,
  triggerClassName,
}: {
  className?: string;
  triggerClassName?: string;
}) {
  const { filters, updateFilters } = useSharedState();

  return (
    <WithTooltip content="Filter by date range" side="bottom">
      <div className={cn('inline-flex', className)}>
        <Select value={filters.dateRange} onValueChange={(value: any) => updateFilters({ dateRange: value })}>
          <SelectTrigger className={cn(selectTriggerClass, triggerClassName)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[9rem] rounded-xl border-surface p-1 shadow-elevated">
            {Object.entries(rangeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value} className="rounded-lg text-sm">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </WithTooltip>
  );
}
