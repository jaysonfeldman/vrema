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
    
    console.log(`Navigating to project detail page for project ID: ${project.id}`);
    
    // Navigate to the dedicated project page
    navigate(`/projects/${project.id}`);
  };

  // Calculate project earnings if hourly rate is set
  const getProjectEarnings = () => {
    if (project.hourlyRate && project.hourlyRate > 0) {
      const earnings = project.totalHours * project.hourlyRate;
      console.log(`Calculated earnings for ${project.name}: ${earnings} (${project.totalHours} × ${project.hourlyRate})`);
      return earnings;
    }
    return null;
  };

  const projectEarnings = getProjectEarnings();
  
  // Get budget-related calculations
  const hasBudget = !!project.budgetHours;
  const isMonthlyBudget = !!project.monthlyHours;
  const hoursUsed = isMonthlyBudget ? (project.monthlyHours || 0) : project.totalHours;
  const budgetRemaining = hasBudget ? (project.budgetHours || 0) - hoursUsed : null;
  const isOverBudget = hasBudget && budgetRemaining !== null && budgetRemaining < 0;
  const budgetText = hasBudget ? formatTime(Math.abs(budgetRemaining || 0)) : '';

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
              
              {hasBudget && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Budget left</p>
                  <p className={cn(
                    "font-mono font-bold text-2xl",
                    isOverBudget ? "text-red-500" : "text-amber-500"
                  )}>
                    {budgetText}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isMonthlyBudget ? "/this month" : "in total"}
                  </p>
                </div>
              )}
              
              {!hasBudget && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Budget</p>
                  <p className="font-mono font-bold text-2xl text-gray-500">
                    Not set
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    &nbsp;
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-4">
              {projectEarnings !== null ? (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Earnings</p>
                  <p className="font-mono font-bold text-2xl text-amber-500">
                    €{projectEarnings.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Hourly rate</p>
                  <p className="font-mono font-bold text-2xl text-gray-500">
                    Not set
                  </p>
                </div>
              )}
              
              {/* Empty div to maintain grid alignment when no earnings */}
              <div></div>
            </div>
          </div>
          
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
