
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
  // Define color palette with the specified colors from the user
  const getActivityColor = (activityType: string): string => {
    const activityLower = activityType.toLowerCase();
    
    // Use the provided palette colors
    if (activityLower.includes('design')) return '#FEF18B'; // Flax - soft yellow
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#7ED3FC'; // Pale azure - soft blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#D1FAE5'; // Nyanza - soft green
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#6EE7B7'; // Aquamarine - soft green
    if (activityLower.includes('admin')) return '#FED8AA'; // Sunset - soft peach
    if (activityLower.includes('pm')) return '#22C55F'; // Emerald - bright green
    
    // Use provided color or generate one based on the type string
    // This ensures each activity type gets a consistent but unique color
    if (color) return color;
    
    // Simple hash function to generate a consistent color index
    const getColorIndex = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % colors.length;
    };
    
    // All colors from the palette
    const colors = ['#22C55F', '#D1FAE5', '#FED8AA', '#6EE7B7', '#FEF18B', '#7ED3FC'];
    return colors[getColorIndex(activityType)];
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
