
import { GoogleCalendarEvent } from '@/lib/types';
import { addDays, format, parseISO } from 'date-fns';

export const fetchCalendarEvents = async (token: string, days = 30): Promise<GoogleCalendarEvent[]> => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    const timeMin = encodeURIComponent(startDate.toISOString());
    const timeMax = encodeURIComponent(today.toISOString());
    
    console.log(`Fetching calendar events from ${startDate.toISOString()} to ${today.toISOString()}`);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=2500`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar API error:', errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed - please reconnect your Google Calendar');
      } else if (response.status === 403) {
        throw new Error('Permission denied - check Google Calendar access permissions');
      } else {
        throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log(`Received ${data.items?.length || 0} events from Google Calendar API`);
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response format from Google Calendar API');
      return [];
    }
    
    const events = data.items
      .filter((event: any) => event.start?.dateTime && event.end?.dateTime)
      .map((event: any): GoogleCalendarEvent => ({
        id: event.id,
        summary: event.summary || 'Untitled Event',
        description: event.description || '',
        location: event.location || '',
        start: {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone || 'UTC'
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone || 'UTC'
        },
        attendees: event.attendees || [],
        organizer: event.organizer || {},
        created: event.created,
        updated: event.updated,
        status: event.status,
        htmlLink: event.htmlLink
      }));
      
    console.log(`Transformed ${events.length} valid events with start/end times`);
    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
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
  
  let totalValidEvents = 0;
  
  events.forEach(event => {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      console.log(`Skipping event without start/end time: ${event.summary}`);
      return;
    }

    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.log(`Skipping event with invalid date: ${event.summary}`);
      return;
    }
    
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (durationHours <= 0) {
      console.log(`Skipping event with non-positive duration: ${event.summary}`);
      return;
    }
    
    totalValidEvents++;
    
    const { projectName, activityType } = parseEventTitle(event.summary);
    
    console.log(`Event: "${event.summary}" -> Project: "${projectName}", Activity: "${activityType}", Duration: ${durationHours.toFixed(2)}h`);
    
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
  
  console.log(`Processed ${totalValidEvents} valid events into ${Object.keys(projectMap).length} projects`);
  console.log('Project hours:', projectMap);
  
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
