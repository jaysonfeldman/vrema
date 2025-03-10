
import { useState, useEffect, useCallback } from 'react';
import { GoogleCalendarEvent, FilterOptions } from '@/lib/types';

export function useEventFilters(
  events: GoogleCalendarEvent[], 
  getProjectNameFromEvent: (event: GoogleCalendarEvent) => string,
  determineActivityType: (event: GoogleCalendarEvent) => string
) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    project: 'All',
    dateRange: 30,
    activity: 'All',
    selectedProjects: [],
    selectedActivities: []
  });
  
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>(events);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({...prev, ...newFilters}));
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

  return {
    filters,
    updateFilters,
    filteredEvents,
    getProjects
  };
}
