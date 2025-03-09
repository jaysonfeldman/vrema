
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
        return 'bg-purple-500';
      case 'strategy':
        return 'bg-blue-500';
      case 'dev':
        return 'bg-green-500';
      case 'meetings':
        return 'bg-yellow-500';
      case 'admin':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={cn(
        'px-3 py-1 rounded text-white text-xs', 
        getTagColor(),
        className
      )}
    >
      {hours}:00 #{type}
    </div>
  );
};

export default ActivityTag;
