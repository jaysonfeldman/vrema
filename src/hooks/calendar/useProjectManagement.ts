import { useState, useCallback, useEffect } from 'react';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useProjectLookup } from '../project/useProjectLookup';
import { parseEventTitle } from '@/services/googleCalendarService';

export function useProjectManagement(getProjectColor: (projectName: string) => string) {
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [customProjects, setCustomProjects] = useState<Project[]>([]);
  
  const { getProjectById } = useProjectLookup(customProjects);

  // Add a project filter term
  const addProjectFilter = useCallback((filterTerm: string) => {
    if (!filterTerm) return;
    
    setProjectFilters(prev => {
      if (prev.includes(filterTerm)) return prev;
      return [...prev, filterTerm];
    });
  }, []);
  
  // Remove a project filter
  const removeProjectFilter = useCallback((filterTerm: string) => {
    setProjectFilters(prev => prev.filter(f => f !== filterTerm));
  }, []);
  
  // Update a project
  const updateProject = useCallback((updatedProject: Project) => {
    setCustomProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  }, []);
  
  // Identify projects from calendar events
  const identifyProjectsFromEvents = useCallback((events: GoogleCalendarEvent[]) => {
    if (!events.length) return;
    console.log("Identifying projects from events...");
    
    const projectMap = new Map<string, {
      name: string,
      events: GoogleCalendarEvent[],
      activities: Map<string, number>,
      totalHours: number,
      monthlyHours: number,
      color: string
    }>();
    
    // Group events by project
    events.forEach(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;
      
      const { projectName, activityType } = parseEventTitle(event.summary);
      if (!projectName) return;
      
      const normalizedProjectName = projectName.trim();
      
      // Skip "Other" or empty project names
      if (!normalizedProjectName || normalizedProjectName.toLowerCase() === 'other') return;
      
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      if (isNaN(durationHours) || durationHours <= 0) return;
      
      // Create new project data or update existing
      if (!projectMap.has(normalizedProjectName)) {
        projectMap.set(normalizedProjectName, {
          name: normalizedProjectName,
          events: [event],
          activities: new Map([[activityType, durationHours]]),
          totalHours: durationHours,
          monthlyHours: durationHours, // We'll filter for current month later
          color: getProjectColor(normalizedProjectName)
        });
      } else {
        const projectData = projectMap.get(normalizedProjectName)!;
        projectData.events.push(event);
        projectData.totalHours += durationHours;
        projectData.monthlyHours += durationHours; // Simplified for now
        
        // Update activity hours
        const currentActivityHours = projectData.activities.get(activityType) || 0;
        projectData.activities.set(activityType, currentActivityHours + durationHours);
      }
    });
    
    // Convert map to array of projects
    const identifiedProjects: Project[] = Array.from(projectMap.entries()).map(([name, data]) => {
      // Check if we already have this project
      const existingProject = customProjects.find(p => p.name === name);
      
      // Convert activities map to array
      const activities = Array.from(data.activities.entries()).map(([type, hours]) => ({
        id: uuidv4(),
        type,
        hours,
        date: new Date() // Use current date as placeholder
      }));
      
      // Return existing project with updated data or create new project
      return existingProject ? {
        ...existingProject,
        totalHours: data.totalHours,
        monthlyHours: data.monthlyHours,
        activities: activities,
        // Keep existing data for other fields
      } : {
        id: uuidv4(),
        name,
        totalHours: data.totalHours,
        monthlyHours: data.monthlyHours,
        activities: activities,
        teamMembers: [], // Empty for auto-detected projects
        color: data.color,
        filterTerm: name,
        visible: true
      };
    });
    
    // Keep manually added projects that aren't in the identified list
    const manualProjects = customProjects.filter(p => 
      !identifiedProjects.some(ip => ip.name === p.name) && 
      p.filterTerm // Only keep projects with a filter term
    );
    
    console.log(`Identified ${identifiedProjects.length} projects from events`);
    
    // Update projects state
    setCustomProjects([...identifiedProjects, ...manualProjects]);
  }, [customProjects, getProjectColor]);
  
  // Update custom projects directly
  const updateCustomProjects = useCallback((projects: Project[]) => {
    setCustomProjects(projects);
  }, []);
  
  return {
    projectFilters,
    customProjects,
    addProjectFilter,
    removeProjectFilter,
    updateProject,
    identifyProjectsFromEvents,
    updateCustomProjects,
    getProjectById
  };
}
