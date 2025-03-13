import React from 'react';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AvatarGroup } from './ui/avatar-group';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSharedState } from '@/hooks/useSharedState';
import { Button } from './ui/button';
import { Settings2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  onUpdateProject?: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className,
  style,
  onUpdateProject,
  onClick
}) => {
  const { activityColors } = useSharedState();

  // Format time function
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get activity color from shared state
  const getActivityColor = (type: string): string => {
    const activityColor = activityColors.find(ac => ac.type.toLowerCase() === type.toLowerCase());
    if (activityColor) return activityColor.color;
    
    // For any unlisted activity type, deterministically assign one of the alternate colors
    const alternateColors = ['#FEF18B', '#FED8AA', '#7ED3FC'];
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return alternateColors[hash % alternateColors.length];
  };

  // Calculate total value
  const totalValue = project.hourlyRate ? project.totalHours * project.hourlyRate : 0;

  // Sort activities by hours
  const sortedActivities = [...project.activities]
    .sort((a, b) => b.hours - a.hours);

  return (
    <div 
      className={cn(
        'rounded-lg overflow-hidden bg-[#272729] text-white p-6 cursor-pointer hover:bg-[#2d2d30] transition-colors',
        className
      )}
      style={style}
      onClick={onClick}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-medium">{project.name}</h3>
              <div className="bg-zinc-700/50 px-2 py-0.5 rounded text-xs text-zinc-400">
                {project.filterTerm || project.name.toLowerCase()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AvatarGroup>
              {project.teamMembers.map((member, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-[#272729]">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateProject?.(project);
              }}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time and Budget */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Time logged</p>
            <p className="font-mono text-2xl">{formatTime(project.totalHours)}</p>
          </div>
          
          <div>
            <p className="text-sm text-zinc-400 mb-1">Total value</p>
            <p className="font-mono text-2xl text-emerald-400">
              {formatCurrency(totalValue)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-zinc-400 mb-1">Budget left</p>
            {project.budgetHours ? (
              <>
                <p className="font-mono text-2xl text-amber-500">
                  {formatTime(project.budgetHours - project.totalHours)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  /month
                </p>
              </>
            ) : (
              <p className="font-mono text-2xl text-zinc-500">—</p>
            )}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-lg font-medium mb-4">Activities</h3>
          <div className="h-2 bg-zinc-800 rounded-full mb-4 overflow-hidden">
            {sortedActivities.map((activity) => {
              const totalHours = project.activities.reduce((sum, a) => sum + a.hours, 0);
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
          
          <div className="flex flex-wrap gap-2">
            {sortedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-black"
                style={{ backgroundColor: getActivityColor(activity.type) }}
              >
                <span className="font-mono">{formatTime(activity.hours)}</span>
                <span>#{activity.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
