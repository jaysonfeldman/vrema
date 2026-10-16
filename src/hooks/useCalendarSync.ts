import { useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from './useSharedState';
import { useTeamStore } from './useTeamStore';
import { GoogleCalendarEvent } from '@/lib/types';
import { DEV_ACCESS_TOKEN, devCalendarEvents } from '@/lib/dev-auth';
import { DEMO_ACCESS_TOKEN, demoCalendarEvents } from '@/lib/demo-data';
import { fetchCalendarEvents, parseEventTitle } from '@/services/googleCalendarService';
import { getDateRange } from '@/lib/eventStats';
import { toast } from '@/hooks/use-toast';

export const useCalendarSync = () => {
  const { authState, getAccessToken, isDemoMode } = useGoogleAuth();
  const syncGoogleEntries = useTeamStore((s) => s.syncGoogleEntries);
  const {
    events,
    filteredEvents,
    filters,
    updateFilters,
    setEvents,
    setFilteredEvents,
    lastSynced,
    setLastSynced,
    customProjects,
    setIsLoading,
  } = useSharedState();

  const syncCalendar = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    if (useSharedState.getState().isLoading) return false;
    try {
      setIsLoading(true);
      const accessToken = await getAccessToken();

      let calendarEvents: GoogleCalendarEvent[];

      if (accessToken === DEMO_ACCESS_TOKEN) {
        calendarEvents = demoCalendarEvents;
      } else if (accessToken === DEV_ACCESS_TOKEN) {
        calendarEvents = devCalendarEvents;
      } else {
        const timeMin = new Date(new Date().getFullYear() - 1, 0, 1);
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 30);

        calendarEvents = await fetchCalendarEvents(accessToken, { timeMin, timeMax });
      }

      setEvents(calendarEvents);
      setLastSynced(new Date());

      // Team workspace sync runs in the background so the UI isn't blocked.
      if (!isDemoMode && accessToken !== DEMO_ACCESS_TOKEN && accessToken !== DEV_ACCESS_TOKEN) {
        const hashed = calendarEvents
          .filter(
            (event) =>
              event.id && event.start?.dateTime && event.end?.dateTime && event.summary?.includes('#')
          )
          .map((event) => {
            const { projectName, activityType, description } = parseEventTitle(event.summary ?? '');
            return {
              googleEventId: event.id!,
              title: event.summary || '',
              description: description || undefined,
              projectId: projectName ? projectName.toLowerCase() : null,
              projectName,
              activityType,
              startTime: event.start!.dateTime!,
              endTime: event.end!.dateTime!,
            };
          });
        if (hashed.length) {
          void syncGoogleEntries(accessToken, hashed).catch((err) => {
            console.error('Failed to sync calendar entries to team workspace:', err);
            toast({ title: 'Team sync failed', description: 'Your Google events loaded, but could not be saved to the team workspace.', variant: 'destructive' });
          });
        }
      }
      return true;
    } catch (error) {
      toast({
        title: 'Calendar sync failed',
        description: error instanceof Error ? error.message : 'Could not connect to Google Calendar. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    authState.isAuthenticated,
    getAccessToken,
    isDemoMode,
    setEvents,
    setLastSynced,
    setIsLoading,
    syncGoogleEntries,
  ]);

  useEffect(() => {
    let filtered = [...events];

    if (filters.project && filters.project !== 'All') {
      filtered = filtered.filter((event) => {
        const { projectName } = parseEventTitle(event.summary ?? '');
        return (
          projectName.toLowerCase() === filters.project.toLowerCase() ||
          customProjects.some((project) => project.id === filters.project && project.name === projectName)
        );
      });
    }

    if (filters.activity && filters.activity !== 'All') {
      filtered = filtered.filter((event) => {
        const { activityType } = parseEventTitle(event.summary ?? '');
        return activityType.toLowerCase() === filters.activity.toLowerCase();
      });
    }

    const { startDate, endDate } = getDateRange(filters.dateRange);
    filtered = filtered.filter((event) => {
      if (!event.start?.dateTime) return false;
      const eventStart = new Date(event.start.dateTime);
      return eventStart >= startDate && eventStart <= endDate;
    });

    setFilteredEvents(filtered);
  }, [events, filters, customProjects, setFilteredEvents]);

  return {
    events,
    filteredEvents,
    filters,
    updateFilters,
    lastSynced,
    syncCalendar,
    customProjects,
  };
};
