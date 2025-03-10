
import React from 'react';
import { Activity } from '@/lib/types';
import { 
  CircleSlash, 
  Hourglass, 
  Code,
  Paintbrush,
  CalendarDays,
  Users,
  PieChart,
  FileText
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
            <h3 className="text-xl font-semibold text-white">Total tracked time</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-bold">{formatTime(totalHours)}</p>
              <p className="text-sm text-gray-400">
                in the last {dateRange} days 
                {lastSynced && ` (last synced ${lastSynced.toLocaleTimeString()})`}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities && activities.map((activity) => (
                  <ActivityTag
                    key={activity.id}
                    type={activity.type}
                    hours={activity.hours}
                    className="justify-between w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Visual breakdown */}
        <div className="flex-1 md:border-l md:border-gray-700 md:pl-8">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Breakdown</h3>
          </div>
          
          {totalHours > 0 ? (
            <div className="space-y-4">
              {activities && activities.slice(0, 5).map((activity) => {
                const percentage = (activity.hours / totalHours) * 100;
                return (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full block" style={{
                        backgroundColor: activity.type === 'design' ? 'rgb(34, 197, 94)' :
                          activity.type === 'strategy' ? 'rgb(59, 130, 246)' :
                          activity.type === 'dev' ? 'rgb(168, 85, 247)' :
                          activity.type === 'meetings' ? 'rgb(234, 179, 8)' :
                          activity.type === 'admin' ? 'rgb(239, 68, 68)' : 
                          '#' + activity.type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).slice(-6)
                      }}></span>
                      <span className="text-sm">{activity.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: activity.type === 'design' ? 'rgb(34, 197, 94)' :
                              activity.type === 'strategy' ? 'rgb(59, 130, 246)' :
                              activity.type === 'dev' ? 'rgb(168, 85, 247)' :
                              activity.type === 'meetings' ? 'rgb(234, 179, 8)' :
                              activity.type === 'admin' ? 'rgb(239, 68, 68)' : 
                              '#' + activity.type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).slice(-6)
                          }}
                        ></div>
                      </div>
                      <span className="text-sm">{formatTime(activity.hours)}</span>
                    </div>
                  </div>
                );
              })}
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
