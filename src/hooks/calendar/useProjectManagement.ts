
import { useState, useCallback, useEffect } from 'react';
import { Project } from '@/lib/types';
import { useProjectFilters } from '../project/useProjectFilters';
import { useProjectSettings } from '../project/useProjectSettings';
import { useProjectGenerator } from '../project/useProjectGenerator';
import { useProjectLookup } from '../project/useProjectLookup';

export function useProjectManagement(getProjectColor: (projectName: string) => string) {
  const [customProjects, setCustomProjects] = useState<Project[]>([]);
  
  const {
    projectFilters,
    setProjectFilters,
    loadSavedProjectFilters,
    addProjectFilter,
    removeProjectFilter
  } = useProjectFilters();
  
  const {
    loadSavedProjectSettings,
    saveProjectSettings,
    updateProject: updateProjectSettings
  } = useProjectSettings();
  
  const {
    identifyProjectsFromEvents,
    updateCustomProjects
  } = useProjectGenerator(getProjectColor);
  
  // Initialize filters from localStorage
  useEffect(() => {
    const savedFilters = loadSavedProjectFilters();
    if (Object.keys(savedFilters).length > 0) {
      setProjectFilters(savedFilters);
    }
  }, [loadSavedProjectFilters, setProjectFilters]);

  // Create wrapped functions that provide necessary dependencies
  const updateProject = useCallback((updatedProject: Project) => {
    updateProjectSettings(updatedProject, customProjects, setCustomProjects);
  }, [updateProjectSettings, customProjects]);

  const handleRemoveProjectFilter = useCallback((projectId: string) => {
    removeProjectFilter(projectId, loadSavedProjectSettings, saveProjectSettings);
  }, [removeProjectFilter, loadSavedProjectSettings, saveProjectSettings]);

  const handleIdentifyProjectsFromEvents = useCallback((eventsList: any[]) => {
    identifyProjectsFromEvents(eventsList, projectFilters, addProjectFilter);
  }, [identifyProjectsFromEvents, projectFilters, addProjectFilter]);

  const handleUpdateCustomProjects = useCallback((eventsList: any[], filters: {[key: string]: string}) => {
    updateCustomProjects(eventsList, filters, loadSavedProjectSettings, setCustomProjects);
  }, [updateCustomProjects, loadSavedProjectSettings]);

  // Project lookup function
  const { getProjectById } = useProjectLookup(customProjects);

  return {
    projectFilters,
    customProjects,
    addProjectFilter,
    removeProjectFilter: handleRemoveProjectFilter,
    updateProject,
    identifyProjectsFromEvents: handleIdentifyProjectsFromEvents,
    updateCustomProjects: handleUpdateCustomProjects,
    loadSavedProjectFilters,
    getProjectById
  };
}
