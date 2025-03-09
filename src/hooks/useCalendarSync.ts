
import { useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { fetchCalendarEvents, convertEventsToActivities } from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent, FilterOptions, Project } from '@/lib/types';
import { addDays, format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function useCalendarSync() {
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
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    project: 'All',
    dateRange: 30
  });
  
  const [projectFilters, setProjectFilters] = useState<{[key: string]: string}>({});
  const [customProjects, setCustomProjects] = useState<Project[]>([]);

  // Define all callbacks first to maintain proper hook order
  const getProjectNameFromEvent = useCallback((event: GoogleCalendarEvent): string => {
    return event.summary.includes(':') 
      ? event.summary.split(':')[0].trim() 
      : 'Other';
  }, []);

  const determineActivityType = useCallback((event: GoogleCalendarEvent): 'design' | 'strategy' | 'dev' | 'meetings' | 'admin' => {
    const lowerSummary = event.summary.toLowerCase();
    const lowerDescription = (event.description || '').toLowerCase();
    
    if (lowerSummary.includes('design') || lowerDescription.includes('design')) {
      return 'design';
    } else if (lowerSummary.includes('dev') || lowerDescription.includes('dev') || 
              lowerSummary.includes('code') || lowerDescription.includes('code')) {
      return 'dev';
    } else if (lowerSummary.includes('strategy') || lowerDescription.includes('strategy') ||
              lowerSummary.includes('planning') || lowerDescription.includes('planning')) {
      return 'strategy';
    } else if (lowerSummary.includes('admin') || lowerDescription.includes('admin')) {
      return 'admin';
    } else {
      return 'meetings';
    }
  }, []);

  // Get all unique projects from events
  const getProjects = useCallback((): string[] => {
    if (!events.length) return [];
    
    const projectSet = new Set<string>();
    projectSet.add('All');
    
    events.forEach(event => {
      const projectName = getProjectNameFromEvent(event);
      projectSet.add(projectName);
    });
    
    return Array.from(projectSet);
  }, [events, getProjectNameFromEvent]);

  // Add a new project filter
  const addProjectFilter = useCallback((projectId: string, filterTerm: string) => {
    setProjectFilters(prev => ({
      ...prev,
      [projectId]: filterTerm
    }));
  }, []);

  // Remove a project filter
  const removeProjectFilter = useCallback((projectId: string) => {
    setProjectFilters(prev => {
      const newFilters = {...prev};
      delete newFilters[projectId];
      return newFilters;
    });
  }, []);

  // Get total hours logged across all events
  const getTotalHours = useCallback(() => {
    if (filteredEvents.length === 0) return 0;
    
    let totalHours = 0;
    filteredEvents.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (durationHours > 0) {
        totalHours += durationHours;
      }
    });
    
    return totalHours;
  }, [filteredEvents]);

  // Get hours by activity type
  const getActivityHours = useCallback((activityType: 'design' | 'strategy' | 'dev' | 'meetings' | 'admin') => {
    if (filteredEvents.length === 0) return 0;
    
    let activityHours = 0;
    filteredEvents.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const type = determineActivityType(event);
      if (type === activityType) {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (durationHours > 0) {
          activityHours += durationHours;
        }
      }
    });
    
    return activityHours;
  }, [filteredEvents, determineActivityType]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  }, []);

  const syncCalendar = useCallback(async (days = 30) => {
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
  }, [authState.isAuthenticated, authState.token]);

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
        const projectName = getProjectNameFromEvent(event);
        return projectName === filters.project;
      });
    }
    
    // Apply date range filter (convert days to date range)
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - filters.dateRange);
    
    filtered = filtered.filter(event => {
      if (!event.start?.dateTime) return false;
      const eventDate = new Date(event.start.dateTime);
      return eventDate >= startDate && eventDate <= today;
    });
    
    setFilteredEvents(filtered);
  }, [events, filters, getProjectNameFromEvent]);

  // Create custom projects when events or project filters change
  useEffect(() => {
    if (events.length === 0) return;
    
    const newCustomProjects: Project[] = [];
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);

    // For each project filter, create a custom project
    Object.entries(projectFilters).forEach(([projectId, filterTerm]) => {
      const filteredEvents = events.filter(event => 
        event.summary.toLowerCase().includes(filterTerm.toLowerCase())
      );
      
      if (filteredEvents.length === 0) return;
      
      // Calculate total hours for this project
      let totalHours = 0;
      let thisMonthHours = 0;
      const activities: any[] = [];
      
      filteredEvents.forEach(event => {
        if (!event.start?.dateTime || !event.end?.dateTime) return;
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        // Skip events with zero or negative duration
        if (durationHours <= 0) return;
        
        totalHours += durationHours;
        
        // Check if event is in current month
        if (isWithinInterval(startTime, { start: startOfCurrentMonth, end: endOfCurrentMonth })) {
          thisMonthHours += durationHours;
        }
        
        // Determine activity type
        let activityType = determineActivityType(event);
        
        // Add to activities
        const existingActivity = activities.find(a => a.type === activityType);
        if (existingActivity) {
          existingActivity.hours += durationHours;
        } else {
          activities.push({
            id: `${projectId}-${activityType}`,
            type: activityType,
            hours: durationHours,
            date: startTime
          });
        }
      });
      
      if (totalHours > 0) {
        newCustomProjects.push({
          id: projectId,
          name: projectId,
          totalHours: totalHours,
          budgetHours: 120, // Default budget hours
          activities: activities,
          teamMembers: [],
          monthlyHours: thisMonthHours
        });
      }
    });
    
    setCustomProjects(newCustomProjects);
  }, [events, projectFilters, determineActivityType]);

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
    getProjects,
    projectFilters,
    addProjectFilter,
    removeProjectFilter,
    customProjects,
    getTotalHours,
    getActivityHours
  };
}
