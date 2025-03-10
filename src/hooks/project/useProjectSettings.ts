
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectSettings() {
  const PROJECT_SETTINGS_KEY = 'calendar-project-settings';

  const loadSavedProjectSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(PROJECT_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded saved project settings:', parsedSettings);
        return parsedSettings;
      }
    } catch (error) {
      console.error('Error loading saved project settings:', error);
    }
    return {};
  }, []);

  const saveProjectSettings = useCallback((settings: {[key: string]: any}) => {
    try {
      localStorage.setItem(PROJECT_SETTINGS_KEY, JSON.stringify(settings));
      console.log('Saved project settings to local storage');
    } catch (error) {
      console.error('Error saving project settings:', error);
    }
  }, []);

  const updateProject = useCallback((updatedProject: Project, customProjects: Project[], setCustomProjects: Function) => {
    console.log("Updating project:", updatedProject);
    
    setCustomProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    const settings = loadSavedProjectSettings();
    const projectKey = updatedProject.id.toLowerCase();
    const updatedSettings = {
      ...settings,
      [projectKey]: {
        name: updatedProject.name,
        budgetHours: updatedProject.budgetHours,
        hourlyRate: updatedProject.hourlyRate,
        visible: updatedProject.visible
      }
    };
    
    saveProjectSettings(updatedSettings);
    console.log("Saved updated project settings:", updatedSettings);
  }, [loadSavedProjectSettings, saveProjectSettings]);

  return {
    loadSavedProjectSettings,
    saveProjectSettings,
    updateProject
  };
}
