
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
import { formatEventDate, calculateDuration } from '@/services/googleCalendarService';

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
      
      // Get project events and update state
      const events = getProjectEvents(projectId);
      console.log(`Found ${events.length} events for project ${foundProject.name}`);
      setProjectEvents(events);
      
      // Force a calendar sync to ensure we have the latest data
      syncCalendar(90); // Get 3 months of data
    } else {
      console.error('Project not found with ID:', projectId);
      navigate('/');
    }
  }, [projectId, customProjects, getProjectById, getProjectEvents, navigate, syncCalendar]);

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
    return <ProjectsLoading />;
  }
  
  // Calculate total hours for this project
  const totalProjectHours = projectEvents.reduce((total, event) => {
    if (!event.start?.dateTime || !event.end?.dateTime) return total;
    const duration = calculateDuration(event.start.dateTime, event.end.dateTime);
    const hours = parseFloat(duration.split(':')[0]) + parseFloat(duration.split(':')[1]) / 60;
    return total + hours;
  }, 0);
  
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
