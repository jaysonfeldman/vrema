
import React from 'react';
import { Activity } from '@/lib/types';
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
    <div className="p-6 bg-gray-900 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        {/* Total Hours */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Total hours</h3>
          <p className="text-5xl font-mono font-bold text-white">{formatTime(totalHours)}</p>
          <p className="text-sm text-gray-400 mt-1">
            over the past {dateRange} days
            {lastSynced && (
              <span className="ml-1">
                · last sync {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        
        {/* Activities */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Activities</h3>
          
          {activities && activities.length > 0 ? (
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
            <p className="text-gray-400">No activities found in this time period</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalHoursCard;
