
import type { GoogleCalendarEvent } from '@/lib/types';
import { addDays, format, parseISO } from 'date-fns';

export const fetchCalendarEvents = async (
  token: string,
  range: number | { timeMin: Date; timeMax: Date } = 30
): Promise<GoogleCalendarEvent[]> => {
  const today = new Date();
  const { timeMin, timeMax } = typeof range === 'number'
    ? { timeMin: addDays(today, -range), timeMax: today }
    : range;
  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Your Google session expired. Sign out and reconnect Google Calendar.');
      }
      if (response.status === 403) {
        throw new Error('Google Calendar access was denied. Check that Calendar API is enabled and reconnect with calendar read permission.');
      }
      throw new Error(`Google Calendar sync failed (${response.status}). Please try again.`);
    }
    const data = await response.json() as {
      items?: GoogleCalendarEvent[];
      nextPageToken?: string;
    };
    if (data.items !== undefined && !Array.isArray(data.items)) {
      throw new Error('Google Calendar returned an invalid event list. Please try again.');
    }
    // All-day and cancelled events have no tracked duration.
    events.push(...(data.items ?? []).filter(
      (event) => event.start?.dateTime && event.end?.dateTime
    ));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
};

export const parseEventTitle = (title: string): { 
  projectName: string; 
  activityType: string; 
  description: string 
} => {
  // Default values
  let projectName = 'Other';
  let activityType = 'other';
  let description = title;

  if (!title) {
    return { projectName, activityType, description };
  }

  // Check if title contains # to separate project and activity
  if (title.includes('#')) {
    const parts = title.split('#');
    
    if (parts.length >= 1 && parts[0].trim() !== '') {
      projectName = parts[0].trim();
    }
    
    if (parts.length >= 2) {
      const activityPart = parts[1].trim();
      
      // If activity has space, first word is activity type, rest is description
      const firstSpaceIndex = activityPart.indexOf(' ');
      
      if (firstSpaceIndex > 0) {
        activityType = activityPart.substring(0, firstSpaceIndex).trim();
        description = activityPart.substring(firstSpaceIndex + 1).trim();
      } else {
        activityType = activityPart;
        description = '';
      }
    }
  }
  
  return { projectName, activityType, description };
};

export const convertEventsToActivities = (events: GoogleCalendarEvent[]): { 
  projectMap: Record<string, number>,
  activityMap: Record<string, { type: string, hours: number }[]>
} => {
  const projectMap: Record<string, number> = {};
  const activityMap: Record<string, { type: string, hours: number }[]> = {};
  
  events.forEach(event => {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      return;
    }

    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return;
    }
    
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (durationHours <= 0) {
      return;
    }
    
    const { projectName, activityType } = parseEventTitle(event.summary);
    
    
    // Store project name in original case for display
    // Use lowercase for case-insensitive matching in maps
    const normalizedProjectName = projectName.toLowerCase();
    
    // Add hours to project total
    projectMap[normalizedProjectName] = (projectMap[normalizedProjectName] || 0) + durationHours;
    
    // Initialize project's activity array if needed
    if (!activityMap[normalizedProjectName]) {
      activityMap[normalizedProjectName] = [];
    }
    
    // Find existing activity or add a new one
    const existingActivityIndex = activityMap[normalizedProjectName].findIndex(a => 
      a.type.toLowerCase() === activityType.toLowerCase()
    );
    
    if (existingActivityIndex >= 0) {
      activityMap[normalizedProjectName][existingActivityIndex].hours += durationHours;
    } else {
      activityMap[normalizedProjectName].push({
        type: activityType,
        hours: durationHours
      });
    }
  });
  
  
  return { projectMap, activityMap };
};

export const formatEventDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
};

export const getDayOfWeek = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'EEEE');
};

export const calculateDuration = (startDateString: string, endDateString: string): string => {
  const startTime = new Date(startDateString).getTime();
  const endTime = new Date(endDateString).getTime();
  const durationMs = endTime - startTime;
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};
