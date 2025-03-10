
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
  // Define consistent colors for common activity types using the specified palette
  const getActivityColor = (activityType: string): string => {
    const activityLower = activityType.toLowerCase();
    
    // Use the specified color palette - never use gray
    if (activityLower.includes('design')) return '#fef18b'; // soft yellow
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#7ed3fc'; // light blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#6ee7b7'; // mint green
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#22c55f'; // bright green
    if (activityLower.includes('admin')) return '#d1fae5'; // pale green
    if (activityLower.includes('review')) return '#fef18b'; // soft yellow
    if (activityLower.includes('research')) return '#7ed3fc'; // light blue
    if (activityLower.includes('qa')) return '#9b87f5'; // primary purple
    if (activityLower.includes('test')) return '#8B5CF6'; // vivid purple
    if (activityLower.includes('content')) return '#FEC6A1'; // soft orange
    if (activityLower.includes('write')) return '#FEC6A1'; // soft orange
    
    // Use provided color or fallback to a pleasant color
    return color || '#9b87f5'; // default to primary purple instead of gray
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
        color: '#0f172a', // Always use dark text for better contrast
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
