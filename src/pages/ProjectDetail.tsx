
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project, GoogleCalendarEvent } from '@/lib/types';
import Header from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';
import EditProjectDialog from '@/components/project/EditProjectDialog';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import ProjectDetailHeader from '@/components/project/ProjectDetailHeader';
import ProjectStatsCards from '@/components/project/ProjectStatsCards';
import ProjectEventsCard from '@/components/project/ProjectEventsCard';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isLoading, 
    customProjects,
    syncCalendar,
    updateProject,
    getProjectById,
    getProjectEvents
  } = useCalendarSync();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Load project and filter events
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    console.log("ProjectDetail: Loading project with ID:", projectId);
    
    // Find the project by ID first
    const foundProject = getProjectById(projectId);
    
    if (foundProject) {
      console.log("Project found:", foundProject.name);
      setProject(foundProject);
      
      // Force a calendar sync to ensure we have the latest data
      console.log("Syncing calendar data...");
      syncCalendar(90); // Get 3 months of data
    } else {
      // If project not found, navigate back to home
      console.error('Project not found with ID:', projectId);
      navigate('/');
    }
  }, [projectId, customProjects, syncCalendar, getProjectById, navigate]);
  
  // Update projectEvents when project changes or when calendar is synced
  useEffect(() => {
    if (!project || !projectId) return;
    
    console.log(`Getting events for project: ${project.name} (${projectId})`);
    const events = getProjectEvents(projectId);
    console.log(`Found ${events.length} events for project ${project.name}`);
    setProjectEvents(events);
  }, [project, projectId, getProjectEvents]);

  // Handle project update
  const handleProjectUpdate = (updatedProject: Project) => {
    setShowEditDialog(false);
    if (project) {
      updateProject(updatedProject);
      setProject(updatedProject);
      toast({
        title: "Project updated",
        description: "Project details have been updated successfully."
      });
    }
  };
  
  if (isLoading) {
    return <ProjectsLoading />;
  }
  
  if (!project) {
    // Return the loading state instead of project not found
    return <ProjectsLoading />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <ProjectDetailHeader 
          projectName={project.name}
          onEditClick={() => setShowEditDialog(true)}
        />
        
        <ProjectStatsCards 
          project={project} 
          projectEvents={projectEvents}
          syncCalendar={syncCalendar}
        />
        
        <ProjectEventsCard 
          projectEvents={projectEvents}
          syncCalendar={syncCalendar}
        />
      </div>

      {showEditDialog && (
        <EditProjectDialog
          project={project}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleProjectUpdate}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
