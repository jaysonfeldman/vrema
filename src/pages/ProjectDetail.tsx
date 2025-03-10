
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Calendar, Folder, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { stringToColor } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import ActivityTag from '@/components/ActivityTag';

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
      navigate('/');
      return;
    }
    
    console.log(`Found project: "${foundProject.name}" with ID: ${foundProject.id}`);
  }, [projectId, customProjects, navigate]);
  
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
  
  // Helper function to get activity color
  const getActivityColor = (activityType: string): string => {
    const color = stringToColor(activityType);
    return `bg-[${color}] text-white`;
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
            </Button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant="outline" className="ml-4">
              {project.totalHours.toFixed(1)} hours logged
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {project.activities.slice(0, 3).map(activity => (
              <ActivityTag
                key={activity.id}
                type={activity.type}
                hours={activity.hours}
              />
            ))}
            {project.activities.length > 3 && (
              <Badge variant="outline" className="bg-slate-700 text-white">
                +{project.activities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Folder className="mr-2 h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Hours</h3>
                <p className="text-2xl font-bold">{project.totalHours.toFixed(1)}</p>
              </div>
              {project.budgetHours && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Budget Hours</h3>
                  <p className="text-2xl font-bold">{project.budgetHours.toFixed(1)}</p>
                </div>
              )}
              {project.monthlyHours !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Hours</h3>
                  <p className="text-2xl font-bold">{project.monthlyHours.toFixed(1)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5" />
              Project Events
            </CardTitle>
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
                            <Badge className="capitalize bg-slate-700 text-white">
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
