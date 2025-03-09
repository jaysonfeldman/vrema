
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import ActivityTag from './ActivityTag';
import { ActivityType } from '@/lib/types';

const CalendarProjectsList: React.FC = () => {
  const { projectStats, isAuthenticated } = useCalendarSync();
  
  if (!isAuthenticated || Object.keys(projectStats.projectMap).length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold">Calendar Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(projectStats.projectMap)
          .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
          .map(([projectName, hours]) => (
            <Card key={projectName} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{projectName}</CardTitle>
                  <Badge variant="outline">{Math.round(hours * 10) / 10} hours</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={100} className="h-2 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {projectStats.activityMap[projectName]?.map((activity, index) => (
                    <ActivityTag 
                      key={index} 
                      type={activity.type as ActivityType} 
                      hours={Math.round(activity.hours)} 
                      className="text-xs px-2 py-1 rounded-full text-white"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default CalendarProjectsList;
