
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
    
    if (activityLower.includes('design')) return '#4ade80'; // green
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#7ed3fc'; // light blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#6ee7b7'; // mint green
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#22c55f'; // bright green
    if (activityLower.includes('admin')) return '#d1fae5'; // pale green
    if (activityLower.includes('pm')) return '#fef18b'; // yellow
    
    // Use provided color or fallback to a pleasant color
    return color || '#9b87f5'; // default to primary purple
  };
  
  // Generate or use provided color
  const tagColor = getActivityColor(type);
  
  // Format hours as "40:00" style
  const formattedHours = hours !== undefined ? 
    `${Math.floor(hours)}:${Math.round((hours - Math.floor(hours)) * 60).toString().padStart(2, '0')}` 
    : '';
  
  return (
    <div 
      className={cn(
        "inline-flex items-center py-1 px-3 rounded-md text-sm font-medium",
        className
      )}
      style={{ 
        backgroundColor: tagColor,
        color: '#0f172a', // Dark text for better contrast
        ...style 
      }}
    >
      {hours !== undefined && (
        <span className="mr-1 font-mono">{formattedHours}</span>
      )}
      <span>#{type.toLowerCase()}</span>
    </div>
  );
};

export default ActivityTag;
