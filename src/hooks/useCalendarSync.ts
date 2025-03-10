import { useEffect, useCallback } from 'react';
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useEventFilters } from './calendar/useEventFilters';
import { useProjectStats } from './calendar/useProjectStats';
import { useProjectManagement } from './calendar/useProjectManagement';
import { useProjectLookup } from './project/useProjectLookup';
import { FilterOptions, Project, ActivityType, GoogleCalendarEvent } from '@/lib/types';

export function useCalendarSync() {
  const {
    syncCalendar: syncCalendarOriginal,
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
  
  // Wrapped syncCalendar to include projects
  const syncCalendar = useCallback((days = 30) => {
    return syncCalendarOriginal(days, customProjects);
  }, [syncCalendarOriginal, customProjects]);

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

  // Helper function to get events for a specific project
  const getProjectEvents = useCallback((projectId: string): GoogleCalendarEvent[] => {
    return events.filter(event => {
      // If event has projectId property, use that
      if ('projectId' in event && event.projectId === projectId) {
        return true;
      }
      
      // Otherwise try to match by project name or filter term
      const project = getProjectById(projectId);
      if (!project) return false;
      
      // Check if event summary contains project name or filter term
      const summary = event.summary?.toLowerCase() || '';
      const projectName = project.name.toLowerCase();
      const filterTerm = project.filterTerm?.toLowerCase();
      
      return summary.includes(projectName) || 
            (filterTerm && summary.includes(filterTerm));
    });
  }, [events, getProjectById]);

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
    getProjectById,
    
    // New function to get events for a specific project
    getProjectEvents
  };
}
