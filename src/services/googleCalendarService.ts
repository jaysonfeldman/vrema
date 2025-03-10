
import { GoogleCalendarEvent } from '@/lib/types';
import { addDays, format, parseISO } from 'date-fns';

export const fetchCalendarEvents = async (token: string, days = 30): Promise<GoogleCalendarEvent[]> => {
  try {
    const today = new Date();
    // Set the start date to 30 days ago by default for the initial fetch
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
      
      // Check for specific error types to provide better feedback
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
    
    // Transform events to our format and filter out events without start/end dateTime
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

// Parse event title to extract project, activity type, and description
// Format: "projectName#activityType description"
export const parseEventTitle = (title: string): { 
  projectName: string; 
  activityType: string; 
  description: string 
} => {
  // Default values
  let projectName = 'Other';
  let activityType = 'meetings';
  let description = title;

  // Check if title contains # (our activity delimiter)
  if (title.includes('#')) {
    const [projectPart, rest] = title.split('#', 2);
    projectName = projectPart.trim();
    
    // Get the activity type and description
    const activityAndDescription = rest;
    
    if (activityAndDescription) {
      // Find the first space to separate activity from description
      const firstSpaceIndex = activityAndDescription.indexOf(' ');
      
      if (firstSpaceIndex > 0) {
        // We have both activity and description
        activityType = activityAndDescription.substring(0, firstSpaceIndex).trim();
        description = activityAndDescription.substring(firstSpaceIndex + 1).trim();
      } else {
        // Only activity, no description
        activityType = activityAndDescription.trim();
        description = '';
      }
    }
  }
  
  // Map common activity types to our standard types
  const normalizedActivityType = normalizeActivityType(activityType);
  
  return { projectName, activityType: normalizedActivityType, description };
};

// Normalize activity types to match our system
const normalizeActivityType = (activityType: string): string => {
  activityType = activityType.toLowerCase();
  
  if (activityType.includes('design') || activityType === 'ui' || activityType === 'ux') {
    return 'design';
  } else if (activityType.includes('dev') || activityType.includes('code') || activityType === 'programming') {
    return 'dev';
  } else if (activityType.includes('strategy') || activityType.includes('plan')) {
    return 'strategy';
  } else if (activityType.includes('admin') || activityType === 'management') {
    return 'admin';
  } else if (activityType.includes('meeting') || activityType.includes('call') || activityType === 'discuss') {
    return 'meetings';
  }
  
  // Default to meetings if no match
  return 'meetings';
};

export const convertEventsToActivities = (events: GoogleCalendarEvent[]): { 
  projectMap: Record<string, number>,
  activityMap: Record<string, { type: string, hours: number }[]>
} => {
  const projectMap: Record<string, number> = {};
  const activityMap: Record<string, { type: string, hours: number }[]> = {};
  
  let totalValidEvents = 0;
  
  events.forEach(event => {
    // Skip events without a start or end time
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
    
    // Parse the event title to extract project, activity, and description
    const { projectName, activityType } = parseEventTitle(event.summary);
    
    // Add hours to project
    projectMap[projectName] = (projectMap[projectName] || 0) + durationHours;
    
    // Add activity details
    if (!activityMap[projectName]) {
      activityMap[projectName] = [];
    }
    
    // Check if activity type already exists for this project
    const existingActivityIndex = activityMap[projectName].findIndex(a => a.type === activityType);
    
    if (existingActivityIndex >= 0) {
      // Add hours to existing activity
      activityMap[projectName][existingActivityIndex].hours += durationHours;
    } else {
      // Add new activity type
      activityMap[projectName].push({
        type: activityType,
        hours: durationHours
      });
    }
  });
  
  console.log(`Processed ${totalValidEvents} valid events into ${Object.keys(projectMap).length} projects`);
  console.log('Project hours:', projectMap);
  
  return { projectMap, activityMap };
};

// Format date for display
export const formatEventDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
};

// Get the day of the week
export const getDayOfWeek = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'EEEE');
};

// Calculate duration in hours and minutes
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
