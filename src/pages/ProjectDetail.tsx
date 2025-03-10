
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { stringToColor } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { events, customProjects } = useCalendarSync();
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  const [project, setProject] = useState<Project | undefined>();
  
  // Find the project based on projectId
  useEffect(() => {
    if (!projectId || !customProjects || customProjects.length === 0) return;
    
    const foundProject = customProjects.find(p => p.id === projectId);
    setProject(foundProject);
    
    if (!foundProject) {
      toast({
        variant: "destructive",
        title: "Project not found",
        description: "The requested project could not be found."
      });
      return;
    }
    
    console.log(`Found project: "${foundProject.name}" with ID: ${foundProject.id}`);
  }, [projectId, customProjects]);
  
  // Filter events for this project
  useEffect(() => {
    if (!project || !events || events.length === 0) return;
    
    console.log(`Filtering events for project "${project.name}"`);
    
    // Filter events that match this project's name
    const filteredEvents = events.filter(event => {
      if (!event.summary) return false;
      const { projectName } = parseEventTitle(event.summary);
      return projectName.toLowerCase() === project.name.toLowerCase();
    });
    
    console.log(`Found ${filteredEvents.length} events for project "${project.name}"`);
    setProjectEvents(filteredEvents);
  }, [events, project]);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Project Not Found</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                The project you're looking for doesn't exist or has been deleted.
              </p>
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate('/')}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Helper function to get activity color
  const getActivityColor = (activityType: string): string => {
    switch (activityType.toLowerCase()) {
      case 'design':
        return 'bg-green-500 text-white';
      case 'strategy':
        return 'bg-blue-500 text-white';
      case 'dev':
        return 'bg-purple-500 text-white';
      case 'meetings':
        return 'bg-yellow-500 text-white';
      case 'admin':
        return 'bg-red-500 text-white';
      default:
        // Generate a consistent color based on the activity type
        const color = stringToColor(activityType);
        return `bg-[${color}] text-white`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <Badge variant="outline" className="ml-4">
            {project.totalHours.toFixed(1)} hours logged
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Events</CardTitle>
          </CardHeader>
          <CardContent>
            {projectEvents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No events found for this project.</p>
                <p className="mt-2 text-sm">Try syncing your calendar or check the project filter settings.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectEvents.map((event) => {
                      const { activityType, description } = parseEventTitle(event.summary || '');
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge className={getActivityColor(activityType)}>
                              {activityType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {description || '(No description)'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatEventDate(event.start?.dateTime || '')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {calculateDuration(
                                event.start?.dateTime || '', 
                                event.end?.dateTime || ''
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
