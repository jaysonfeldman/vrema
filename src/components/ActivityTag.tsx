
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
    if (activityLower.includes('design')) return '#10b981'; // green
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#8b5cf6'; // purple
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#f59e0b'; // amber
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#3b82f6'; // blue
    if (activityLower.includes('admin')) return '#ef4444'; // red
    if (activityLower.includes('review')) return '#ec4899'; // pink
    if (activityLower.includes('research')) return '#6366f1'; // indigo
    
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
        color: 'white',
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
