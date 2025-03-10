
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import CalendarEventListView from '@/components/calendar/CalendarEventListView';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { Project, GoogleCalendarEvent } from '@/lib/types';
import { calculateDuration, formatEventDate } from '@/services/googleCalendarService';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    isLoading, 
    getProjectById, 
    events, 
    filteredEvents,
    filters,
    updateFilters
  } = useCalendarSync();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  
  // Load project and filter events
  useEffect(() => {
    if (projectId) {
      const foundProject = getProjectById(projectId);
      setProject(foundProject);
      
      // Apply project filter to show only this project's events
      updateFilters({ project: foundProject?.name || '' });
    }
  }, [projectId, getProjectById, updateFilters]);
  
  // Update projectEvents when filteredEvents changes
  useEffect(() => {
    if (project && filteredEvents) {
      setProjectEvents(filteredEvents);
    }
  }, [project, filteredEvents]);
  
  if (isLoading) {
    return <ProjectsLoading />;
  }
  
  if (!project) {
    return (
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
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6 gap-4">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
