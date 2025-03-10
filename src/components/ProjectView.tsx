
import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '@/lib/types';
import { toast } from 'sonner';

// Add any props that the component expects
interface ProjectViewProps {
  projects: Project[];
  title?: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projects, title = "Projects" }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateProject = (updatedProject: Project) => {
    toast.success(`Project updated: ${updatedProject.name}`);
    // Implement actual update logic as needed
  };

  const handleDeleteProject = (projectId: string) => {
    toast.success(`Project deleted ID: ${projectId}`);
    // Implement actual delete logic as needed
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-2">No projects found</h3>
        <p className="text-sm text-gray-500 mb-4">Create a new project to get started</p>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            className="h-full" 
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectView;
