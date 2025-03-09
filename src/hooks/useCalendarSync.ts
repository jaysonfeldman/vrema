
import { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { fetchCalendarEvents, convertEventsToActivities } from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent } from '@/lib/types';

export const useCalendarSync = () => {
  const { authState } = useGoogleAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [projectStats, setProjectStats] = useState<{
    projectMap: Record<string, number>,
    activityMap: Record<string, { type: string, hours: number }[]>
  }>({
    projectMap: {},
    activityMap: {}
  });
  const [filters, setFilters] = useState({
    searchTerm: '',
    project: 'All',
    dateRange: 30
  });

  // Effect to apply filters whenever events or filters change
  useEffect(() => {
    if (events.length === 0) return;
    
    let filtered = [...events];
    
    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.summary.toLowerCase().includes(term) || 
        (event.description && event.description.toLowerCase().includes(term))
      );
    }
    
    // Apply project filter
    if (filters.project !== 'All') {
      filtered = filtered.filter(event => {
        const projectName = event.summary.includes(':') 
          ? event.summary.split(':')[0].trim() 
          : 'Other';
        return projectName === filters.project;
      });
    }
    
    setFilteredEvents(filtered);
  }, [events, filters]);

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
      setFilteredEvents(fetchedEvents);
      
      const stats = convertEventsToActivities(fetchedEvents);
      setProjectStats(stats);
      
      setLastSynced(new Date());
      setFilters(prev => ({...prev, dateRange: days}));
      
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

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  };

  // Get all unique projects from events
  const getProjects = (): string[] => {
    if (!events.length) return [];
    
    const projectSet = new Set<string>();
    projectSet.add('All');
    
    events.forEach(event => {
      const projectName = event.summary.includes(':') 
        ? event.summary.split(':')[0].trim() 
        : 'Other';
      projectSet.add(projectName);
    });
    
    return Array.from(projectSet);
  };

  return {
    syncCalendar,
    events,
    filteredEvents,
    isLoading,
    lastSynced,
    projectStats,
    isAuthenticated: authState.isAuthenticated,
    filters,
    updateFilters,
    getProjects
  };
};
