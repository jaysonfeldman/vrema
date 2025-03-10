
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, Calendar } from 'lucide-react';
import { ActivityType } from '@/lib/types';

interface CalendarEventFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  project: string;
  projects: string[];
  onProjectChange: (value: string) => void;
  dateRange: number;
  onDateRangeChange: (days: number) => void;
  activity?: string;
  onActivityChange?: (value: string) => void;
  activities?: ActivityType[];
}

const CalendarEventFilters: React.FC<CalendarEventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  project,
  projects,
  onProjectChange,
  dateRange,
  onDateRangeChange,
  activity = 'All',
  onActivityChange = () => {},
  activities = []
}) => {
  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const handleActivityFilter = (activityType: string) => {
    if (selectedActivities.includes(activityType)) {
      const newSelected = selectedActivities.filter(a => a !== activityType);
      setSelectedActivities(newSelected);
    } else {
      setSelectedActivities([...selectedActivities, activityType]);
    }
  };

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
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:flex sm:items-center">
        <Popover open={isProjectFilterOpen} onOpenChange={setIsProjectFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-1" />
              Project: {project}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Filter by Project</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="project-all"
                    checked={project === 'All'}
                    onCheckedChange={() => {
                      onProjectChange('All');
                      setIsProjectFilterOpen(false);
                    }}
                  />
                  <Label htmlFor="project-all">All Projects</Label>
                </div>
                {projects.filter(p => p !== 'All').map((projectName) => (
                  <div key={projectName} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`project-${projectName}`}
                      checked={project === projectName}
                      onCheckedChange={() => {
                        onProjectChange(projectName);
                        setIsProjectFilterOpen(false);
                      }}
                    />
                    <Label htmlFor={`project-${projectName}`}>{projectName}</Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activities.length > 0 && (
          <Select
            value={activity}
            onValueChange={onActivityChange}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Activities</SelectItem>
              {activities.map((activityType) => (
                <SelectItem key={activityType} value={activityType}>
                  {activityType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={dateRange.toString()}
          onValueChange={(value) => {
            const days = parseInt(value);
            onDateRangeChange(days);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue placeholder="Time range" />
            </div>
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
