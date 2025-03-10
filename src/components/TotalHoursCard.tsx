
import React from 'react';
import { Activity } from '@/lib/types';
import { 
  CircleSlash, 
  Hourglass,
  PieChart
} from 'lucide-react';
import ActivityTag from './ActivityTag';

interface TotalHoursCardProps {
  totalHours: number;
  formatTime: (hours: number) => string;
  dateRange: number;
  lastSynced: Date | null;
  getActivityHours: (type: string) => number;
  activities?: Activity[];
}

const TotalHoursCard: React.FC<TotalHoursCardProps> = ({
  totalHours,
  formatTime,
  dateRange,
  lastSynced,
  getActivityHours,
  activities
}) => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left column - Total Hours */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Hourglass className="h-8 w-8 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Total hours</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-bold">{formatTime(totalHours)}</p>
              <p className="text-sm text-gray-400">
                in the last {dateRange} days 
                {lastSynced && ` (last synced ${lastSynced.toLocaleTimeString()})`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right column - Activities */}
        <div className="flex-1 md:border-l md:border-gray-700 md:pl-8">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Activities</h3>
          </div>
          
          {totalHours > 0 && activities && activities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <ActivityTag
                  key={activity.id}
                  type={activity.type}
                  hours={activity.hours}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <CircleSlash className="h-12 w-12 text-gray-500 mb-2" />
              <p className="text-gray-400">No data available for this time period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalHoursCard;
