import { useState, useCallback, useEffect } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { 
  fetchCalendarEvents, 
  convertEventsToActivities, 
  parseEventTitle 
} from '@/services/googleCalendarService';
import { toast } from '@/components/ui/use-toast';
import { GoogleCalendarEvent, FilterOptions, Project, ActivityType, Activity } from '@/lib/types';
import { addDays, format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { stringToColor } from '@/lib/utils';

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
    dateRange: 30,
    activity: 'All',
    selectedProjects: [],
    selectedActivities: []
  });
  
  const [projectFilters, setProjectFilters] = useState<{[key: string]: string}>({});
  const [customProjects, setCustomProjects] = useState<Project[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const LOCAL_STORAGE_KEY = 'calendar-project-views';
  const PROJECT_SETTINGS_KEY = 'calendar-project-settings';

  const getProjectNameFromEvent = useCallback((event: GoogleCalendarEvent): string => {
    const { projectName } = parseEventTitle(event.summary);
    return projectName;
  }, []);

  const determineActivityType = useCallback((event: GoogleCalendarEvent): ActivityType => {
    const { activityType } = parseEventTitle(event.summary);
    return activityType as ActivityType;
  }, []);

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

  const loadSavedProjectSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(PROJECT_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded saved project settings:', parsedSettings);
        return parsedSettings;
      }
    } catch (error) {
      console.error('Error loading saved project settings:', error);
    }
    return {};
  }, []);

  const saveProjectFilters = useCallback((filters: {[key: string]: string}) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
      console.log('Saved project filters to local storage');
    } catch (error) {
      console.error('Error saving project filters:', error);
    }
  }, []);

  const saveProjectSettings = useCallback((settings: {[key: string]: any}) => {
    try {
      localStorage.setItem(PROJECT_SETTINGS_KEY, JSON.stringify(settings));
      console.log('Saved project settings to local storage');
    } catch (error) {
      console.error('Error saving project settings:', error);
    }
  }, []);

  const addProjectFilter = useCallback((projectId: string, filterTerm: string) => {
    console.log(`Adding project filter: ${projectId} with term "${filterTerm}"`);
    setProjectFilters(prev => {
      const projectKey = projectId.toLowerCase();
      const newFilters = {
        ...prev,
        [projectKey]: filterTerm
      };
      console.log("Updated project filters:", newFilters);
      saveProjectFilters(newFilters);
      return newFilters;
    });
  }, [saveProjectFilters]);

  const removeProjectFilter = useCallback((projectId: string) => {
    setProjectFilters(prev => {
      const newFilters = {...prev};
      const projectKey = projectId.toLowerCase();
      delete newFilters[projectKey];
      saveProjectFilters(newFilters);
      return newFilters;
    });

    const savedSettings = loadSavedProjectSettings();
    if (savedSettings) {
      const projectKey = projectId.toLowerCase();
      if (savedSettings[projectKey]) {
        const newSettings = {...savedSettings};
        delete newSettings[projectKey];
        saveProjectSettings(newSettings);
      }
    }
  }, [saveProjectFilters, loadSavedProjectSettings, saveProjectSettings]);

  const updateProject = useCallback((updatedProject: Project) => {
    console.log("Updating project:", updatedProject);
    
    setCustomProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    const settings = loadSavedProjectSettings();
    const projectKey = updatedProject.id.toLowerCase();
    const updatedSettings = {
      ...settings,
      [projectKey]: {
        name: updatedProject.name,
        budgetHours: updatedProject.budgetHours,
        hourlyRate: updatedProject.hourlyRate,
        visible: updatedProject.visible
      }
    };
    
    saveProjectSettings(updatedSettings);
    console.log("Saved updated project settings:", updatedSettings);
  }, [loadSavedProjectSettings, saveProjectSettings]);

  const getActivitiesFromEvents = useCallback((eventsList: GoogleCalendarEvent[]): Activity[] => {
    if (!eventsList.length) return [];
    
    const activityMap = new Map<string, Activity>();
    
    eventsList.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const { activityType, description } = parseEventTitle(event.summary);
      if (!activityType) return;
      
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (isNaN(durationHours) || durationHours <= 0) return;
      
      const activityKey = activityType;
      
      if (activityMap.has(activityKey)) {
        const existingActivity = activityMap.get(activityKey)!;
        existingActivity.hours += durationHours;
      } else {
        activityMap.set(activityKey, {
          id: `activity-${activityKey}`,
          type: activityType,
          hours: durationHours,
          date: startTime
        });
      }
    });
    
    return Array.from(activityMap.values())
      .sort((a, b) => b.hours - a.hours);
  }, []);

  const getTotalHours = useCallback(() => {
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
      
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
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

  const identifyProjectsFromEvents = useCallback((eventsList: GoogleCalendarEvent[]) => {
    if (eventsList.length === 0) {
      console.log("No events to identify projects from");
      return;
    }
    
    console.log(`Identifying projects from ${eventsList.length} events`);
    
    const uniqueProjects = new Map<string, string>();
    
    eventsList.forEach(event => {
      const { projectName } = parseEventTitle(event.summary);
      if (projectName && projectName !== 'Other') {
        uniqueProjects.set(projectName.toLowerCase(), projectName);
      }
    });
    
    console.log(`Found ${uniqueProjects.size} unique projects in events`);
    
    uniqueProjects.forEach((displayName, normalizedName) => {
      if (!projectFilters[normalizedName]) {
        console.log(`Adding automatic project filter for "${displayName}" (normalized: "${normalizedName}")`);
        addProjectFilter(normalizedName, displayName);
      }
    });
  }, [projectFilters, addProjectFilter]);

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
      
      const stats = convertEventsToActivities(validEvents);
      setProjectStats(stats);
      
      setLastSynced(new Date());
      setFilters(prev => ({...prev, dateRange: days}));
      
      toast({
        title: "Calendar synced",
        description: `Found ${validEvents.length} events from your Google Calendar`,
      });
      
      identifyProjectsFromEvents(validEvents);
      
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

  useEffect(() => {
    if (events.length === 0) return;
    
    console.log('Applying filters to events:', filters);
    let filtered = [...events];
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.summary.toLowerCase().includes(term) || 
        (event.description && event.description.toLowerCase().includes(term))
      );
    }
    
    if (filters.selectedProjects && filters.selectedProjects.length > 0) {
      filtered = filtered.filter(event => {
        const projectName = getProjectNameFromEvent(event);
        return filters.selectedProjects.some(
          selectedProject => projectName.toLowerCase() === selectedProject.toLowerCase()
        );
      });
    } else if (filters.project !== 'All') {
      filtered = filtered.filter(event => {
        const projectName = getProjectNameFromEvent(event);
        return projectName === filters.project;
      });
    }

    if (filters.selectedActivities && filters.selectedActivities.length > 0) {
      filtered = filtered.filter(event => {
        const activityType = determineActivityType(event);
        return filters.selectedActivities.some(
          selectedActivity => activityType.toLowerCase() === selectedActivity.toLowerCase()
        );
      });
    } else if (filters.activity && filters.activity !== 'All') {
      filtered = filtered.filter(event => {
        const activityType = determineActivityType(event);
        return activityType === filters.activity;
      });
    }
    
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
  }, [events, filters, getProjectNameFromEvent, determineActivityType]);

  const getProjectColor = useCallback((projectName: string) => {
    return stringToColor(projectName.toLowerCase());
  }, []);

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
    
    const savedSettings = loadSavedProjectSettings();
    console.log("Loaded saved project settings:", savedSettings);

    Object.entries(filters).forEach(([projectKey, filterTerm]) => {
      console.log(`Creating project "${projectKey}" with filter "${filterTerm}"`);
      
      const filteredEvents = eventsList.filter(event => {
        const { projectName } = parseEventTitle(event.summary);
        return projectName.toLowerCase() === filterTerm.toLowerCase();
      });
      
      console.log(`Found ${filteredEvents.length} events matching project "${filterTerm}"`);
      
      if (filteredEvents.length === 0) return;
      
      let totalHours = 0;
      let thisMonthHours = 0;
      const activities: any[] = [];
      
      filteredEvents.forEach(event => {
        if (!event.start?.dateTime || !event.end?.dateTime) return;
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (durationHours <= 0) return;
        
        totalHours += durationHours;
        
        if (isWithinInterval(startTime, { start: startOfCurrentMonth, end: endOfCurrentMonth })) {
          thisMonthHours += durationHours;
        }
        
        const { activityType, description } = parseEventTitle(event.summary);
        
        if (activityType) {
          const existingActivity = activities.find(a => a.type === activityType);
          if (existingActivity) {
            existingActivity.hours += durationHours;
          } else {
            activities.push({
              id: `${projectKey}-${activityType}`,
              type: activityType,
              hours: durationHours,
              description: description,
              date: startTime
            });
          }
        }
      });
      
      if (totalHours > 0) {
        const normalizedKey = projectKey.toLowerCase();
        const projectSettings = savedSettings && savedSettings[normalizedKey] ? savedSettings[normalizedKey] : {};
        
        console.log(`Adding project "${projectKey}" with ${totalHours.toFixed(2)} hours and ${activities.length} activities`);
        newCustomProjects.push({
          id: projectKey,
          name: projectSettings.name || filterTerm,
          totalHours: totalHours,
          budgetHours: projectSettings.budgetHours || 120,
          hourlyRate: projectSettings.hourlyRate || 95,
          activities: activities,
          teamMembers: [],
          monthlyHours: thisMonthHours,
          color: getProjectColor(projectKey),
          visible: projectSettings.visible !== false
        });
      }
    });
    
    console.log(`Generated ${newCustomProjects.length} custom projects`);
    setCustomProjects(newCustomProjects);
  }, [loadSavedProjectSettings, getProjectColor]);

  useEffect(() => {
    const savedFilters = loadSavedProjectFilters();
    if (Object.keys(savedFilters).length > 0) {
      setProjectFilters(savedFilters);
    }
  }, [loadSavedProjectFilters]);

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
    syncError,
    updateProject,
    getActivitiesFromEvents
  };
}
