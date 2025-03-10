
import { useEffect, useCallback } from 'react';
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useEventFilters } from './calendar/useEventFilters';
import { useProjectStats } from './calendar/useProjectStats';
import { useProjectManagement } from './calendar/useProjectManagement';
import { useProjectLookup } from './project/useProjectLookup';
import { FilterOptions, Project, ActivityType } from '@/lib/types';

export function useCalendarSync() {
  const {
    syncCalendar,
    events,
    filteredEvents: calendarFilteredEvents,
    setFilteredEvents,
    isLoading,
    lastSynced,
    syncError,
    getProjectNameFromEvent,
    determineActivityType,
    isAuthenticated
  } = useCalendarEvents();
  
  const {
    filters,
    updateFilters,
    filteredEvents,
    getProjects
  } = useEventFilters(events, getProjectNameFromEvent, determineActivityType);
  
  const {
    projectStats,
    getActivitiesFromEvents,
    getTotalHours,
    getActivityHours,
    getProjectColor,
    updateProjectStats
  } = useProjectStats();
  
  const {
    projectFilters,
    customProjects,
    addProjectFilter,
    removeProjectFilter,
    updateProject,
    identifyProjectsFromEvents,
    updateCustomProjects,
  } = useProjectManagement(getProjectColor);

  // Use the project lookup hook to find projects by ID
  const { getProjectById } = useProjectLookup(customProjects);

  // Sync projects when events change - with higher priority
  useEffect(() => {
    if (events.length > 0) {
      // Use a single update to reduce multiple renders
      const updateData = () => {
        console.log("Updating project stats and identifying projects from events...");
        updateProjectStats(events);
        identifyProjectsFromEvents(events);
      };
      
      // Run immediately but as a single update
      queueMicrotask(updateData);
    }
  }, [events, updateProjectStats, identifyProjectsFromEvents]);

  // Keep filtered events in sync
  useEffect(() => {
    setFilteredEvents(filteredEvents);
  }, [filteredEvents, setFilteredEvents]);

  // Custom hook wrapping all calendar functionality
  return {
    // Calendar sync functions
    syncCalendar,
    events,
    filteredEvents,
    isLoading,
    lastSynced,
    projectStats,
    isAuthenticated,
    syncError,
    
    // Filter functions
    filters,
    updateFilters,
    getProjects,
    
    // Project management
    projectFilters,
    addProjectFilter,
    removeProjectFilter,
    customProjects,
    updateProject,
    
    // Stats and calculations
    getTotalHours: useCallback(() => getTotalHours(filteredEvents), [filteredEvents, getTotalHours]),
    getActivityHours: useCallback((activityType: ActivityType) => 
      getActivityHours(filteredEvents, activityType), [filteredEvents, getActivityHours]),
    getActivitiesFromEvents,
    getProjectById
  };
}
