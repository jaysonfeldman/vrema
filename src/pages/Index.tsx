
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import CalendarProjectsList from '@/components/CalendarProjectsList';
import CalendarEventsTable from '@/components/CalendarEventsTable';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';

const Index: React.FC = () => {
  const { authState } = useGoogleAuth();
  const { syncCalendar, lastSynced } = useCalendarSync();

  // Auto-sync calendar when authenticated and not yet synced
  useEffect(() => {
    if (authState.isAuthenticated && !lastSynced) {
      syncCalendar();
    }
  }, [authState.isAuthenticated, lastSynced, syncCalendar]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-6 px-4">
        <GoogleCalendarSync />
        <CalendarProjectsList />
        <CalendarEventsTable />
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
