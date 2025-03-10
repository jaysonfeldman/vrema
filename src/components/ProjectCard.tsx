
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCardMenu from './project/ProjectCardMenu';
import EditProjectDialog from './project/EditProjectDialog';
import ProjectSettingsDialog from './project/ProjectSettingsDialog';
import ProjectStatus from './project/ProjectStatus';
import ProjectTeam from './project/ProjectTeam';
import ProjectActivities from './project/ProjectActivities';
import ProjectHeader from './project/ProjectHeader';
import { getProjectTag } from './project/ProjectUtils';
import { toast } from '@/components/ui/use-toast';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  onUpdateProject?: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className, 
  style,
  onUpdateProject,
  onDeleteProject
}) => {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>({...project});
  
  const projectTag = getProjectTag(project.name);

  const handleSaveChanges = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setShowEditDialog(false);
  };

  const handleDeleteProject = () => {
    if (onDeleteProject) {
      onDeleteProject(project.id);
    }
  };

  const handleActivityVisibilityChange = (activityId: string, isVisible: boolean) => {
    const updatedActivities = editedProject.activities.map(activity => {
      if (activity.id === activityId) {
        return { ...activity, hidden: !isVisible };
      }
      return activity;
    });

    setEditedProject({
      ...editedProject,
      activities: updatedActivities
    });
  };

  const handleSaveSettings = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setShowSettingsDialog(false);
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    const updatedProject = {
      ...project,
      active: !project.active
    };
    
    if (onUpdateProject) {
      onUpdateProject(updatedProject);
      
      toast({
        title: updatedProject.active ? "Project activated" : "Project deactivated",
        description: `${project.name} is now ${updatedProject.active ? "active" : "inactive"}`,
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if user clicked on menu, active toggle, or within dropdown
    if ((e.target as HTMLElement).closest('.project-menu') || 
        (e.target as HTMLElement).closest('.project-active-toggle') ||
        (e.target as HTMLElement).closest('[role="menu"]')) {
      return;
    }
    
    // Navigate to the dedicated project details page
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <div 
        className={cn(
          'rounded-lg overflow-hidden text-white animate-fade-in cursor-pointer',
          project.active ? 'bg-zinc-900' : 'bg-zinc-800',
          className
        )}
        style={{
          ...style,
        }}
        onClick={handleCardClick}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <ProjectHeader name={project.name} projectTag={projectTag} />
              <Badge 
                variant={project.active ? "default" : "outline"}
                className={cn(
                  project.active ? "bg-green-600 hover:bg-green-700" : "bg-zinc-700 hover:bg-zinc-600",
                  "ml-2"
                )}
              >
                {project.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 project-menu">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "project-active-toggle",
                  project.active ? "text-green-500 hover:text-green-600" : "text-zinc-400 hover:text-zinc-300"
                )}
                onClick={handleToggleActive}
                title={project.active ? "Deactivate project" : "Activate project"}
              >
                <Power className="h-4 w-4" />
              </Button>
              
              <ProjectTeam members={project.teamMembers} />
              
              <ProjectCardMenu 
                projectName={project.name}
                onEdit={() => setShowEditDialog(true)}
                onSettings={() => setShowSettingsDialog(true)}
                onDelete={handleDeleteProject}
              />
            </div>
          </div>
          
          <ProjectStatus 
            totalHours={project.totalHours} 
            budgetHours={project.budgetHours}
            monthlyHours={project.monthlyHours}
          />
          
          <ProjectActivities activities={project.activities} />
        </div>
      </div>
      
      <EditProjectDialog 
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={project}
        editedProject={editedProject}
        setEditedProject={setEditedProject}
        onSave={handleSaveChanges}
      />

      <ProjectSettingsDialog 
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        project={project}
        editedProject={editedProject}
        setEditedProject={setEditedProject}
        onActivityVisibilityChange={handleActivityVisibilityChange}
        onSave={handleSaveSettings}
      />
    </>
  );
};

export default ProjectCard;
