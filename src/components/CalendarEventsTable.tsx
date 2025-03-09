
import React, { useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatEventDate, getDayOfWeek, calculateDuration } from '@/services/googleCalendarService';
import { Search, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CalendarEventsTable: React.FC = () => {
  const { 
    filteredEvents, 
    filters, 
    updateFilters, 
    getProjects, 
    isAuthenticated, 
    syncCalendar,
    lastSynced,
    isLoading 
  } = useCalendarSync();

  if (!isAuthenticated) {
    return null;
  }

  const projects = getProjects();

  return (
    <Card className="my-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Calendar Events</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastSynced && (
              <span>Last synced: {format(lastSynced, 'MMM d, h:mm a')}</span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => syncCalendar(filters.dateRange)}
              disabled={isLoading}
            >
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                className="pl-8"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center">
              <Select
                value={filters.project}
                onValueChange={(value) => updateFilters({ project: value })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange.toString()}
                onValueChange={(value) => {
                  const days = parseInt(value);
                  updateFilters({ dateRange: days });
                  syncCalendar(days);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="day">Day View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No events found. Try adjusting your filters or sync your calendar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.map((event) => {
                        const projectName = event.summary.includes(':') 
                          ? event.summary.split(':')[0].trim() 
                          : 'Other';
                        
                        const eventName = event.summary.includes(':') 
                          ? event.summary.split(':').slice(1).join(':').trim() 
                          : event.summary;
                          
                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{eventName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{projectName}</Badge>
                            </TableCell>
                            <TableCell>{formatEventDate(event.start.dateTime)}</TableCell>
                            <TableCell>{formatEventDate(event.end.dateTime)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {calculateDuration(event.start.dateTime, event.end.dateTime)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="day" className="mt-4">
              <div className="space-y-8">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No events found. Try adjusting your filters or sync your calendar.
                  </div>
                ) : (
                  Object.entries(
                    filteredEvents.reduce((acc, event) => {
                      const day = event.start.dateTime.split('T')[0];
                      if (!acc[day]) acc[day] = [];
                      acc[day].push(event);
                      return acc;
                    }, {} as Record<string, typeof filteredEvents>)
                  )
                    .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
                    .map(([day, dayEvents]) => (
                      <div key={day} className="space-y-2">
                        <div className="sticky top-0 bg-background pt-2 pb-1 z-10">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(day), 'EEEE, MMMM d, yyyy')}
                          </h3>
                        </div>
                        
                        <div className="grid gap-2">
                          {dayEvents
                            .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
                            .map((event) => {
                              const projectName = event.summary.includes(':') 
                                ? event.summary.split(':')[0].trim() 
                                : 'Other';
                              
                              const eventName = event.summary.includes(':') 
                                ? event.summary.split(':').slice(1).join(':').trim() 
                                : event.summary;
                                
                              return (
                                <div 
                                  key={event.id} 
                                  className="rounded-md border p-4 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium">{eventName}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {format(new Date(event.start.dateTime), 'h:mm a')} - {format(new Date(event.end.dateTime), 'h:mm a')}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{projectName}</Badge>
                                      <span className="text-sm flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        {calculateDuration(event.start.dateTime, event.end.dateTime)}
                                      </span>
                                    </div>
                                  </div>
                                  {event.description && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                      {event.description}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarEventsTable;
