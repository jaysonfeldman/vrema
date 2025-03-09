
import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { formatTime } from '@/lib/mock-data';
import ActivityTag from './ActivityTag';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const progressPercentage = project.budgetHours 
    ? Math.min(100, (project.totalHours / project.budgetHours) * 100)
    : 100;

  return (
    <div 
      className={cn(
        'project-card bg-project-bg text-project-text rounded-lg overflow-hidden animate-fade-in',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{project.name}</h3>
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
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Time logged</p>
            <p className="time-display text-white">{formatTime(project.totalHours)}</p>
          </div>
          {project.budgetHours && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Budget left</p>
              <p className="time-display text-amber-500">
                {formatTime(project.budgetHours - project.totalHours)}
              </p>
              <p className="text-xs text-gray-500 mt-1">/{project.budgetHours}:00 total</p>
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
