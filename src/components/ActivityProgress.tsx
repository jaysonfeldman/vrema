
import React from 'react';
import { ActivityType } from '@/lib/types';

interface ActivityProgressProps {
  type: ActivityType;
  label: string;
  hours: number;
  totalHours: number;
  formatTime: (hours: number) => string;
}

const ActivityProgress: React.FC<ActivityProgressProps> = ({ 
  type, 
  label, 
  hours, 
  totalHours,
  formatTime 
}) => {
  const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
  
  const getActivityColor = (activityType: ActivityType) => {
    switch (activityType) {
      case 'design': return 'rgb(34, 197, 94)';
      case 'strategy': return 'rgb(59, 130, 246)';
      case 'dev': return 'rgb(168, 85, 247)';
      case 'meetings': return 'rgb(234, 179, 8)';
      case 'admin': 
      default: return 'rgb(239, 68, 68)';
    }
  };

  const color = getActivityColor(type);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium">{formatTime(hours)}</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export default ActivityProgress;
