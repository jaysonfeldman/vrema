
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectLookup(projects: Project[]) {
  const getProjectById = useCallback((projectId: string) => {
    console.log(`Looking for project with ID: ${projectId}`, 
      projects.map(p => ({ id: p.id, name: p.name })));
    
    const project = projects.find(p => p.id === projectId);
    console.log(project ? `Found project: ${project.name}` : 'Project not found');
    
    return project || null;
  }, [projects]);

  return {
    getProjectById
  };
}
