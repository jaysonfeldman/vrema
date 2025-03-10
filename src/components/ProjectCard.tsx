
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

  // Calculate project earnings if hourly rate is set
  const getProjectEarnings = () => {
    if (project.hourlyRate) {
      return project.totalHours * project.hourlyRate;
    }
    return null;
  };

  const projectEarnings = getProjectEarnings();

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
          
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Time logged</p>
                <p className="font-mono font-bold text-2xl">{formatTime(project.totalHours)}</p>
                <p className="text-xs text-gray-500 mt-1">in total</p>
              </div>
              
              {budgetHours && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Budget left</p>
                  <p className={cn(
                    "font-mono font-bold text-2xl",
                    isOverBudget ? "text-red-500" : "text-amber-500"
                  )}>
                    {budgetText}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {monthlyHours ? "/this month" : "in total"}
                  </p>
                </div>
              )}
              
              {projectEarnings !== null && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Earnings</p>
                  <p className="font-mono font-bold text-2xl text-amber-500">
                    €{projectEarnings.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
          
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

// Helper function for formatting time from mock-data
const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) {
    return `${m}m`;
  } else if (m === 0) {
    return `${h}h`;
  } else {
    return `${h}h ${m}m`;
  }
};

export default ProjectCard;
