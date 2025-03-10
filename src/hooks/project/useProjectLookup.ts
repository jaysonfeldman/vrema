
import { useCallback } from 'react';
import { Project } from '@/lib/types';

export function useProjectLookup(projects: Project[]) {
  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects]);

  return {
    getProjectById
  };
}
