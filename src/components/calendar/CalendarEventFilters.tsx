
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CalendarEventFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  project: string;
  projects: string[];
  onProjectChange: (value: string) => void;
  dateRange: number;
  onDateRangeChange: (days: number) => void;
}

const CalendarEventFilters: React.FC<CalendarEventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  project,
  projects,
  onProjectChange,
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search events..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center">
        <Select
          value={project}
          onValueChange={onProjectChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((projectName) => (
              <SelectItem key={projectName} value={projectName}>
                {projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateRange.toString()}
          onValueChange={(value) => {
            const days = parseInt(value);
            onDateRangeChange(days);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CalendarEventFilters;
