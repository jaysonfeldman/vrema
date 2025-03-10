
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectLookup(projects: Project[]) {
  const getProjectById = useCallback((projectId: string) => {
    console.log(`Looking for project with ID: ${projectId}`);
    
    if (!projects || projects.length === 0) {
      console.log('No projects available to search');
      return null;
    }
    
    console.log(`Searching through ${projects.length} projects`);
    
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      console.log(`Found project: ${project.name} (ID: ${project.id})`);
    } else {
      console.log(`Project not found with ID: ${projectId}`);
      console.log('Available project IDs:', projects.map(p => p.id));
    }
    
    return project || null;
  }, [projects]);

  return {
    getProjectById
  };
}
