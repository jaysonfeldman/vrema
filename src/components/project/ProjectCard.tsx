
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import ActivityTag from '@/components/ActivityTag';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const formatHoursDisplay = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };

  // Sort activities by hours (descending)
  const sortedActivities = [...project.activities].sort((a, b) => b.hours - a.hours);
  
  // Calculate budget progress if budget exists
  const budgetProgress = project.budgetHours 
    ? Math.min(100, (project.totalHours / project.budgetHours) * 100)
    : null;
  
  const budgetStatus = project.budgetHours 
    ? project.totalHours > project.budgetHours 
      ? { text: `-${formatHoursDisplay(project.totalHours - project.budgetHours)}`, color: 'text-red-500' }
      : { text: `${formatHoursDisplay(project.budgetHours - project.totalHours)}`, color: 'text-green-500' }
    : null;

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
            {project.filterTerm && (
              <div className="text-xs text-muted-foreground mt-1">
                Filter: {project.filterTerm}
              </div>
            )}
          </div>
          <div className="bg-black/10 dark:bg-white/10 text-xs px-2 py-1 rounded">
            {project.id.substring(0, 6)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-2">
            <div className="text-sm text-muted-foreground">Time logged</div>
            <div className="text-right font-mono font-bold">{formatHoursDisplay(project.totalHours)}</div>
            
            {project.budgetHours && (
              <>
                <div className="text-sm text-muted-foreground">Budget left</div>
                <div className={`text-right font-mono font-bold ${budgetStatus?.color}`}>
                  {budgetStatus?.text}
                </div>
              </>
            )}
          </div>
          
          {budgetProgress !== null && (
            <div className="space-y-1.5">
              <Progress value={budgetProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {budgetProgress > 100 ? 'Over budget' : `${Math.round(budgetProgress)}% of budget used`}
              </p>
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium mb-2">Activities</div>
            <div className="flex flex-wrap gap-2">
              {sortedActivities.slice(0, 3).map((activity) => (
                <ActivityTag
                  key={activity.id}
                  type={activity.type}
                  hours={activity.hours}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
