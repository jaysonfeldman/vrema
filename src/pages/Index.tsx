
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import ProjectsOverview from '@/components/ProjectsOverview';
import TotalHoursView from '@/components/TotalHoursView';
import ProjectView from '@/components/ProjectView';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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
    console.log("Index - Current project filters:", projectFilters);
    console.log("Index - Custom projects count:", customProjects.length);
  }, [projectFilters, customProjects]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        
        {isAuthenticated && (
          <>
            {/* Notification for uncategorized entries (if needed) */}
            {events.length > 0 && customProjects.length === 0 && (
              <Alert className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertDescription className="flex justify-between items-center">
                  <span>{events.length} entries are uncategorized</span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    View entries
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="dashboard" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="dashboard">Dashboard Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="events">Calendar Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <div className="space-y-8">
                  <TotalHoursView />
                  <ProjectsOverview />
                </div>
              </TabsContent>
              
              <TabsContent value="projects">
                <ProjectView />
              </TabsContent>
              
              <TabsContent value="events">
                <CalendarEventsTable />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
