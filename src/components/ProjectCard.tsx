
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import ProjectCardMenu from './project/ProjectCardMenu';
import EditProjectDialog from './project/EditProjectDialog';
import ProjectSettingsDialog from './project/ProjectSettingsDialog';
import ProjectStatus from './project/ProjectStatus';
import ProjectTeam from './project/ProjectTeam';
import ProjectActivities from './project/ProjectActivities';
import ProjectHeader from './project/ProjectHeader';
import { getProjectTag } from './project/ProjectUtils';

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
          'rounded-lg overflow-hidden bg-zinc-900 text-white animate-fade-in cursor-pointer',
          className
        )}
        style={{
          ...style,
        }}
        onClick={handleCardClick}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <ProjectHeader name={project.name} projectTag={projectTag} />
            </div>
            
            <div className="flex items-center gap-2 project-menu">
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
