
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import TotalHoursView from '@/components/TotalHoursView';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import ProjectOverview from '@/components/project/ProjectOverview';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authState } = useGoogleAuth();
  const { syncCalendar, lastSynced, isAuthenticated, events, customProjects, updateFilters } = useCalendarSync();
  const [activeTab, setActiveTab] = useState<string>("events");
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const projectParam = params.get('project');
    
    // Set active tab based on URL parameter
    if (tabParam && (tabParam === 'events' || tabParam === 'projects')) {
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

  // Make sure all projects are shown by default
  useEffect(() => {
    // Reset project filters to ensure all projects are shown initially
    if (customProjects.length > 0) {
      console.log("Showing all projects by default");
      updateFilters({ 
        project: 'All',
        selectedProjects: customProjects.map(p => p.name)
      });
    }
  }, [customProjects, updateFilters]);

  // Auto-sync calendar when authenticated and not yet synced
  useEffect(() => {
    if (authState.isAuthenticated && !initialSyncDone && !lastSynced) {
      console.log("Auto-syncing calendar from Index component");
      // Only sync if we haven't synced before
      syncCalendar(90); // Show 3 months of data for better project visibility
      setInitialSyncDone(true);
    }
  }, [authState.isAuthenticated, initialSyncDone, syncCalendar, lastSynced]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        
        <div className="space-y-8 pt-4">
          <TotalHoursView />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="events">Calendar Events</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events">
              <CalendarEventsTable />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectOverview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
