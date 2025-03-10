
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarEvent } from '@/lib/types';
import { formatEventDate, calculateDuration, parseEventTitle } from '@/services/googleCalendarService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ProjectEventsCardProps {
  projectEvents: GoogleCalendarEvent[];
  syncCalendar: (days: number) => void;
}

const ProjectEventsCard: React.FC<ProjectEventsCardProps> = ({
  projectEvents,
  syncCalendar,
}) => {
  const getTotalHours = (events: GoogleCalendarEvent[]) => {
    return events.reduce((total, event) => {
      if (!event.start?.dateTime || !event.end?.dateTime) return total;
      const duration = calculateDuration(event.start.dateTime, event.end.dateTime);
      const hours = parseFloat(duration.split(':')[0]) + parseFloat(duration.split(':')[1]) / 60;
      return total + hours;
    }, 0);
  };

  const totalHours = getTotalHours(projectEvents);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Events
          </CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-bold">
              {Math.floor(totalHours)}:{Math.round((totalHours % 1) * 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {projectEvents.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectEvents.map((event) => {
                  const { activityType, description } = parseEventTitle(event.summary || '');
                  const duration = calculateDuration(event.start.dateTime, event.end.dateTime);
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell>{formatEventDate(event.start.dateTime)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{activityType}</Badge>
                      </TableCell>
                      <TableCell>{description || '(No description)'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {duration}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
  );
};

export default ProjectEventsCard;
