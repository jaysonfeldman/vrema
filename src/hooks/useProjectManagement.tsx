import { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project } from '@/lib/types';
import { fetchProjects, saveProject, deleteProject } from '@/services/projectService';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
  
  // New project state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  
  // Load projects from Supabase on mount and trigger initial calendar sync
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const projects = await fetchProjects();
        setStoredProjects(projects);
        // Initial calendar sync
        syncCalendar(30);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          variant: "destructive",
          title: "Error loading projects",
          description: "Could not load your projects. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, [syncCalendar]);
  
  // Merge stored projects with calendar projects and initialize filters
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
    setProjectFilters(namesArray); // Always set all projects as filtered by default
    
    // Update filtered projects immediately
    const filtered = allProjects.filter(project => project.visible !== false);
    setFilteredProjects(filtered);
    
  }, [customProjects, storedProjects]);

  const handleOpenChange = (open: boolean) => {
    setShowAddProject(open);
    if (!open) {
      // Reset form when dialog closes
      setNewProjectName('');
      setNewProjectFilter('');
    }
  };
  
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
  
  const handleMonthChange = (month: string) => {
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
          title: "Custom date range",
          description: "Custom date range selection is not yet implemented"
        });
        break;
      default:
        syncCalendar(30);
    }
  };

  const availableProjects = [...new Set([
    ...customProjects.map(project => project.name),
    ...storedProjects.map(project => project.name)
  ])];
  
  // Handle adding new project with filter
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
            title: "Project created",
            description: `Created new project "${newProjectName}"`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error creating project",
            description: "Failed to create project. Please try again."
          });
        }
      } else {
        toast({
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
    handleOpenChange,
    handleUpdateProject,
    handleDeleteProject,
    handleMonthChange,
    handleAddProject,
    setProjectFilters
  };
};
