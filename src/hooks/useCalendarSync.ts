
import { useEffect, useCallback } from 'react';
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useEventFilters } from './calendar/useEventFilters';
import { useProjectStats } from './calendar/useProjectStats';
import { useProjectManagement } from './calendar/useProjectManagement';
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
    getProjectById
  } = useProjectManagement(getProjectColor);

  // Sync projects when events change - with higher priority
  useEffect(() => {
    if (events.length > 0) {
      console.log(`useCalendarSync - Processing ${events.length} events`);
      // Run immediately without batching to ensure projects appear quickly
      setTimeout(() => {
        updateProjectStats(events);
        identifyProjectsFromEvents(events);
      }, 0);
    }
  }, [events, updateProjectStats, identifyProjectsFromEvents]);

  // Update custom projects when events or filters change
  useEffect(() => {
    if (events.length > 0 && Object.keys(projectFilters).length > 0) {
      console.log("Updating custom projects based on events and filters");
      // Run with slight delay to ensure project filters are fully processed
      setTimeout(() => {
        updateCustomProjects(events, projectFilters);
      }, 100);
    }
  }, [events, projectFilters, updateCustomProjects]);

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
    getTotalHours: () => getTotalHours(filteredEvents),
    getActivityHours: (activityType: ActivityType) => getActivityHours(filteredEvents, activityType),
    getActivitiesFromEvents,
    getProjectById
  };
}
