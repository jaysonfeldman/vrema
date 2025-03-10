
import React from 'react';
import { Activity } from '@/lib/types';
import ActivityTag from '@/components/ActivityTag';
import { Badge } from '@/components/ui/badge';

interface ProjectActivitiesProps {
  activities: Activity[];
}

const ProjectActivities: React.FC<ProjectActivitiesProps> = ({ activities }) => {
  const visibleActivities = activities.filter(activity => !activity.hidden);
  
  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">Activities</p>
      <div className="flex flex-wrap gap-2">
        {visibleActivities
          .slice(0, 3)
          .map((activity) => (
            <ActivityTag
              key={activity.id}
              type={activity.type}
              hours={activity.hours}
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
