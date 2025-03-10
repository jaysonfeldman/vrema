
import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/lib/types';
import { stringToColor } from '@/lib/utils';

interface ActivityTagProps {
  type: ActivityType;
  hours: number;
  className?: string;
}

const ActivityTag: React.FC<ActivityTagProps> = ({ type, hours, className }) => {
  // Generate a consistent color based on the activity type string
  const getTagColor = () => {
    // Map common activity types to specific colors for consistency
    switch (type.toLowerCase()) {
      case 'design':
        return 'bg-green-500';
      case 'strategy':
        return 'bg-teal-500';
      case 'dev':
        return 'bg-blue-500';
      case 'meetings':
        return 'bg-gray-300';
      case 'admin':
        return 'bg-yellow-400';
      case 'pm':
        return 'bg-purple-500';
      default:
        // For any other activity type, generate a consistent color based on the string
        return `bg-[${stringToColor(type)}]`;
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
        'px-3 py-1 rounded-md text-xs inline-flex items-center', 
        getTagColor(),
        className
      )}
    >
      {formatHours(hours)} #{type}
    </div>
  );
};

export default ActivityTag;
