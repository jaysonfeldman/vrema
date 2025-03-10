
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Calendar, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { parseEventTitle, formatEventDate, calculateDuration } from '@/services/googleCalendarService';
import { GoogleCalendarEvent, Project } from '@/lib/types';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProjectById, events } = useCalendarSync();
  const [project, setProject] = useState<Project | null>(null);
  const [projectEvents, setProjectEvents] = useState<GoogleCalendarEvent[]>([]);

  useEffect(() => {
    if (projectId) {
      const foundProject = getProjectById(projectId);
      if (foundProject) {
        setProject(foundProject);
        // Filter events for this project
        const filteredEvents = events.filter(event => {
          const { projectName } = parseEventTitle(event.summary);
          return projectName.toLowerCase() === foundProject.name.toLowerCase();
        });
        setProjectEvents(filteredEvents);
      }
    }
  }, [projectId, getProjectById, events]);

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
            <p className="text-muted-foreground">Project not found</p>
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
                {project.totalHours.toFixed(2)} hours
              </Badge>
              {project.teamMembers && project.teamMembers.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  <Users className="h-3 w-3 mr-1" />
                  {project.teamMembers.length} team members
                </Badge>
              )}
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

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
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
                        No events found for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectEvents.map((event) => {
                      const { activityType, description } = parseEventTitle(event.summary);
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Badge variant="outline">#{activityType}</Badge>
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
