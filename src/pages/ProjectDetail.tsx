
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { GoogleCalendarEvent, Project, Activity } from '@/lib/types';
import ActivityTag from '@/components/ActivityTag';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { events, customProjects, getProjectById } = useCalendarSync();
  const [project, setProject] = useState<Project | null>(null);
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);
  const [activitiesSummary, setActivitiesSummary] = useState<Activity[]>([]);

  useEffect(() => {
    if (projectId && customProjects.length > 0) {
      // Try to find the project by ID
      const foundProject = getProjectById(projectId);
      
      if (foundProject) {
        setProject(foundProject);
        
        // Filter events for this project based on the parsed project name
        const filteredEvents = events.filter(event => {
          if (!event.summary) return false;
          
          const { projectName } = parseEventTitle(event.summary);
          if (!projectName) return false;
          
          // Case insensitive matching of project name
          return projectName.toLowerCase() === foundProject.name.toLowerCase();
        });
        
        setProjectEvents(filteredEvents);
        
        // Already have activities in the project object
        setActivitiesSummary(foundProject.activities || []);
      }
    }
  }, [projectId, customProjects, events, getProjectById]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {customProjects.length === 0 
                ? "Loading projects..." 
                : `Project not found with ID: ${projectId}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {(project.totalHours || 0).toFixed(2)} hours
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calendar className="h-3 w-3 mr-1" />
                {projectEvents.length} events
              </Badge>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>

        {/* Activities Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesSummary.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No activities found for this project</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activitiesSummary.map((activity) => (
                  <div key={activity.id} className="p-4 rounded-lg border">
                    <ActivityTag 
                      type={activity.type} 
                      hours={activity.hours}
                      className="mb-2" 
                    />
                    <p className="mt-2 text-xl font-mono font-semibold">
                      {Math.floor(activity.hours)}:
                      {Math.round((activity.hours - Math.floor(activity.hours)) * 60)
                        .toString()
                        .padStart(2, '0')}
                    </p>
                    <p className="text-sm text-muted-foreground">total hours</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Events</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {projectEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No events found for this project. Create calendar events with format "ProjectName#ActivityType Description" to track time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectEvents.map((event) => {
                      const { activityType, description } = parseEventTitle(event.summary);
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <ActivityTag type={activityType} />
                          </TableCell>
                          <TableCell>{description || '(No description)'}</TableCell>
                          <TableCell>{formatEventDate(event.start.dateTime)}</TableCell>
                          <TableCell>{calculateDuration(event.start.dateTime, event.end.dateTime)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
