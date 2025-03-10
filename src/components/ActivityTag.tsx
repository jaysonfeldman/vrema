
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
    const colorMap: Record<string, string> = {
      'design': 'bg-green-500',
      'strategy': 'bg-teal-500',
      'dev': 'bg-blue-500',
      'meetings': 'bg-gray-300',
      'admin': 'bg-yellow-400',
      'pm': 'bg-purple-500',
      'ux': 'bg-pink-500',
      'research': 'bg-indigo-500',
      'marketing': 'bg-orange-500',
      'sales': 'bg-emerald-500',
      'support': 'bg-sky-500',
      'other': 'bg-slate-400'
    };
    
    const normalizedType = type.toLowerCase();
    if (colorMap[normalizedType]) {
      return colorMap[normalizedType];
    }
    
    // For any other activity type, generate a consistent color based on the string
    const generatedColor = stringToColor(type);
    return `bg-[${generatedColor}]`;
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
        'px-3 py-1 rounded-md text-sm inline-flex items-center justify-center shadow-sm', 
        getTagColor(),
        className
      )}
    >
      <span className="font-mono font-medium">{formatHours(hours)}</span>
      <span className="ml-1">#{type}</span>
    </div>
  );
};

export default ActivityTag;
