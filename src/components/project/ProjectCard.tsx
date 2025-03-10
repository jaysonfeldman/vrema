
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
      : { text: `${formatHoursDisplay(project.budgetHours - project.totalHours)}`, color: 'text-amber-400' }
    : null;

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
      style={{ backgroundColor: '#3C3C3C', color: 'white' }}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-white">{project.name}</CardTitle>
            {project.filterTerm && (
              <div className="text-xs text-gray-300 mt-1">
                {project.id.substring(0, 6)}
              </div>
            )}
          </div>
          <div className="flex -space-x-2">
            {project.teamMembers && project.teamMembers.slice(0, 4).map((member, index) => (
              <div key={index} className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-800"></div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-y-1">
            <div className="text-sm text-gray-300">Time logged</div>
            <div className="text-right font-mono font-bold text-white">{formatHoursDisplay(project.totalHours)}</div>
            
            {project.budgetHours && (
              <>
                <div className="text-sm text-gray-300">Budget left</div>
                <div className={`text-right font-mono font-bold ${budgetStatus?.color}`}>
                  {budgetStatus?.text}
                </div>
                <div className="text-xs text-gray-400 col-span-2 text-right">/this month</div>
              </>
            )}
          </div>
          
          <div>
            <div className="text-sm text-gray-300 mb-2">Activities</div>
            {budgetProgress !== null && (
              <div className="mb-3">
                <Progress value={budgetProgress} className="h-2 bg-gray-600" />
              </div>
            )}
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
