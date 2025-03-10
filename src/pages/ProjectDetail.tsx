
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
    updateProject
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
    if (projectId && customProjects.length > 0) {
      // Find the project directly from customProjects
      const foundProject = customProjects.find(p => p.id === projectId) || null;
      console.log(`Looking for project with ID: ${projectId}`, foundProject ? 'Found' : 'Not found');
      console.log('Available projects:', customProjects.map(p => ({ id: p.id, name: p.name })));
      
      setProject(foundProject);
      
      if (foundProject) {
        console.log(`Loading project: ${foundProject.name} with filter: ${foundProject.filterTerm}`);
        
        // Force a calendar sync to ensure we have the latest data
        syncCalendar(90); // Get 3 months of data
        
        // Apply project filter to show only this project's events
        updateFilters({ 
          project: foundProject.name,
          searchTerm: foundProject.filterTerm || '',
          dateRange: 90, // Show more history for project details
          selectedProjects: [foundProject.name]
        });
      }
    }
  }, [projectId, customProjects, updateFilters, syncCalendar]);
  
  // Update projectEvents when filteredEvents changes
  useEffect(() => {
    if (project && filteredEvents) {
      console.log(`Found ${filteredEvents.length} events for project ${project.name}`);
      setProjectEvents(filteredEvents);
    }
  }, [project, filteredEvents]);

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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <Card className="p-8 max-w-3xl mx-auto mt-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Project Not Found</h2>
              <p className="text-muted-foreground">The project you're looking for doesn't exist or couldn't be loaded.</p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
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
          
          {earnedValue && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Earned Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${earnedValue}</div>
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
                Filter: {project.filterTerm || 'None'}
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
