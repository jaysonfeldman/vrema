
import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

export function useProjectManagement() {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [isLoading, setIsLoading] = useState(false);
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  
  // Using a local state for project data
  const { customProjects, addProjectFilter, removeProjectFilter, updateProject } = 
    typeof window !== 'undefined' 
      ? window.__CALENDAR_SYNC_STATE || {} 
      : { customProjects: [], addProjectFilter: () => {}, removeProjectFilter: () => {}, updateProject: () => {} };

  // Initialize project filters and available projects
  useEffect(() => {
    if (customProjects && customProjects.length > 0) {
      const projectNames = customProjects.map(p => p.name);
      setAvailableProjects(projectNames);
      
      // Default to showing all projects
      if (projectFilters.length === 0) {
        setProjectFilters(projectNames);
      }
      
      // Filter projects based on selected filters
      if (projectFilters.length > 0) {
        const filtered = customProjects.filter(p => 
          projectFilters.includes(p.name) && p.visible !== false
        );
        setFilteredProjects(filtered);
      } else {
        // Show all projects if no filters are selected
        setFilteredProjects(customProjects.filter(p => p.visible !== false));
      }
    }
  }, [customProjects, projectFilters]);

  const handleOpenChange = useCallback((open: boolean) => {
    setShowAddProject(open);
    if (!open) {
      setNewProjectName('');
      setNewProjectFilter('');
    }
  }, []);

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
    // Additional logic for month changes can be added here
  }, []);

  const handleUpdateProject = useCallback((updatedProject: Project) => {
    if (updateProject) {
      updateProject(updatedProject);
      toast.success(`Updated project: ${updatedProject.name}`);
    }
  }, [updateProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (removeProjectFilter) {
      const projectToDelete = customProjects.find(p => p.id === projectId);
      if (projectToDelete) {
        removeProjectFilter(projectId);
        toast.success(`Deleted project: ${projectToDelete.name}`);
      }
    }
  }, [removeProjectFilter, customProjects]);

  const handleAddProject = useCallback(() => {
    if (addProjectFilter && newProjectName && newProjectFilter) {
      addProjectFilter(newProjectName, newProjectFilter);
      toast.success(`Added new project: ${newProjectName}`);
      setShowAddProject(false);
      setNewProjectName('');
      setNewProjectFilter('');
    }
  }, [addProjectFilter, newProjectName, newProjectFilter]);

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
}
