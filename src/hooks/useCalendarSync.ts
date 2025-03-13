import { useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useSharedState } from './useSharedState';
import { GoogleCalendarEvent } from '@/lib/types';

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
    setCustomProjects,
    setIsLoading
  } = useSharedState();

  // Sync calendar data
  const syncCalendar = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      setIsLoading(true);
      const accessToken = await getAccessToken();
      
      // Get events from last 30 days to next 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      console.log('Fetching calendar events...'); // Debug log

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${thirtyDaysAgo.toISOString()}&timeMax=${thirtyDaysFromNow.toISOString()}&singleEvents=true&orderBy=startTime`,
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
      const calendarEvents = data.items || [];
      
      console.log('Fetched calendar events:', calendarEvents); // Debug log
      
      // Process events to extract projects
      const projectMap = new Map();
      
      calendarEvents.forEach((event: GoogleCalendarEvent) => {
        if (event.summary && event.summary.includes('#')) {
          const [projectName, rest] = event.summary.split('#');
          const [activityType, ...descParts] = rest.split(' ');
          
          const trimmedProjectName = projectName.trim();
          
          if (!projectMap.has(trimmedProjectName)) {
            projectMap.set(trimmedProjectName, {
              id: trimmedProjectName.toLowerCase(),
              name: trimmedProjectName,
              filterTerm: trimmedProjectName.toLowerCase(),
              totalHours: 0,
              activities: [],
              teamMembers: authState.user ? [{
                id: authState.user.id,
                name: authState.user.name,
                imageUrl: authState.user.imageUrl
              }] : [],
              budgetHours: null
            });
          }
          
          const project = projectMap.get(trimmedProjectName);
          
          if (event.start?.dateTime && event.end?.dateTime) {
            const start = new Date(event.start.dateTime);
            const end = new Date(event.end.dateTime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            
            project.totalHours += hours;
            
            // Update or add activity
            const trimmedActivityType = activityType.trim();
            const existingActivity = project.activities.find(a => a.type === trimmedActivityType);
            if (existingActivity) {
              existingActivity.hours += hours;
            } else {
              project.activities.push({
                id: `${project.id}-${trimmedActivityType}`,
                type: trimmedActivityType,
                hours: hours,
                date: start
              });
            }
          }
        }
      });

      const projects = Array.from(projectMap.values());
      console.log('Processed projects:', projects); // Debug log
      
      setEvents(calendarEvents);
      setCustomProjects(projects);
      setLastSynced(new Date());
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user, getAccessToken, setEvents, setCustomProjects, setLastSynced, setIsLoading]);

  // Filter events based on current filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...events];

      if (filters.project && filters.project !== 'All projects') {
        filtered = filtered.filter(event => {
          const project = customProjects.find(p => p.id === filters.project);
          return project && event.summary?.includes(project.name);
        });
      }

      if (filters.activity && filters.activity !== 'All activities') {
        filtered = filtered.filter(event => 
          event.summary?.includes(`#${filters.activity}`)
        );
      }

      // Add more filters as needed (date range, team members, etc.)

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
