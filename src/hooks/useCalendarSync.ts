import { useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from './useSharedState';
import { useTeamStore } from './useTeamStore';
import { GoogleCalendarEvent } from '@/lib/types';
import { DEV_ACCESS_TOKEN, devCalendarEvents } from '@/lib/dev-auth';
import { DEMO_ACCESS_TOKEN, demoCalendarEvents } from '@/lib/demo-data';
import { parseEventTitle } from '@/services/googleCalendarService';
import { getDateRange } from '@/lib/eventStats';

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

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=2500`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }

        const data = await response.json();
        calendarEvents = data.items || [];
      }

      setEvents(calendarEvents);
      setLastSynced(new Date());

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
          await syncGoogleEntries(accessToken, hashed).catch((err) => {
            console.error('Failed to sync calendar entries to team workspace:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error syncing calendar:', error);
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

  useEffect(() => {
    if (authState.isAuthenticated && !lastSynced) {
      syncCalendar();
    }
  }, [authState.isAuthenticated, lastSynced, syncCalendar]);

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
