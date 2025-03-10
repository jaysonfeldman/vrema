import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/lib/types';

interface ActivityTagProps {
  type: ActivityType;
  hours: number;
  className?: string;
}

const ActivityTag: React.FC<ActivityTagProps> = ({ type, hours, className }) => {
  // Format hours to show as "40:00" for example
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get the appropriate background color for the activity type
  const getTagColor = () => {
    const colorMap: Record<string, string> = {
      'design': 'bg-[#10b981] text-white',
      'strategy': 'bg-[#3b82f6] text-white',
      'dev': 'bg-[#6366f1] text-white',
      'meetings': 'bg-[#8b5cf6] text-white',
      'admin': 'bg-[#f59e0b] text-white',
      'pm': 'bg-[#ec4899] text-white',
      'ux': 'bg-[#14b8a6] text-white',
      'research': 'bg-[#8b5cf6] text-white',
      'marketing': 'bg-[#f97316] text-white',
      'sales': 'bg-[#06b6d4] text-white',
      'support': 'bg-[#0ea5e9] text-white',
      'other': 'bg-[#6b7280] text-white'
    };
    
    const normalizedType = type.toLowerCase();
    
    // If the activity type is in our color map, use that color
    if (colorMap[normalizedType]) {
      return colorMap[normalizedType];
    }
    
    // Otherwise, generate a color based on the activity type string
    const stringToColorCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      
      return `${color}`;
    };
    
    const dynamicColor = stringToColorCode(normalizedType);
    return `bg-[${dynamicColor}] text-white`;
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
