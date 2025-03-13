import React from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from '@/hooks/useSharedState';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import TotalHoursView from '@/components/TotalHoursView';
import ProjectsOverview from '@/components/ProjectsOverview';
import Header from '@/components/Header';

export default function Index() {
  const { isAuthenticated } = useGoogleAuth();
  const { syncCalendar } = useCalendarSync();
  const { lastSynced } = useSharedState();

  // Initial sync
  React.useEffect(() => {
    if (isAuthenticated && !lastSynced) {
      syncCalendar();
    }
  }, [isAuthenticated, lastSynced, syncCalendar]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <TotalHoursView />
        <ProjectsOverview />
      </main>
    </div>
  );
}
