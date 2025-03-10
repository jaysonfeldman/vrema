
import { useState, useCallback } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { 
  fetchCalendarEvents, 
  parseEventTitle,
  associateEventsWithProjects
} from '@/services/googleCalendarService';
import { toast } from 'sonner';
import { GoogleCalendarEvent, FilterOptions, Project } from '@/lib/types';

export function useCalendarEvents() {
  const { authState, refreshToken } = useGoogleAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  const syncCalendar = useCallback(async (days = 30, projects: Project[] = []) => {
    setSyncError(null);
    
    // Prevent multiple sync operations at once
    if (syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }
    
    if (!authState.isAuthenticated) {
      console.log('Not authenticated, skipping sync');
      return;
    }

    setIsLoading(true);
    setSyncInProgress(true);
    
    try {
      const token = await refreshToken();
      if (!token) {
        console.log('No valid token available, skipping sync');
        return;
      }
      
      console.log(`Syncing calendar data for the last ${days} days...`);
      
      const fetchedEvents = await fetchCalendarEvents(token, days);
      
      console.log(`Fetched ${fetchedEvents.length} calendar events`);
      
      const validEvents = fetchedEvents.filter(event => {
        const hasValidTimes = event.start?.dateTime && event.end?.dateTime;
        if (!hasValidTimes) {
          console.log(`Skipping event without valid times: ${event.summary}`);
        }
        return hasValidTimes;
      });
      
      console.log(`${validEvents.length} events have valid start/end times`);
      
      // Associate events with projects if projects are provided
      const eventsWithProjects = projects.length > 0 
        ? associateEventsWithProjects(validEvents, projects)
        : validEvents;
      
      setEvents(eventsWithProjects);
      setFilteredEvents(eventsWithProjects);
      setLastSynced(new Date());
      
      if (eventsWithProjects.length > 0) {
        toast.success(`Calendar synced`, {
          description: `Found ${eventsWithProjects.length} events`
        });
      } else {
        toast.info('No events found', { 
          description: 'No calendar events found in the selected time period'
        });
      }
      
      return { events: eventsWithProjects };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not sync with Google Calendar';
      setSyncError(errorMessage);
      
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('permission') || errorLower.includes('scope')) {
        toast.error('Permission denied', {
          description: 'Check Google Calendar access permissions'
        });
      } else if (errorLower.includes('authentication') || errorLower.includes('token')) {
        toast.error('Authentication error', {
          description: 'Please try reconnecting your Google Calendar'
        });
      } else {
        toast.error('Sync failed', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setSyncInProgress(false);
    }
  }, [authState.isAuthenticated, refreshToken]);

  const getProjectNameFromEvent = useCallback((event: GoogleCalendarEvent): string => {
    if (!event.summary) return 'Other';
    
    const { projectName } = parseEventTitle(event.summary);
    return projectName;
  }, []);

  const determineActivityType = useCallback((event: GoogleCalendarEvent): string => {
    if (!event.summary) return 'other';
    
    const { activityType } = parseEventTitle(event.summary);
    return activityType;
  }, []);

  return {
    syncCalendar,
    events,
    filteredEvents,
    setFilteredEvents,
    isLoading,
    lastSynced,
    syncError,
    getProjectNameFromEvent,
    determineActivityType,
    isAuthenticated: authState.isAuthenticated,
  };
}
