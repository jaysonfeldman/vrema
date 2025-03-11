import { useState, useEffect, useRef, useCallback } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project } from '@/lib/types';
import { fetchProjects, saveProject, deleteProject } from '@/services/projectService';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { fetchCalendarEventsFromSupabase } from '@/services/calendarEventService';

export const useProjectManagement = () => {
  const { 
    customProjects,
    updateProject,
    filters,
    syncCalendar,
    addProjectFilter,
  } = useCalendarSync();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [storedProjects, setStoredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableProjectNames, setAvailableProjectNames] = useState<string[]>([]);
  const [storedCalendarEvents, setStoredCalendarEvents] = useState<any[]>([]);
  
  // New project state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  
  // Add loading ref to prevent multiple data loading
  const dataLoadedRef = useRef(false);
  
  // Load projects and calendar events from Supabase on mount and trigger initial calendar sync
  useEffect(() => {
    // Skip if data was already loaded
    if (dataLoadedRef.current) return;
    
    const loadProjectsAndEvents = async () => {
      setIsLoading(true);
      try {
        // Load projects
        const projects = await fetchProjects();
        setStoredProjects(projects);
        
        // Load calendar events
        const events = await fetchCalendarEventsFromSupabase();
        setStoredCalendarEvents(events);
        console.log(`Loaded ${events.length} calendar events from Supabase`);
        
        // Initial calendar sync to get fresh data
        syncCalendar(30);
        
        // Mark as loaded
        dataLoadedRef.current = true;
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Could not load your projects and events. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectsAndEvents();
  }, [syncCalendar]);
  
  // Merge stored projects with calendar projects and initialize filters, but don't run on every render
  useEffect(() => {
    const allProjects = [...storedProjects];
    const projectNames = new Set<string>();
    
    // Add custom projects and collect names
    for (const customProject of customProjects) {
      const existingProject = storedProjects.find(p => 
        p.id === customProject.id || 
        p.name.toLowerCase() === customProject.name.toLowerCase());
      
      if (!existingProject) {
        allProjects.push(customProject);
      }
      projectNames.add(customProject.name);
    }
    
    // Add stored project names
    storedProjects.forEach(project => {
      projectNames.add(project.name);
    });
    
    const namesArray = Array.from(projectNames);
    setAvailableProjectNames(namesArray);
    
    // Only set project filters if they're empty and we have names
    if (projectFilters.length === 0 && namesArray.length > 0) {
      setProjectFilters(namesArray);
    }
    
    // Update filtered projects
    const filtered = allProjects.filter(project => project.visible !== false);
    setFilteredProjects(filtered);
    
  }, [customProjects, storedProjects]);

  const handleOpenChange = useCallback((open: boolean) => {
    setShowAddProject(open);
    if (!open) {
      // Reset form when dialog closes
      setNewProjectName('');
      setNewProjectFilter('');
    }
  }, []);

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      const result = await saveProject(updatedProject);
      
      if (result.success && result.project) {
        // Update local state
        setStoredProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? result.project! : p)
        );
        
        updateProject(updatedProject);
        
        toast({
          title: "Project updated",
          description: `Updated "${updatedProject.name}" settings`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error updating project",
          description: "Failed to update project. Please try again."
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await deleteProject(projectId);
      
      if (result.success) {
        // Update local state
        setStoredProjects(prev => prev.filter(p => p.id !== projectId));
        
        toast({
          title: "Project deleted",
          description: "Project has been removed"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error deleting project",
          description: "Failed to delete project. Please try again."
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    }
  };
  
  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
    
    switch (month) {
      case 'current':
        syncCalendar(30);
        break;
      case 'previous':
        syncCalendar(60);
        break;
      case 'all':
        syncCalendar(365);
        break;
      case 'custom':
        toast({
          id: 'custom-date-range',
          title: "Custom date range",
          description: "Custom date range selection is not yet implemented"
        });
        break;
      default:
        syncCalendar(30);
    }
  }, [syncCalendar]);
  
  const availableProjects = [...new Set([
    ...customProjects.map(project => project.name),
    ...storedProjects.map(project => project.name)
  ])];
  
  const handleAddProject = async () => {
    if (newProjectName && newProjectFilter) {
      // Convert to lowercase for case-insensitive comparison
      const normalizedName = newProjectName.toLowerCase();
      
      // Check if project already exists (case-insensitive)
      const projectExists = [
        ...customProjects,
        ...storedProjects
      ].some(p => p.name.toLowerCase() === normalizedName);
      
      if (!projectExists) {
        // Create new project
        const newProject: Project = {
          id: uuidv4(),
          name: newProjectName,
          totalHours: 0,
          budgetHours: undefined,
          hourlyRate: undefined,
          activities: [],
          teamMembers: [],
          filterTerm: newProjectFilter
        };
        
        // Save to Supabase
        const result = await saveProject(newProject);
        
        if (result.success && result.project) {
          // Update local state
          setStoredProjects(prev => [...prev, result.project!]);
          
          // Add project filter for calendar sync
          addProjectFilter(normalizedName, newProjectFilter);
          
          toast({
            id: `project-created-${normalizedName}`,
            title: "Project created",
            description: `Created new project "${newProjectName}"`
          });
        } else {
          toast({
            id: `project-error-${normalizedName}`,
            variant: "destructive",
            title: "Error creating project",
            description: "Failed to create project. Please try again."
          });
        }
      } else {
        toast({
          id: `project-exists-${normalizedName}`,
          variant: "destructive",
          title: "Project already exists",
          description: `A project with the name "${newProjectName}" already exists`
        });
      }
      
      setShowAddProject(false);
      setNewProjectName('');
      setNewProjectFilter('');
    }
  };

  return {
    showAddProject,
    setShowAddProject,
    selectedMonth,
    projectFilters,
    filteredProjects,
    isLoading,
    newProjectName,
    setNewProjectName,
    newProjectFilter,
    setNewProjectFilter,
    availableProjects,
    storedCalendarEvents,
    handleOpenChange,
    handleUpdateProject,
    handleDeleteProject,
    handleMonthChange,
    handleAddProject,
    setProjectFilters
  };
};
