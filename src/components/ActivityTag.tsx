
import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityTagProps {
  type: string;
  hours?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

const ActivityTag: React.FC<ActivityTagProps> = ({ 
  type, 
  hours, 
  className,
  style,
  color
}) => {
  // Define consistent colors for common activity types
  const getActivityColor = (activityType: string): string => {
    const activityLower = activityType.toLowerCase();
    
    // Use the new color palette
    if (activityLower.includes('design')) return '#fef18b'; // soft yellow
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#7ed3fc'; // light blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#6ee7b7'; // mint green
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#22c55f'; // bright green
    if (activityLower.includes('admin')) return '#d1fae5'; // pale green
    if (activityLower.includes('review')) return '#fef18b'; // soft yellow
    if (activityLower.includes('research')) return '#7ed3fc'; // light blue
    
    // Use provided color or fallback to a generic color
    return color || '#6b7280'; // gray if no match
  };
  
  // Generate or use provided color
  const tagColor = getActivityColor(type);
  
  return (
    <div 
      className={cn(
        "inline-flex items-center py-1 px-2 rounded-md text-xs font-medium",
        className
      )}
      style={{ 
        backgroundColor: tagColor,
        color: ['#fef18b', '#7ed3fc', '#6ee7b7', '#d1fae5'].includes(tagColor) ? '#0f172a' : 'white', // dark text for light colors
        ...style 
      }}
    >
      {hours !== undefined && (
        <span className="mr-1 font-mono">{hours.toFixed(1)}</span>
      )}
      <span>#{type.toLowerCase()}</span>
    </div>
  );
};

export default ActivityTag;
