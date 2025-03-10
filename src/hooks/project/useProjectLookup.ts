
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectLookup(customProjects: Project[]) {
  const getProjectById = useCallback((projectId: string): Project | null => {
    if (!projectId) return null;
    
    console.log(`Looking for project with ID: "${projectId}" among ${customProjects.length} projects`);
    const foundProject = customProjects.find(p => p.id.toLowerCase() === projectId.toLowerCase());
    
    if (foundProject) {
      console.log(`Found project by ID: ${foundProject.name}`);
      return foundProject;
    } else {
      console.log(`Project not found by ID: ${projectId}`);
      return null;
    }
  }, [customProjects]);

  return {
    getProjectById
  };
}
