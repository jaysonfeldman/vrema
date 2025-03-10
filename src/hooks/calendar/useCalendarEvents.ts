
import { useState, useCallback } from 'react';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { 
  fetchCalendarEvents, 
  parseEventTitle,
  associateEventsWithProjects
} from '@/services/googleCalendarService';
import { toast } from 'sonner';
import { GoogleCalendarEvent, FilterOptions, Project } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

export function useCalendarEvents() {
  const { authState, refreshToken } = useGoogleAuth();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  const syncCalendar = useCallback(async (days = 30, projects: Project[] = []) => {
    setSyncError(null);
    
    if (syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }
    
    if (!authState.isAuthenticated) {
      console.log('Not authenticated, skipping sync');
      return;
    }

    setIsLoading(true);
    setSyncInProgress(true);
    
    try {
      const token = await refreshToken();
      if (!token) {
        console.log('No valid token available, skipping sync');
        return;
      }
      
      console.log(`Syncing calendar data for the last ${days} days...`);
      
      const fetchedEvents = await fetchCalendarEvents(token, days);
      console.log(`Fetched ${fetchedEvents.length} calendar events`);
      
      const validEvents = fetchedEvents.filter(event => {
        const hasValidTimes = event.start?.dateTime && event.end?.dateTime;
        if (!hasValidTimes) {
          console.log(`Skipping event without valid times: ${event.summary}`);
        }
        return hasValidTimes;
      });
      
      const processedEvents = validEvents.map(event => {
        const { projectName } = parseEventTitle(event.summary || '');
        const matchingProject = projects.find(p => 
          p.name.toLowerCase() === projectName.toLowerCase() ||
          (p.filterTerm && event.summary?.toLowerCase().includes(p.filterTerm.toLowerCase()))
        );
        
        return {
          ...event,
          projectId: matchingProject?.id
        };
      });
      
      // Save processed projects to Supabase
      await syncProjectsToSupabase(projects);
      
      console.log(`Processed ${processedEvents.length} events with project associations`);
      setEvents(processedEvents);
      setFilteredEvents(processedEvents);
      setLastSynced(new Date());
      
      if (processedEvents.length > 0) {
        toast.success(`Calendar synced`, {
          description: `Found ${processedEvents.length} events`
        });
      } else {
        toast.info('No events found', { 
          description: 'No calendar events found in the selected time period'
        });
      }
      
      return { events: processedEvents };
    } catch (error) {
      console.error('Error syncing calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not sync with Google Calendar';
      setSyncError(errorMessage);
      
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('permission') || errorLower.includes('scope')) {
        toast.error('Permission denied', {
          description: 'Check Google Calendar access permissions'
        });
      } else if (errorLower.includes('authentication') || errorLower.includes('token')) {
        toast.error('Authentication error', {
          description: 'Please try reconnecting your Google Calendar'
        });
      } else {
        toast.error('Sync failed', {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
      setSyncInProgress(false);
    }
  }, [authState.isAuthenticated, refreshToken]);

  // Sync projects to Supabase
  const syncProjectsToSupabase = async (projects: Project[]) => {
    if (!projects || projects.length === 0) return;
    
    console.log('Syncing projects to Supabase:', projects.length);
    
    try {
      for (const project of projects) {
        // Check if project already exists
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('id', project.id)
          .single();
          
        if (existingProject) {
          // Update existing project
          await supabase
            .from('projects')
            .update({
              name: project.name,
              total_hours: project.totalHours,
              budget_hours: project.budgetHours,
              hourly_rate: project.hourlyRate,
              filter_term: project.filterTerm,
              monthly_hours: project.monthlyHours,
              visible: project.visible
            })
            .eq('id', project.id);
        } else {
          // Insert new project
          await supabase
            .from('projects')
            .insert({
              id: project.id,
              name: project.name,
              total_hours: project.totalHours,
              budget_hours: project.budgetHours,
              hourly_rate: project.hourlyRate,
              filter_term: project.filterTerm,
              monthly_hours: project.monthlyHours,
              visible: project.visible
            });
        }
        
        // Sync activities for this project
        if (project.activities && project.activities.length > 0) {
          for (const activity of project.activities) {
            // Check if activity exists
            const { data: existingActivity } = await supabase
              .from('activities')
              .select('id')
              .eq('id', activity.id)
              .single();
              
            if (existingActivity) {
              // Update existing activity
              await supabase
                .from('activities')
                .update({
                  project_id: project.id,
                  type: activity.type,
                  hours: activity.hours
                })
                .eq('id', activity.id);
            } else {
              // Insert new activity
              await supabase
                .from('activities')
                .insert({
                  id: activity.id,
                  project_id: project.id,
                  type: activity.type,
                  hours: activity.hours
                });
            }
          }
        }
      }
      
      console.log('Projects and activities synced to Supabase successfully');
    } catch (error) {
      console.error('Error syncing projects to Supabase:', error);
    }
  };

  const getProjectNameFromEvent = useCallback((event: GoogleCalendarEvent): string => {
    if (!event.summary) return 'Other';
    
    const { projectName } = parseEventTitle(event.summary);
    return projectName;
  }, []);

  const determineActivityType = useCallback((event: GoogleCalendarEvent): string => {
    if (!event.summary) return 'other';
    
    const { activityType } = parseEventTitle(event.summary);
    return activityType;
  }, []);

  return {
    syncCalendar,
    events,
    filteredEvents,
    setFilteredEvents,
    isLoading,
    lastSynced,
    syncError,
    getProjectNameFromEvent,
    determineActivityType,
    isAuthenticated: authState.isAuthenticated,
  };
}
