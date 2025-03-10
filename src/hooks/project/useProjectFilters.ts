
import { useState, useCallback } from 'react';

export function useProjectFilters() {
  const [projectFilters, setProjectFilters] = useState<{[key: string]: string}>({});
  
  const loadSavedProjectFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem('projectFilters');
      return savedFilters ? JSON.parse(savedFilters) : {};
    } catch (err) {
      console.error('Error loading project filters:', err);
      return {};
    }
  }, []);
  
  const addProjectFilter = useCallback((projectId: string, filterTerm: string) => {
    setProjectFilters(prev => {
      const newFilters = { ...prev, [projectId]: filterTerm };
      try {
        localStorage.setItem('projectFilters', JSON.stringify(newFilters));
      } catch (err) {
        console.error('Error saving project filters:', err);
      }
      return newFilters;
    });
  }, []);
  
  const removeProjectFilter = useCallback((projectId: string, loadSavedProjectSettings: () => any, saveProjectSettings: (settings: any) => void) => {
    setProjectFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[projectId];
      
      try {
        localStorage.setItem('projectFilters', JSON.stringify(newFilters));
        
        // Also remove from project settings
        const settings = loadSavedProjectSettings();
        if (settings && settings[projectId]) {
          delete settings[projectId];
          saveProjectSettings(settings);
        }
      } catch (err) {
        console.error('Error removing project filter:', err);
      }
      
      return newFilters;
    });
  }, []);
  
  return {
    projectFilters,
    setProjectFilters,
    loadSavedProjectFilters,
    addProjectFilter,
    removeProjectFilter
  };
}
