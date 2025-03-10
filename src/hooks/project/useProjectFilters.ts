
import { useState, useCallback } from 'react';

export function useProjectFilters() {
  const [projectFilters, setProjectFilters] = useState<{[key: string]: string}>({});
  
  const LOCAL_STORAGE_KEY = 'calendar-project-views';

  const loadSavedProjectFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        console.log('Loaded saved project filters:', parsedFilters);
        return parsedFilters;
      }
    } catch (error) {
      console.error('Error loading saved project filters:', error);
    }
    return {};
  }, []);

  const saveProjectFilters = useCallback((filters: {[key: string]: string}) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
      console.log('Saved project filters to local storage');
    } catch (error) {
      console.error('Error saving project filters:', error);
    }
  }, []);

  const addProjectFilter = useCallback((projectId: string, filterTerm: string) => {
    console.log(`Adding project filter: ${projectId} with term "${filterTerm}"`);
    setProjectFilters(prev => {
      const projectKey = projectId.toLowerCase();
      const newFilters = {
        ...prev,
        [projectKey]: filterTerm
      };
      console.log("Updated project filters:", newFilters);
      saveProjectFilters(newFilters);
      return newFilters;
    });
  }, [saveProjectFilters]);

  const removeProjectFilter = useCallback((projectId: string, loadSavedProjectSettings: Function, saveProjectSettings: Function) => {
    setProjectFilters(prev => {
      const newFilters = {...prev};
      const projectKey = projectId.toLowerCase();
      delete newFilters[projectKey];
      saveProjectFilters(newFilters);
      return newFilters;
    });

    const savedSettings = loadSavedProjectSettings();
    if (savedSettings) {
      const projectKey = projectId.toLowerCase();
      if (savedSettings[projectKey]) {
        const newSettings = {...savedSettings};
        delete newSettings[projectKey];
        saveProjectSettings(newSettings);
      }
    }
  }, [saveProjectFilters]);

  return {
    projectFilters,
    setProjectFilters,
    loadSavedProjectFilters,
    saveProjectFilters,
    addProjectFilter,
    removeProjectFilter
  };
}
