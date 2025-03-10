
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import CalendarProjectsList from '@/components/CalendarProjectsList';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import ProjectView from '@/components/ProjectView';
import TotalHoursView from '@/components/TotalHoursView';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  const { authState } = useGoogleAuth();
  const { syncCalendar, lastSynced, isAuthenticated, events, projectFilters, customProjects } = useCalendarSync();

  // Auto-sync calendar when authenticated and not yet synced
  useEffect(() => {
    if (authState.isAuthenticated && (!lastSynced || events.length === 0)) {
      console.log("Auto-syncing calendar from Index component");
      syncCalendar();
    }
  }, [authState.isAuthenticated, lastSynced, syncCalendar, events.length]);

  // For debugging
  useEffect(() => {
    console.log("Current project filters:", projectFilters);
    console.log("Custom projects:", customProjects.length);
  }, [projectFilters, customProjects]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        
        {isAuthenticated && (
          <Tabs defaultValue="dashboard" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">Dashboard Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="events">Calendar Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <TotalHoursView />
              <CalendarProjectsList />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectView />
            </TabsContent>
            
            <TabsContent value="events">
              <CalendarEventsTable />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
