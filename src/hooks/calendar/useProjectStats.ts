
import { useState, useCallback } from 'react';
import { GoogleCalendarEvent, Activity, Project, ActivityType } from '@/lib/types';
import { convertEventsToActivities, parseEventTitle } from '@/services/googleCalendarService';
import { stringToColor } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function useProjectStats() {
  const [projectStats, setProjectStats] = useState<{
    projectMap: Record<string, number>,
    activityMap: Record<string, { type: string, hours: number }[]>
  }>({
    projectMap: {},
    activityMap: {}
  });

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
          type: activityType as ActivityType,
          hours: durationHours,
          date: startTime
        });
      }
    });
    
    return Array.from(activityMap.values())
      .sort((a, b) => b.hours - a.hours);
  }, []);

  const getTotalHours = useCallback((filteredEvents: GoogleCalendarEvent[]) => {
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
  }, []);

  const getActivityHours = useCallback((filteredEvents: GoogleCalendarEvent[], activityType: ActivityType) => {
    if (!filteredEvents.length) return 0;
    
    let activityHours = 0;
    filteredEvents.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const { activityType: type } = parseEventTitle(event.summary);
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
  }, []);

  const getProjectColor = useCallback((projectName: string) => {
    return stringToColor(projectName.toLowerCase());
  }, []);

  const updateProjectStats = useCallback((events: GoogleCalendarEvent[]) => {
    const stats = convertEventsToActivities(events);
    setProjectStats(stats);
    return stats;
  }, []);

  return {
    projectStats,
    getActivitiesFromEvents,
    getTotalHours,
    getActivityHours,
    getProjectColor,
    updateProjectStats
  };
}
