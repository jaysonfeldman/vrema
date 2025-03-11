
import React from 'react';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import TotalHoursView from '@/components/TotalHoursView';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import ProjectsOverview from '@/components/ProjectsOverview';
import CalendarEventsDatabaseView from '@/components/CalendarEventsDatabaseView';
import { useCalendarSync } from '@/hooks/useCalendarSync';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useCalendarSync();
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <GoogleCalendarSync />
      <TotalHoursView />
      {isAuthenticated && (
        <>
          <CalendarEventsDatabaseView />
          <CalendarEventsTable />
          <ProjectsOverview />
        </>
      )}
    </div>
  );
};

export default Dashboard;
