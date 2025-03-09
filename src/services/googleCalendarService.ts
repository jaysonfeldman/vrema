
import { GoogleCalendarEvent } from '@/lib/types';
import { addDays, format } from 'date-fns';

export const fetchCalendarEvents = async (token: string, days = 30): Promise<GoogleCalendarEvent[]> => {
  try {
    const today = new Date();
    const endDate = addDays(today, days);
    
    const timeMin = encodeURIComponent(today.toISOString());
    const timeMax = encodeURIComponent(endDate.toISOString());
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.items as GoogleCalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const convertEventsToActivities = (events: GoogleCalendarEvent[]): { 
  projectMap: Record<string, number>,
  activityMap: Record<string, { type: string, hours: number }[]>
} => {
  const projectMap: Record<string, number> = {};
  const activityMap: Record<string, { type: string, hours: number }[]> = {};
  
  events.forEach(event => {
    // Skip events without a start or end time
    if (!event.start?.dateTime || !event.end?.dateTime) return;

    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    if (durationHours <= 0) return;
    
    // Extract project name from event summary (assuming format: "Project: Task")
    const projectName = event.summary.includes(':') 
      ? event.summary.split(':')[0].trim() 
      : event.summary.trim();
    
    // Default activity type
    let activityType: string = 'meetings';
    
    // Try to determine activity type from description or summary
    const lowerSummary = event.summary.toLowerCase();
    const lowerDescription = (event.description || '').toLowerCase();
    
    if (lowerSummary.includes('design') || lowerDescription.includes('design')) {
      activityType = 'design';
    } else if (lowerSummary.includes('dev') || lowerDescription.includes('dev') || 
               lowerSummary.includes('code') || lowerDescription.includes('code')) {
      activityType = 'dev';
    } else if (lowerSummary.includes('strategy') || lowerDescription.includes('strategy') ||
               lowerSummary.includes('planning') || lowerDescription.includes('planning')) {
      activityType = 'strategy';
    } else if (lowerSummary.includes('admin') || lowerDescription.includes('admin')) {
      activityType = 'admin';
    }
    
    // Add hours to project
    projectMap[projectName] = (projectMap[projectName] || 0) + durationHours;
    
    // Add activity details
    if (!activityMap[projectName]) {
      activityMap[projectName] = [];
    }
    
    activityMap[projectName].push({
      type: activityType,
      hours: durationHours
    });
  });
  
  return { projectMap, activityMap };
};
