
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        
        <div className="space-y-8 pt-4">
          <TotalHoursView />
          <ProjectsOverview />
        </div>
      </div>
    </div>
  );
};

export default Index;
