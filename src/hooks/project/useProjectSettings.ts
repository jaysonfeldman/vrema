
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectSettings() {
  const loadSavedProjectSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('projectSettings');
      return savedSettings ? JSON.parse(savedSettings) : {};
    } catch (err) {
      console.error('Error loading project settings:', err);
      return {};
    }
  }, []);
  
  const saveProjectSettings = useCallback((settings: any) => {
    try {
      localStorage.setItem('projectSettings', JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving project settings:', err);
    }
  }, []);
  
  const updateProject = useCallback((
    updatedProject: Project, 
    currentProjects: Project[], 
    setProjects: (projects: Project[]) => void
  ) => {
    if (!updatedProject) return;
    
    console.log(`Updating project: ${updatedProject.name}`);
    
    // Update in-memory projects
    const updated = currentProjects.map(p => 
      p.id === updatedProject.id ? { ...p, ...updatedProject } : p
    );
    
    setProjects(updated);
    
    // Update in localStorage
    const settings = loadSavedProjectSettings();
    settings[updatedProject.id] = {
      name: updatedProject.name,
      budgetHours: updatedProject.budgetHours,
      hourlyRate: updatedProject.hourlyRate,
      visible: updatedProject.visible !== false,
      // Preserve any other settings
      ...(settings[updatedProject.id] || {})
    };
    
    saveProjectSettings(settings);
  }, [loadSavedProjectSettings, saveProjectSettings]);
  
  return {
    loadSavedProjectSettings,
    saveProjectSettings,
    updateProject
  };
}
