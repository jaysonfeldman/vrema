
import React from 'react';
import { getActivityColor } from '@/lib/mock-data';
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
  // Generate or use provided color
  const tagColor = color || getActivityColor(type);
  
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
      {hours && (
        <span className="mr-1 font-mono">{hours.toFixed(0).padStart(1, '0')}:00</span>
      )}
      <span>#{type.toLowerCase()}</span>
    </div>
  );
};

export default ActivityTag;
