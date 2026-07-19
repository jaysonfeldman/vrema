import { useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from './useSharedState';
import { GoogleCalendarEvent } from '@/lib/types';
import { DEV_ACCESS_TOKEN, devCalendarEvents } from '@/lib/dev-auth';
import { parseEventTitle } from '@/services/googleCalendarService';
import { getDateRange } from '@/lib/eventStats';

export const useCalendarSync = () => {
  const { authState, getAccessToken } = useGoogleAuth();
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
    setIsLoading
  } = useSharedState();

  // Sync calendar data
  const syncCalendar = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      const accessToken = await getAccessToken();

      let calendarEvents: GoogleCalendarEvent[];

      if (accessToken === DEV_ACCESS_TOKEN) {
        calendarEvents = devCalendarEvents;
      } else {
        // Fetch a wide window so month/year filters have data:
        // from the start of last year through 30 days ahead.
        const timeMin = new Date(new Date().getFullYear() - 1, 0, 1);
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 30);

        console.log('Fetching calendar events...'); // Debug log

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=2500`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }

        const data = await response.json();
        calendarEvents = data.items || [];
      }
      
      console.log('Fetched calendar events:', calendarEvents);

      setEvents(calendarEvents);
      setLastSynced(new Date());
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, getAccessToken, setEvents, setLastSynced, setIsLoading]);

  // Filter events based on current filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...events];

      if (filters.project && filters.project !== 'All') {
        filtered = filtered.filter((event) => {
          const { projectName } = parseEventTitle(event.summary ?? '');
          return projectName.toLowerCase() === filters.project.toLowerCase()
            || customProjects.some((project) => project.id === filters.project && project.name === projectName);
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
        if (!event.start?.dateTime) {
          return false;
        }

        const eventStart = new Date(event.start.dateTime);
        return eventStart >= startDate && eventStart <= endDate;
      });

      setFilteredEvents(filtered);
    };

    applyFilters();
  }, [events, filters, customProjects, setFilteredEvents]);

  // Initial sync
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
    customProjects
  };
};
