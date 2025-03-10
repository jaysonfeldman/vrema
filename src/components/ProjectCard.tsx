
import React from 'react';
import { Project } from '@/lib/types';
import { formatTime } from '@/lib/mock-data';
import ActivityTag from './ActivityTag';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className, style }) => {
  // Is the project over budget?
  const isOverBudget = project.budgetHours && project.totalHours > project.budgetHours;
  
  // Format budget info
  const getBudgetInfo = () => {
    if (!project.budgetHours) return null;
    
    const diff = Math.abs(project.budgetHours - project.totalHours);
    const formattedDiff = formatTime(diff);
    
    if (isOverBudget) {
      return { 
        text: `-${formattedDiff}`,
        color: 'text-red-500'
      };
    } else {
      return { 
        text: `${formattedDiff}`,
        color: 'text-amber-500'
      };
    }
  };
  
  const budgetInfo = getBudgetInfo();
  
  // Get project tag (if any)
  const getProjectTag = () => {
    // This would be expanded in a real app
    const tagMap: Record<string, string> = {
      'umc': 'UMC',
      'web': 'Web',
      'design': 'Design',
      'marketing': 'MKT'
    };
    
    // Look for a match in the project name (simplified approach)
    const nameWords = project.name.toLowerCase().split(' ');
    for (const word of nameWords) {
      if (tagMap[word]) {
        return tagMap[word];
      }
    }
    return null;
  };
  
  const projectTag = getProjectTag();

  return (
    <div 
      className={cn(
        'rounded-lg overflow-hidden animate-fade-in',
        className
      )}
      style={{
        ...style,
        borderLeft: project.color ? `4px solid ${project.color}` : undefined
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              {projectTag && (
                <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700">
                  {projectTag}
                </Badge>
              )}
            </div>
          </div>
          
          {project.teamMembers.length > 0 && (
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member, index) => (
                <div 
                  key={member.id} 
                  className="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden"
                  style={{ zIndex: project.teamMembers.length - index }}
                >
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs border-2 border-gray-800">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Time logged</p>
            <p className="font-bold text-2xl">{formatTime(project.totalHours)}</p>
            <p className="text-xs text-gray-500 mt-1">in total</p>
          </div>
          
          {project.budgetHours && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Budget left</p>
              <p className={cn(
                "font-bold text-2xl",
                isOverBudget ? "text-red-500" : ""
              )}>
                {isOverBudget ? `-${formatTime(Math.abs(project.budgetHours - project.totalHours))}` : 
                  formatTime(project.budgetHours - project.totalHours)}
              </p>
              <p className="text-xs text-gray-500 mt-1">in total</p>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-2">Activities</p>
          <div className="flex flex-wrap gap-2">
            {project.activities.map((activity) => (
              <div 
                key={activity.id}
                className="px-3 py-1 rounded-md text-white text-xs inline-flex items-center"
                style={{
                  backgroundColor: 
                    activity.type === 'design' ? 'rgb(34, 197, 94)' :
                    activity.type === 'strategy' ? 'rgb(59, 130, 246)' :
                    activity.type === 'dev' ? 'rgb(168, 85, 247)' :
                    activity.type === 'meetings' ? 'rgb(234, 179, 8)' :
                    activity.type === 'admin' ? 'rgb(239, 68, 68)' :
                    `#${activity.type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16).slice(-6)}`
                }}
                title={activity.description || undefined}
              >
                {formatTime(activity.hours)} #{activity.type}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
