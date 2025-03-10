
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
  // Define light pastel colors for common activity types
  const getActivityColor = (activityType: string): string => {
    const activityLower = activityType.toLowerCase();
    
    if (activityLower.includes('design')) return '#FEF7CD'; // soft yellow
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#D3E4FD'; // soft blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#E5DEFF'; // soft purple
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#F2FCE2'; // soft green
    if (activityLower.includes('admin')) return '#F1F0FB'; // soft gray
    if (activityLower.includes('pm')) return '#FDE1D3'; // soft peach
    
    // Use provided color or fallback to a pleasant pastel color
    return color || '#FFDEE2'; // soft pink as default
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
