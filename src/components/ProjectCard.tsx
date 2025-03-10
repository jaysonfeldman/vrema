
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProjectCardMenu from './project/ProjectCardMenu';
import EditProjectDialog from './project/EditProjectDialog';
import ProjectSettingsDialog from './project/ProjectSettingsDialog';
import ProjectStatus from './project/ProjectStatus';
import ProjectActivities from './project/ProjectActivities';
import ProjectHeader from './project/ProjectHeader';
import { getProjectTag } from './project/ProjectUtils';
import { supabase } from '@/integrations/supabase/client';
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

  const handleSaveChanges = async () => {
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('projects')
        .upsert({
          id: editedProject.id,
          name: editedProject.name,
          budget_hours: editedProject.budgetHours,
          hourly_rate: editedProject.hourlyRate,
          total_hours: editedProject.totalHours,
          monthly_hours: editedProject.monthlyHours,
          filter_term: editedProject.filterTerm,
          visible: editedProject.visible !== false
        })
        .select();

      if (error) {
        console.error('Error saving project:', error);
        toast({
          variant: "destructive",
          title: "Error saving project",
          description: error.message
        });
        return;
      }

      // Update activities if needed
      if (editedProject.activities) {
        for (const activity of editedProject.activities) {
          // Upsert activity (update or insert)
          const { error: activityError } = await supabase
            .from('activities')
            .upsert({
              id: activity.id.startsWith('new-') ? undefined : activity.id,
              project_id: editedProject.id,
              type: activity.type,
              hours: activity.hours,
              hidden: activity.hidden
            });

          if (activityError) {
            console.error('Error saving activity:', activityError);
          }
        }
      }

      if (onUpdateProject) {
        onUpdateProject(editedProject);
      }

      toast({
        title: "Project saved",
        description: "Your changes have been saved successfully."
      });

      setShowEditDialog(false);
    } catch (error) {
      console.error('Error in saving project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save project. Please try again."
      });
    }
  };

  const handleDeleteProject = async () => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          variant: "destructive",
          title: "Error deleting project",
          description: error.message
        });
        return;
      }

      if (onDeleteProject) {
        onDeleteProject(project.id);
      }

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully."
      });
    } catch (error) {
      console.error('Error in deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project. Please try again."
      });
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

  const handleSaveSettings = async () => {
    await handleSaveChanges();
    setShowSettingsDialog(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if user clicked on menu or within dropdown
    if ((e.target as HTMLElement).closest('.project-menu') || 
        (e.target as HTMLElement).closest('[role="menu"]')) {
      return;
    }
    
    // Navigate to the dedicated project page
    navigate(`/projects/${project.id}`);
  };

  return (
    <>
      <div 
        className={cn(
          'rounded-lg overflow-hidden bg-[#272729] text-white animate-fade-in cursor-pointer h-full',
          className
        )}
        style={{
          ...style,
        }}
        onClick={handleCardClick}
      >
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <ProjectHeader name={project.name} projectTag={projectTag} />
            </div>
            
            <div className="flex items-center gap-2 project-menu">
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
          
          <div className="mt-auto">
            <ProjectActivities activities={project.activities} />
          </div>
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
