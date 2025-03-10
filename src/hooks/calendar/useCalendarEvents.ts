
import { useState, useCallback } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { 
  fetchCalendarEvents, 
  parseEventTitle 
} from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent, FilterOptions } from '@/lib/types';
import { addDays } from 'date-fns';

export function useCalendarEvents() {
  const { authState, refreshToken } = useGoogleAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const syncCalendar = useCallback(async (days = 30) => {
    setSyncError(null);
    
    if (!authState.isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please connect to Google Calendar first",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await refreshToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Please reconnect your Google Calendar",
        });
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
      
      if (validEvents.length === 0) {
        toast({
          variant: "destructive",
          title: "No valid events found",
          description: "Could not find any events with start and end times",
        });
      }
      
      setEvents(validEvents);
      setFilteredEvents(validEvents);
      setLastSynced(new Date());
      
      toast({
        title: "Calendar synced",
        description: `Found ${validEvents.length} events from your Google Calendar`,
      });
      
      return { events: validEvents };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not sync with Google Calendar';
      setSyncError(errorMessage);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
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
