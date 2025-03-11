
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { fetchCalendarEventsFromSupabase } from '@/services/calendarEventService';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  project_id: string | null;
  activity_type: string;
  hours: number;
  event_id: string;
}

const CalendarEventsDatabaseView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCalendarEventsFromSupabase();
        setEvents(data);
      } catch (error) {
        console.error('Error loading calendar events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Synced Calendar Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
          </>
        ) : events.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">
            No calendar events have been synced yet. Sync your calendar to save events.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 10).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      {format(parseISO(event.start_time), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.activity_type}</Badge>
                    </TableCell>
                    <TableCell>{formatDuration(event.hours)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {events.length > 10 && (
              <p className="text-sm text-center mt-4 text-muted-foreground">
                Showing 10 of {events.length} events
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarEventsDatabaseView;
