
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
    events, 
    filteredEvents,
    filters,
    updateFilters,
    syncCalendar,
    updateProject,
    getProjectById
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
      
      // Apply project filter to show only this project's events
      const searchTerm = foundProject.filterTerm || foundProject.name;
      console.log("Setting filter for events with term:", searchTerm);
      
      // Use the searchTerm to filter events
      updateFilters({ 
        searchTerm: searchTerm,
        dateRange: 90, // Show more history for project details
        selectedProjects: [] // Don't filter by project selection
      });
    } else {
      // If project not found, navigate back to home
      console.error('Project not found with ID:', projectId);
      navigate('/');
    }
  }, [projectId, customProjects, updateFilters, syncCalendar, getProjectById, navigate]);
  
  // Update projectEvents when filteredEvents or events change
  useEffect(() => {
    if (!project) return;
    
    if (filteredEvents && filteredEvents.length > 0) {
      console.log(`Found ${filteredEvents.length} filtered events for project ${project.name}`);
      setProjectEvents(filteredEvents);
    } else if (events && events.length > 0) {
      // As a fallback, filter the events directly
      const searchTerm = (project.filterTerm || project.name).toLowerCase();
      console.log("Manually filtering events with term:", searchTerm);
      
      const matchingEvents = events.filter(event => 
        event.summary && event.summary.toLowerCase().includes(searchTerm)
      );
      
      console.log(`Found ${matchingEvents.length} matching events by direct search`);
      setProjectEvents(matchingEvents);
    }
  }, [project, filteredEvents, events]);

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
