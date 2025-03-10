
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TotalHoursFilterProps {
  dateRange: number;
  onDateRangeChange: (value: string) => void;
  titleFilter: string;
  onTitleFilterChange: (value: string) => void;
  activityFilter?: string;
  onActivityFilterChange?: (value: string) => void;
  activities?: string[];
}

const TotalHoursFilter: React.FC<TotalHoursFilterProps> = ({
  dateRange,
  onDateRangeChange,
  titleFilter,
  onTitleFilterChange,
  activityFilter,
  onActivityFilterChange,
  activities = []
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Filter by title" 
          className="pl-9 w-[200px]"
          value={titleFilter}
          onChange={(e) => onTitleFilterChange(e.target.value)}
        />
      </div>

      {onActivityFilterChange && (
        <Select
          value={activityFilter}
          onValueChange={onActivityFilterChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activities</SelectItem>
            {activities.map(activity => (
              <SelectItem key={activity} value={activity}>{activity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={dateRange.toString()}
        onValueChange={onDateRangeChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="14">Last 14 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 3 months</SelectItem>
          <SelectItem value="180">Last 6 months</SelectItem>
          <SelectItem value="365">Last year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TotalHoursFilter;
