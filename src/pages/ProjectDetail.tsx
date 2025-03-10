
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react';
import CalendarEventListView from '@/components/calendar/CalendarEventListView';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { Project, GoogleCalendarEvent } from '@/lib/types';
import Header from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';
import EditProjectDialog from '@/components/project/EditProjectDialog';

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
  
  // Format hours display
  const formatHoursDisplay = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${String(minutes).padStart(2, '0')}`;
  };
  
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

  // Calculate earned value if hourly rate exists
  const earnedValue = project.hourlyRate 
    ? (project.totalHours * project.hourlyRate).toFixed(2)
    : null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          
          <Button onClick={() => setShowEditDialog(true)}>
            Edit Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Time Logged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatHoursDisplay(project.totalHours)}</div>
              {project.budgetHours && (
                <div className="text-sm text-muted-foreground">
                  Budget: {formatHoursDisplay(project.budgetHours)}
                </div>
              )}
            </CardContent>
          </Card>
          
          {project.hourlyRate && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Earned Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(project.totalHours * project.hourlyRate).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rate: ${project.hourlyRate}/hr
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projectEvents.length}</div>
              <div className="text-sm text-muted-foreground">
                Filter: {project.filterTerm || project.name}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectEvents.length > 0 ? (
              <CalendarEventListView events={projectEvents} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No events found for this project.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try changing the filter term in project settings or syncing more calendar data.
                </p>
                <Button 
                  onClick={() => syncCalendar(90)} 
                  className="mt-4"
                >
                  Sync Calendar Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
