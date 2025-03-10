import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import ActivityTag from '@/components/ActivityTag';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import EditProjectDialog from '@/components/project/EditProjectDialog';
import { useCalendarSync } from '@/hooks/useCalendarSync';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const { updateProject } = useCalendarSync();
  
  const formatHoursDisplay = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };

  const sortedActivities = [...project.activities].sort((a, b) => b.hours - a.hours);
  
  const budgetProgress = project.budgetHours 
    ? Math.min(100, (project.totalHours / project.budgetHours) * 100)
    : null;
  
  const budgetStatus = project.budgetHours 
    ? project.totalHours > project.budgetHours 
      ? { text: `-${formatHoursDisplay(project.totalHours - project.budgetHours)}`, color: 'text-red-500' }
      : { text: `${formatHoursDisplay(project.budgetHours - project.totalHours)}`, color: 'text-amber-400' }
    : null;

  const earnedValue = project.hourlyRate 
    ? (project.totalHours * project.hourlyRate).toFixed(2)
    : null;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      return;
    }
    navigate(`/project/${project.id}`);
  };

  const handleEditComplete = (updatedProject: Project) => {
    updateProject(updatedProject);
    
    setShowEditDialog(false);
    toast({
      title: "Project updated",
      description: "Project details have been updated successfully.",
    });
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
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
          
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {project.teamMembers && project.teamMembers.slice(0, 4).map((member, index) => (
                <div key={index} className="w-8 h-8 rounded-full bg-gray-500 border-2 border-gray-800"></div>
              ))}
            </div>
            
            <div className="dropdown-trigger z-10" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            
            {earnedValue && (
              <>
                <div className="text-sm text-gray-300">Earned value</div>
                <div className="text-right font-mono font-bold text-green-400">
                  ${earnedValue}
                </div>
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
      
      {showEditDialog && (
        <EditProjectDialog
          project={project}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditComplete}
        />
      )}
    </Card>
  );
};

export default ProjectCard;
