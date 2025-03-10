
import React from 'react';
import { Activity } from '@/lib/types';
import ActivityTag from '@/components/ActivityTag';
import { Badge } from '@/components/ui/badge';

interface ProjectActivitiesProps {
  activities: Activity[];
}

const ProjectActivities: React.FC<ProjectActivitiesProps> = ({ activities }) => {
  const visibleActivities = activities.filter(activity => !activity.hidden);
  
  // Calculate total hours for activities
  const totalHours = visibleActivities.reduce((sum, activity) => sum + activity.hours, 0);
  
  // Sort activities by hours (descending)
  const sortedActivities = [...visibleActivities].sort((a, b) => b.hours - a.hours);
  
  // Get activity color based on type
  const getActivityColor = (activityType: string): string => {
    const activityLower = activityType.toLowerCase();
    
    if (activityLower.includes('design')) return '#FEF7CD'; // soft yellow
    if (activityLower.includes('dev') || activityLower.includes('development')) return '#D3E4FD'; // soft blue
    if (activityLower.includes('meet') || activityLower.includes('call')) return '#E5DEFF'; // soft purple
    if (activityLower.includes('plan') || activityLower.includes('strat')) return '#F2FCE2'; // soft green
    if (activityLower.includes('admin')) return '#F1F0FB'; // soft gray
    if (activityLower.includes('pm')) return '#FDE1D3'; // soft peach
    
    return '#FFDEE2'; // soft pink as default
  };
  
  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">Activities</p>
      
      {/* Activity progress bar */}
      {totalHours > 0 && (
        <div className="h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
          {sortedActivities.map((activity, index) => {
            // Calculate width percentage based on hours
            const widthPercent = (activity.hours / totalHours) * 100;
            
            return (
              <div 
                key={activity.id} 
                className="h-full float-left"
                style={{ 
                  width: `${widthPercent}%`,
                  backgroundColor: getActivityColor(activity.type)
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Activity tags */}
      <div className="flex flex-wrap gap-2">
        {sortedActivities.slice(0, 3).map((activity) => (
          <ActivityTag
            key={activity.id}
            type={activity.type}
            hours={activity.hours}
            className="py-2 px-4 text-xs"
          />
        ))}
        
        {visibleActivities.length > 3 && (
          <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700">
            +{visibleActivities.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProjectActivities;
