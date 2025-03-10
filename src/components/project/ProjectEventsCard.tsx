
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleCalendarEvent } from '@/lib/types';
import { formatEventDate, calculateDuration, parseEventTitle } from '@/services/googleCalendarService';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

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
                >
                  #{activity}
                </Button>
              ))}
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => {
                    const { activityType, description } = parseEventTitle(event.summary || '');
                    const duration = calculateDuration(event.start.dateTime, event.end.dateTime);
                    
                    return (
                      <TableRow key={event.id} className="group hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(event.start.dateTime), 'MMM d')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(event.start.dateTime), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{activityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {description || '(No description)'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-mono">
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
