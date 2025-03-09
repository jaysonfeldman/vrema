
import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { formatTime } from '@/lib/mock-data';
import ActivityTag from './ActivityTag';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const progressPercentage = project.budgetHours 
    ? Math.min(100, (project.totalHours / project.budgetHours) * 100)
    : 100;

  // Get hours left in budget
  const hoursLeft = project.budgetHours 
    ? Math.max(0, project.budgetHours - project.totalHours)
    : 0;
    
  // Format the hoursLeft with appropriate styling
  const isOverBudget = project.budgetHours && project.totalHours > project.budgetHours;

  return (
    <div 
      className={cn(
        'project-card rounded-lg overflow-hidden animate-fade-in',
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{project.name}</h3>
          {project.teamMembers.length > 0 && (
            <div className="flex -space-x-2">
              {project.teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="w-8 h-8 rounded-full border-2 border-project-bg overflow-hidden"
                  style={{ zIndex: project.teamMembers.length - index }}
                >
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Time logged</p>
            <p className="font-bold text-2xl">{formatTime(project.totalHours)}</p>
          </div>
          {project.budgetHours && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Budget left</p>
              <p className={cn(
                "font-bold text-2xl",
                isOverBudget ? "text-red-500" : "text-amber-500"
              )}>
                {isOverBudget ? `-${formatTime(Math.abs(hoursLeft))}` : formatTime(hoursLeft)}
              </p>
              <p className="text-xs text-gray-500 mt-1">/{project.budgetHours}:00 total</p>
            </div>
          )}
          {project.monthlyHours !== undefined && (
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-400">This month</p>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatTime(project.monthlyHours)}
                </Badge>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${(project.monthlyHours / project.totalHours) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-3">Activities</p>
          <div className="flex flex-wrap gap-2">
            {project.activities.slice(0, 3).map((activity) => (
              <ActivityTag
                key={activity.id}
                type={activity.type}
                hours={activity.hours}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
