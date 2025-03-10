
import React from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CalendarEventFilters from './calendar/CalendarEventFilters';
import CalendarEventListView from './calendar/CalendarEventListView';
import CalendarEventDayView from './calendar/CalendarEventDayView';
import CalendarSyncStatus from './calendar/CalendarSyncStatus';

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
          <CalendarSyncStatus 
            lastSynced={lastSynced}
            isLoading={isLoading}
            onSync={() => syncCalendar(filters.dateRange)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <CalendarEventFilters 
            searchTerm={filters.searchTerm}
            onSearchChange={(value) => updateFilters({ searchTerm: value })}
            project={filters.project}
            projects={projects}
            onProjectChange={(value) => updateFilters({ project: value })}
            dateRange={filters.dateRange}
            onDateRangeChange={(days) => {
              updateFilters({ dateRange: days });
              syncCalendar(days);
            }}
          />

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="day">Day View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-4">
              <CalendarEventListView events={filteredEvents} />
            </TabsContent>
            
            <TabsContent value="day" className="mt-4">
              <CalendarEventDayView events={filteredEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarEventsTable;
