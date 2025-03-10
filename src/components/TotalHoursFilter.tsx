
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TotalHoursFilterProps {
  dateRange: number;
  onDateRangeChange: (value: string) => void;
  titleFilter: string;
  onTitleFilterChange: (value: string) => void;
  activityFilter?: string;
  onActivityFilterChange?: (value: string) => void;
  activities?: string[];
  teamMembers?: Array<{id: string, name: string, avatar: string}>;
  onTeamMemberFilterChange?: (value: string) => void;
  selectedTeamMembers?: string[];
}

const TotalHoursFilter: React.FC<TotalHoursFilterProps> = ({
  dateRange,
  onDateRangeChange,
  titleFilter,
  onTitleFilterChange,
  activityFilter,
  onActivityFilterChange,
  activities = [],
  teamMembers = [],
  onTeamMemberFilterChange,
  selectedTeamMembers = []
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Select
        value={activityFilter}
        onValueChange={onActivityFilterChange || (() => {})}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="All projects" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {activities.map(activity => (
            <SelectItem key={activity} value={activity}>{activity}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activityFilter}
        onValueChange={onActivityFilterChange || (() => {})}
      >
        <SelectTrigger className="w-[150px] bg-white">
          <SelectValue placeholder="All activities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All activities</SelectItem>
          {activities.map(activity => (
            <SelectItem key={activity} value={activity}>{activity}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {teamMembers.length > 0 && (
        <div className="flex items-center bg-white border rounded-md px-2 py-1">
          <div className="flex -space-x-2 mr-2">
            {teamMembers.slice(0, 4).map(member => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
            ))}
            {teamMembers.length > 4 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                +{teamMembers.length - 4}
              </div>
            )}
          </div>
          <span className="text-sm">{teamMembers.length} members</span>
        </div>
      )}
    </div>
  );
};

export default TotalHoursFilter;
