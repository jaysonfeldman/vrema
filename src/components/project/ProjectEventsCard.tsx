
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Filter, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarEvent } from '@/lib/types';
import { formatEventDate, calculateDuration, parseEventTitle } from '@/services/googleCalendarService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import ActivityTag from '@/components/ActivityTag';

interface ProjectEventsCardProps {
  projectEvents: GoogleCalendarEvent[];
  syncCalendar: (days: number) => void;
}

const ProjectEventsCard: React.FC<ProjectEventsCardProps> = ({
  projectEvents,
  syncCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  
  // Filter events by search query and activity type
  const filteredEvents = projectEvents.filter(event => {
    const eventContent = event.summary?.toLowerCase() || '';
    const matchesSearch = searchQuery === '' || eventContent.includes(searchQuery.toLowerCase());
    
    if (activityFilter) {
      const { activityType } = parseEventTitle(event.summary || '');
      return matchesSearch && activityType === activityFilter;
    }
    
    return matchesSearch;
  });

  // Extract unique activity types
  const activityTypes = Array.from(new Set(
    projectEvents.map(event => {
      const { activityType } = parseEventTitle(event.summary || '');
      return activityType;
    }).filter(Boolean)
  ));

  const getTotalHours = (events: GoogleCalendarEvent[]) => {
    return events.reduce((total, event) => {
      if (!event.start?.dateTime || !event.end?.dateTime) return total;
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  const totalHours = getTotalHours(filteredEvents);
  const formatTotalHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Group events by day for better organization
  const eventsByDay = filteredEvents.reduce((grouped, event) => {
    const day = event.start.dateTime.split('T')[0];
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(event);
    return grouped;
  }, {} as Record<string, GoogleCalendarEvent[]>);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Events
            </CardTitle>
            <CardDescription>
              {filteredEvents.length} events, {formatTotalHours(totalHours)} total
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => syncCalendar(90)}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {projectEvents.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activityFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setActivityFilter(null)}
              >
                All
              </Button>
              {activityTypes.map(activity => (
                <Button
                  key={activity}
                  variant={activityFilter === activity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivityFilter(activity === activityFilter ? null : activity)}
                  className="flex items-center"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  #{activity}
                </Button>
              ))}
            </div>
            
            <div className="space-y-6">
              {Object.entries(eventsByDay)
                .sort(([dayA], [dayB]) => dayB.localeCompare(dayA)) // Sort days in descending order
                .map(([day, dayEvents]) => (
                  <div key={day} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 border-b pb-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(day), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead className="text-right">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dayEvents
                            .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
                            .map((event) => {
                              const { activityType, description } = parseEventTitle(event.summary || '');
                              const startTime = new Date(event.start.dateTime);
                              const endTime = new Date(event.end.dateTime);
                              const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                              
                              return (
                                <TableRow key={event.id} className="group hover:bg-muted/50">
                                  <TableCell>
                                    <div className="font-medium">
                                      {format(startTime, 'h:mm a')}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      to {format(endTime, 'h:mm a')}
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[300px]">
                                    <div className="font-medium truncate">
                                      {description || '(No description)'}
                                    </div>
                                    {event.description && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {event.description}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <ActivityTag type={activityType} />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 font-mono">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      {formatTotalHours(durationInHours)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-medium">
                                Day total:
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold">
                                {formatTotalHours(getTotalHours(dayEvents))}
                              </TableCell>
                            </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
            </div>
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
