
import { useCallback } from 'react';
import { GoogleCalendarEvent, Project, TeamMember } from '@/lib/types';
import { parseEventTitle } from '@/services/googleCalendarService';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export function useProjectGenerator(getProjectColor: (projectName: string) => string) {
  const identifyProjectsFromEvents = useCallback((
    eventsList: GoogleCalendarEvent[],
    projectFilters: {[key: string]: string},
    addProjectFilter: (projectId: string, filterTerm: string) => void
  ) => {
    if (eventsList.length === 0) {
      console.log("No events to identify projects from");
      return;
    }
    
    console.log(`Identifying projects from ${eventsList.length} events`);
    
    const uniqueProjects = new Map<string, string>();
    
    eventsList.forEach(event => {
      if (!event.summary) return;
      
      const { projectName } = parseEventTitle(event.summary);
      if (projectName && projectName !== 'Other') {
        uniqueProjects.set(projectName.toLowerCase(), projectName);
      }
    });
    
    console.log(`Found ${uniqueProjects.size} unique projects in events`);
    
    uniqueProjects.forEach((displayName, normalizedName) => {
      if (!projectFilters[normalizedName]) {
        console.log(`Adding automatic project filter for "${displayName}" (normalized: "${normalizedName}")`);
        addProjectFilter(normalizedName, displayName);
      }
    });
  }, []);

  const updateCustomProjects = useCallback((
    eventsList: GoogleCalendarEvent[], 
    filters: {[key: string]: string},
    loadSavedProjectSettings: () => any,
    setCustomProjects: (projects: Project[]) => void
  ) => {
    if (eventsList.length === 0) {
      console.log("No events available to create custom projects");
      return;
    }
    
    console.log("Generating custom projects based on filters:", filters);
    
    const newCustomProjects: Project[] = [];
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    
    const savedSettings = loadSavedProjectSettings();
    console.log("Loaded saved project settings:", savedSettings);

    // First, identify all unique projects in events
    const projectsFromEvents = new Map<string, string>(); // normalized name -> display name
    
    eventsList.forEach(event => {
      if (!event.summary) return;
      
      const { projectName } = parseEventTitle(event.summary);
      if (projectName && projectName !== 'Other') {
        projectsFromEvents.set(projectName.toLowerCase(), projectName);
      }
    });
    
    console.log(`Found ${projectsFromEvents.size} unique projects in events`);
    
    // Create an array to process - both from filters and from identified events
    const projectsToProcess = new Map<string, string>(); // normalized name -> display name
    
    // Add all projects from filters
    Object.entries(filters).forEach(([normalizedName, displayName]) => {
      projectsToProcess.set(normalizedName.toLowerCase(), displayName);
    });
    
    // Add all projects from events
    projectsFromEvents.forEach((displayName, normalizedName) => {
      if (!projectsToProcess.has(normalizedName)) {
        projectsToProcess.set(normalizedName, displayName);
      }
    });
    
    console.log(`Processing ${projectsToProcess.size} total projects`);

    // Process each project 
    projectsToProcess.forEach((displayName, normalizedKey) => {
      // For each project, find matching events
      const matchingEvents = eventsList.filter(event => {
        if (!event.summary) return false;
        
        const { projectName } = parseEventTitle(event.summary);
        if (!projectName) return false;
        
        // Case insensitive matching of project names
        const normalizedProjectName = projectName.toLowerCase();
        return normalizedProjectName === normalizedKey;
      });
      
      console.log(`Found ${matchingEvents.length} events for project "${displayName}"`);
      
      if (matchingEvents.length === 0) return;
      
      let totalHours = 0;
      let thisMonthHours = 0;
      const activities: any[] = [];
      const teamMemberEmails = new Set<string>();
      
      // Process each event to calculate hours and extract activities
      matchingEvents.forEach(event => {
        if (!event.start?.dateTime || !event.end?.dateTime) return;
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        if (durationHours <= 0) return;
        
        console.log(`Adding ${durationHours.toFixed(2)} hours to project "${displayName}" from event "${event.summary}"`);
        
        totalHours += durationHours;
        
        if (isWithinInterval(startTime, { start: startOfCurrentMonth, end: endOfCurrentMonth })) {
          thisMonthHours += durationHours;
        }
        
        const { activityType, description } = parseEventTitle(event.summary);
        
        // Add organizer to team members if available
        if (event.organizer?.email) {
          teamMemberEmails.add(event.organizer.email);
        }
        
        // Add attendees to team members if available
        if (event.attendees && Array.isArray(event.attendees)) {
          event.attendees.forEach(attendee => {
            if (attendee.email) {
              teamMemberEmails.add(attendee.email);
            }
          });
        }
        
        if (activityType) {
          const existingActivity = activities.find(a => a.type.toLowerCase() === activityType.toLowerCase());
          if (existingActivity) {
            existingActivity.hours += durationHours;
          } else {
            activities.push({
              id: `${normalizedKey}-${activityType}`,
              type: activityType,
              hours: durationHours,
              description: description,
              date: startTime
            });
          }
        }
      });
      
      if (totalHours > 0) {
        const projectSettings = savedSettings && savedSettings[normalizedKey] ? savedSettings[normalizedKey] : {};
        
        // Create proper TeamMember objects from the collected emails
        const teamMembers: TeamMember[] = Array.from(teamMemberEmails).map(email => ({
          id: uuidv4(), // Generate a unique ID for each team member
          name: email.split('@')[0] || email, // Use the part before @ as name, or full email if splitting fails
          avatar: `https://www.gravatar.com/avatar/${email.length}?d=identicon&s=128`, // Use length as a simple hash for demo
          hoursLogged: 0, // Default value, will be updated with actual data if available
          weeklyHours: {} // Empty weekly hours object, will be populated if/when data is available
        }));
        
        console.log(`Adding project "${displayName}" with ${totalHours.toFixed(2)} hours and ${activities.length} activities`);
        newCustomProjects.push({
          id: normalizedKey,
          name: projectSettings.name || displayName,
          totalHours: totalHours,
          budgetHours: projectSettings.budgetHours || undefined,
          hourlyRate: projectSettings.hourlyRate || undefined,
          activities: activities,
          teamMembers: teamMembers,
          monthlyHours: thisMonthHours,
          color: getProjectColor(normalizedKey),
          visible: projectSettings.visible !== false,
          filterTerm: displayName  // Use display name as filter term
        });
      }
    });
    
    console.log(`Generated ${newCustomProjects.length} custom projects with total hours`, 
      newCustomProjects.map(p => `${p.name}: ${p.totalHours.toFixed(2)}h`));
    setCustomProjects(newCustomProjects);
  }, []);

  return {
    identifyProjectsFromEvents,
    updateCustomProjects
  };
}
