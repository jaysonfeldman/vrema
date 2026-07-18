import React from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from '@/hooks/useSharedState';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import TotalHoursView from '@/components/TotalHoursView';
import WeeklyProjectHours from '@/components/WeeklyProjectHours';
import ProjectsOverview from '@/components/ProjectsOverview';
import Header from '@/components/Header';

export default function Index() {
  const { authState } = useGoogleAuth();
  const { syncCalendar } = useCalendarSync();
  const { lastSynced } = useSharedState();

  React.useEffect(() => {
    if (authState.isAuthenticated && !lastSynced) {
      syncCalendar();
    }
  }, [authState.isAuthenticated, lastSynced, syncCalendar]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-10">
        <TotalHoursView />
        <WeeklyProjectHours />
        <ProjectsOverview />
      </main>
    </div>
  );
}
