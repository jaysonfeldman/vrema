
import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/lib/types';

interface ActivityTagProps {
  type: ActivityType;
  hours: number;
  className?: string;
}

const ActivityTag: React.FC<ActivityTagProps> = ({ type, hours, className }) => {
  const getTagColor = () => {
    switch (type) {
      case 'design':
        return 'bg-green-500';
      case 'strategy':
        return 'bg-blue-500';
      case 'dev':
        return 'bg-purple-500';
      case 'meetings':
        return 'bg-yellow-500';
      case 'admin':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format hours to show as "40:00" for example
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        'px-3 py-1 rounded-md text-white text-xs inline-flex items-center', 
        getTagColor(),
        className
      )}
    >
      {formatHours(hours)} #{type}
    </div>
  );
};

export default ActivityTag;
