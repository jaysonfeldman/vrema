
import { useState, useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { 
  fetchCalendarEvents, 
  convertEventsToActivities, 
  parseEventTitle 
} from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent, FilterOptions, Project, ActivityType } from '@/lib/types';
import { addDays, format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function useCalendarSync() {
  const { authState, refreshToken } = useGoogleAuth();
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
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Local storage key for saving project views
  const LOCAL_STORAGE_KEY = 'calendar-project-views';

  // Define all callbacks first to maintain proper hook order
  const getProjectNameFromEvent = useCallback((event: GoogleCalendarEvent): string => {
    const { projectName } = parseEventTitle(event.summary);
    return projectName;
  }, []);

  const determineActivityType = useCallback((event: GoogleCalendarEvent): ActivityType => {
    const { activityType } = parseEventTitle(event.summary);
    return activityType as ActivityType;
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

  // Load saved project filters from local storage
  const loadSavedProjectFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        console.log('Loaded saved project filters:', parsedFilters);
        return parsedFilters;
      }
    } catch (error) {
      console.error('Error loading saved project filters:', error);
    }
    return {};
  }, []);

  // Save project filters to local storage
  const saveProjectFilters = useCallback((filters: {[key: string]: string}) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
      console.log('Saved project filters to local storage');
    } catch (error) {
      console.error('Error saving project filters:', error);
    }
  }, []);

  // Add a new project filter
  const addProjectFilter = useCallback((projectId: string, filterTerm: string) => {
    console.log(`Adding project filter: ${projectId} with term "${filterTerm}"`);
    setProjectFilters(prev => {
      const newFilters = {
        ...prev,
        [projectId]: filterTerm
      };
      console.log("Updated project filters:", newFilters);
      saveProjectFilters(newFilters);
      return newFilters;
    });
  }, [saveProjectFilters]);

  // Remove a project filter
  const removeProjectFilter = useCallback((projectId: string) => {
    setProjectFilters(prev => {
      const newFilters = {...prev};
      delete newFilters[projectId];
      saveProjectFilters(newFilters);
      return newFilters;
    });
  }, [saveProjectFilters]);

  // Get total hours logged across all events
  const getTotalHours = useCallback(() => {
    console.log('Calculating total hours from', filteredEvents.length, 'events');
    
    if (!filteredEvents.length) return 0;
    
    let totalHours = 0;
    
    filteredEvents.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) {
        console.log('Skipping event without start/end time:', event.summary);
        return;
      }
      
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.log('Skipping event with invalid date:', event.summary);
        return;
      }
      
      // Calculate duration in hours
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Ensure we only count positive durations
      if (!isNaN(durationHours) && durationHours > 0) {
        totalHours += durationHours;
        console.log(`Added ${durationHours.toFixed(2)} hours from event: ${event.summary}`);
      } else {
        console.log(`Skipping event with zero/negative duration: ${event.summary}`);
      }
    });
    
    console.log('Total hours calculated:', totalHours.toFixed(2));
    return totalHours;
  }, [filteredEvents]);

  // Get hours by activity type
  const getActivityHours = useCallback((activityType: ActivityType) => {
    if (!filteredEvents.length) return 0;
    
    let activityHours = 0;
    filteredEvents.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const type = determineActivityType(event);
      if (type === activityType) {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (!isNaN(durationHours) && durationHours > 0) {
          activityHours += durationHours;
        }
      }
    });
    
    return activityHours;
  }, [filteredEvents, determineActivityType]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  }, []);

  // Automatically identify and create projects from events
  const identifyProjectsFromEvents = useCallback((eventsList: GoogleCalendarEvent[]) => {
    if (eventsList.length === 0) {
      console.log("No events to identify projects from");
      return;
    }
    
    console.log(`Identifying projects from ${eventsList.length} events`);
    
    // Get unique project names from all events
    const uniqueProjects = new Set<string>();
    
    eventsList.forEach(event => {
      const { projectName } = parseEventTitle(event.summary);
      if (projectName && projectName !== 'Other') {
        uniqueProjects.add(projectName);
      }
    });
    
    console.log(`Found ${uniqueProjects.size} unique projects in events`);
    
    // Create filter for each unique project if it doesn't exist
    uniqueProjects.forEach(projectName => {
      if (!projectFilters[projectName]) {
        console.log(`Adding automatic project filter for "${projectName}"`);
        addProjectFilter(projectName, projectName);
      }
    });
  }, [projectFilters, addProjectFilter]);

  const syncCalendar = useCallback(async (days = 30) => {
    // Reset any previous sync errors
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
      // First, try to refresh the token if needed
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
      
      // Fetch events for the specified time range
      const fetchedEvents = await fetchCalendarEvents(token, days);
      
      // Log for debugging
      console.log(`Fetched ${fetchedEvents.length} calendar events`);
      
      // Filter out events without start/end dateTime
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
      
      const stats = convertEventsToActivities(validEvents);
      setProjectStats(stats);
      
      setLastSynced(new Date());
      setFilters(prev => ({...prev, dateRange: days}));
      
      toast({
        title: "Calendar synced",
        description: `Found ${validEvents.length} events from your Google Calendar`,
      });
      
      // Automatically identify and create project filters
      identifyProjectsFromEvents(validEvents);
      
      // Force regeneration of custom projects
      updateCustomProjects(validEvents, loadSavedProjectFilters());
      
      return { events: validEvents, stats };
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
  }, [authState.isAuthenticated, refreshToken, identifyProjectsFromEvents, loadSavedProjectFilters]);

  // Effect to apply filters whenever events or filters change
  useEffect(() => {
    if (events.length === 0) return;
    
    console.log('Applying filters to events:', filters);
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
    
    console.log(`Filtered to ${filtered.length} events after applying filters`);
    setFilteredEvents(filtered);
  }, [events, filters, getProjectNameFromEvent]);

  // Helper function to update custom projects
  const updateCustomProjects = useCallback((eventsList: GoogleCalendarEvent[], filters: {[key: string]: string}) => {
    if (eventsList.length === 0) {
      console.log("No events available to create custom projects");
      return;
    }
    
    console.log("Generating custom projects based on filters:", filters);
    
    const newCustomProjects: Project[] = [];
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);

    // For each project filter, create a custom project
    Object.entries(filters).forEach(([projectId, filterTerm]) => {
      console.log(`Creating project "${projectId}" with filter "${filterTerm}"`);
      
      // Find all events that match this project name
      const filteredEvents = eventsList.filter(event => {
        const { projectName } = parseEventTitle(event.summary);
        return projectName.toLowerCase() === filterTerm.toLowerCase();
      });
      
      console.log(`Found ${filteredEvents.length} events matching project "${filterTerm}"`);
      
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
        
        // Determine activity type and extract description
        const { activityType, description } = parseEventTitle(event.summary);
        
        // Add to activities
        const existingActivity = activities.find(a => a.type === activityType);
        if (existingActivity) {
          existingActivity.hours += durationHours;
        } else {
          activities.push({
            id: `${projectId}-${activityType}`,
            type: activityType,
            hours: durationHours,
            description: description,
            date: startTime
          });
        }
      });
      
      if (totalHours > 0) {
        console.log(`Adding project "${projectId}" with ${totalHours.toFixed(2)} hours and ${activities.length} activities`);
        newCustomProjects.push({
          id: projectId,
          name: projectId,
          totalHours: totalHours,
          budgetHours: 120, // Default budget hours
          activities: activities,
          teamMembers: [],
          monthlyHours: thisMonthHours,
          color: getProjectColor(projectId) // Assign a consistent color
        });
      }
    });
    
    console.log(`Generated ${newCustomProjects.length} custom projects`);
    setCustomProjects(newCustomProjects);
  }, []);

  // Generate a consistent color based on project name
  const getProjectColor = (projectName: string) => {
    // Simple hash function to generate a number from a string
    const hash = projectName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Convert to a hue value (0-360)
    const hue = hash % 360;
    
    // Use hsl to generate a color with good saturation and lightness
    return `hsl(${hue}, 70%, 45%)`;
  };

  // Initialize: load saved project filters and set up listeners
  useEffect(() => {
    // Load saved filters on mount
    const savedFilters = loadSavedProjectFilters();
    if (Object.keys(savedFilters).length > 0) {
      setProjectFilters(savedFilters);
    }
  }, [loadSavedProjectFilters]);

  // Create custom projects when events or project filters change
  useEffect(() => {
    updateCustomProjects(events, projectFilters);
  }, [events, projectFilters, updateCustomProjects]);

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
    getActivityHours,
    syncError
  };
}
