
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import ActivityProgress from './ActivityProgress';
import { ActivityType } from '@/lib/types';

interface TotalHoursCardProps {
  totalHours: number;
  formatTime: (hours: number) => string;
  dateRange: number;
  lastSynced: Date | null;
  getActivityHours: (type: ActivityType) => number;
}

const TotalHoursCard: React.FC<TotalHoursCardProps> = ({
  totalHours,
  formatTime,
  dateRange,
  lastSynced,
  getActivityHours
}) => {
  // Activity types configuration
  const activityTypes: { type: ActivityType, label: string }[] = [
    { type: 'design', label: 'Design' },
    { type: 'strategy', label: 'Strategy' },
    { type: 'dev', label: 'Development' },
    { type: 'meetings', label: 'Meetings' },
    { type: 'admin', label: 'Admin' }
  ];

  return (
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between gap-6">
        {/* Total hours display */}
        <div className="flex flex-col">
          <div className="text-gray-400 text-sm mb-1">Total hours</div>
          <div className="text-4xl font-bold mb-2">{formatTime(totalHours)}</div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {dateRange === 30 ? 'Last 30 days' : 
               dateRange === 7 ? 'Last week' : 
               dateRange === 90 ? 'Last 3 months' : 
               `Last ${dateRange} days`}
            </span>
            {lastSynced && (
              <Badge variant="outline" className="bg-transparent border-gray-700 text-gray-300 ml-2">
                Last synced: {format(lastSynced, 'MMM d, h:mm a')}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Activities */}
        <div className="flex-1">
          <div className="text-gray-400 text-sm mb-3">Activities</div>
          <div className="space-y-4">
            {activityTypes.map(activity => (
              <ActivityProgress
                key={activity.type}
                type={activity.type}
                label={activity.label}
                hours={getActivityHours(activity.type)}
                totalHours={totalHours}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  );
};

export default TotalHoursCard;
