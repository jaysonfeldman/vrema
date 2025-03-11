
import { supabase } from '@/integrations/supabase/client';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { parseEventTitle, calculateDuration } from '@/services/googleCalendarService';

/**
 * Saves Google Calendar events to Supabase
 */
export const saveCalendarEventsToSupabase = async (
  events: GoogleCalendarEvent[],
  projects: Project[]
): Promise<{ success: boolean; count: number; error?: any }> => {
  try {
    if (!events || events.length === 0) {
      console.log('No events to save');
      return { success: true, count: 0 };
    }

    console.log(`Preparing to save ${events.length} calendar events to Supabase`);
    
    let savedCount = 0;
    const errors = [];
    
    // Process events in batches to avoid overwhelming the database
    const batchSize = 50;
    
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      const eventData = batch.map(event => {
        if (!event.start?.dateTime || !event.end?.dateTime) {
          return null;
        }
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return null;
        }
        
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (durationHours <= 0) {
          return null;
        }
        
        const { projectName, activityType } = parseEventTitle(event.summary);
        
        // Find matching project
        let projectId = null;
        for (const project of projects) {
          // Check exact match
          if (project.name.toLowerCase() === projectName.toLowerCase()) {
            projectId = project.id;
            break;
          }
          
          // Check filter term match (if available)
          if (project.filterTerm && 
              event.summary.toLowerCase().includes(project.filterTerm.toLowerCase())) {
            projectId = project.id;
            break;
          }
        }

        return {
          title: event.summary,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          project_id: projectId,
          activity_type: activityType,
          hours: durationHours,
          event_id: event.id
        };
      }).filter(Boolean); // Remove null entries
      
      if (eventData.length === 0) {
        continue;
      }
      
      // Check for existing events to avoid duplicates
      const eventIds = eventData.map(e => e.event_id);
      const { data: existingEvents } = await supabase
        .from('calendar_events')
        .select('event_id')
        .in('event_id', eventIds);
      
      const existingEventIds = new Set(existingEvents?.map(e => e.event_id) || []);
      
      // Filter out events that already exist in the database
      const newEvents = eventData.filter(e => !existingEventIds.has(e.event_id));
      
      if (newEvents.length === 0) {
        continue;
      }
      
      console.log(`Saving batch of ${newEvents.length} new events to Supabase`);
      
      // Insert events
      const { data, error } = await supabase
        .from('calendar_events')
        .upsert(newEvents, { onConflict: 'event_id' })
        .select();
      
      if (error) {
        console.error('Error saving events batch to Supabase:', error);
        errors.push(error);
      } else {
        savedCount += data.length;
        console.log(`Successfully saved ${data.length} events`);
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Completed with ${errors.length} errors. Saved ${savedCount} events.`);
      return { 
        success: savedCount > 0, 
        count: savedCount, 
        error: `${errors.length} errors occurred while saving events` 
      };
    }
    
    return { success: true, count: savedCount };
  } catch (error) {
    console.error('Error in saveCalendarEventsToSupabase:', error);
    return { success: false, count: 0, error };
  }
};

/**
 * Fetches calendar events from Supabase
 */
export const fetchCalendarEventsFromSupabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCalendarEventsFromSupabase:', error);
    return [];
  }
};
