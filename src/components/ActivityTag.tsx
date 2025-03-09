
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
        return 'bg-design';
      case 'strategy':
        return 'bg-strategy';
      case 'dev':
        return 'bg-dev';
      case 'meetings':
        return 'bg-meetings';
      case 'admin':
        return 'bg-admin';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={cn(
        'activity-tag', 
        getTagColor(),
        className
      )}
    >
      {hours}:00 #{type}
    </div>
  );
};

export default ActivityTag;
