
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import ProjectsOverview from '@/components/ProjectsOverview';
import TotalHoursView from '@/components/TotalHoursView';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState } = useGoogleAuth();
  const { syncCalendar, lastSynced, isAuthenticated, events, projectFilters, customProjects, updateFilters } = useCalendarSync();
  const [activeTab, setActiveTab] = useState<string>("projects");
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const projectParam = params.get('project');
    
    // Set active tab based on URL parameter
    if (tabParam && (tabParam === 'projects' || tabParam === 'events')) {
      setActiveTab(tabParam);
    }
    
    // Set project filter based on URL parameter
    if (projectParam) {
      updateFilters({ project: projectParam });
    }
    
    // Clean URL after processing parameters
    if (tabParam || projectParam) {
      navigate('/', { replace: true });
    }
  }, [location, navigate, updateFilters]);

  // Auto-sync calendar when authenticated and not yet synced
  useEffect(() => {
    if (authState.isAuthenticated && !initialSyncDone) {
      console.log("Auto-syncing calendar from Index component");
      // Start with a shorter timeframe for faster initial load
      syncCalendar(30);
      setInitialSyncDone(true);
    }
  }, [authState.isAuthenticated, initialSyncDone, syncCalendar]);

  // Force a resync if we have auth but no events
  useEffect(() => {
    if (authState.isAuthenticated && events.length === 0 && initialSyncDone) {
      // Only do this once after a short delay
      const timer = setTimeout(() => {
        console.log("No events found after initial sync, retrying with longer timeframe");
        syncCalendar(60);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authState.isAuthenticated, events.length, initialSyncDone, syncCalendar]);

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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="projects">Project Cards</TabsTrigger>
              <TabsTrigger value="events">Calendar Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              <ProjectsOverview />
            </TabsContent>
            
            <TabsContent value="events">
              <CalendarEventsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
