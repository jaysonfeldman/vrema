
import { useState } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { fetchCalendarEvents, convertEventsToActivities } from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent } from '@/lib/types';

export const useCalendarSync = () => {
  const { authState } = useGoogleAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [projectStats, setProjectStats] = useState<{
    projectMap: Record<string, number>,
    activityMap: Record<string, { type: string, hours: number }[]>
  }>({
    projectMap: {},
    activityMap: {}
  });

  const syncCalendar = async (days = 30) => {
    if (!authState.isAuthenticated || !authState.token) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please connect to Google Calendar first",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fetchedEvents = await fetchCalendarEvents(authState.token, days);
      setEvents(fetchedEvents);
      
      const stats = convertEventsToActivities(fetchedEvents);
      setProjectStats(stats);
      
      setLastSynced(new Date());
      
      toast({
        title: "Calendar synced",
        description: `Found ${fetchedEvents.length} events from your Google Calendar`,
      });
      
      return { events: fetchedEvents, stats };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Could not sync with Google Calendar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncCalendar,
    events,
    isLoading,
    lastSynced,
    projectStats,
    isAuthenticated: authState.isAuthenticated
  };
};
