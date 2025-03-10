
import React from 'react';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  viewMode, 
  onUpdateProject, 
  onDeleteProject 
}) => {
  if (projects.length === 0) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
        <p className="text-zinc-500 mb-4">No projects found. Connect to Google Calendar to import your projects.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div>No projects found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
        : "space-y-4"
    )}>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          className="bg-zinc-900 text-white"
          style={{ animationDelay: `${index * 100}ms` }}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
        />
      ))}
    </div>
  );
};

export default ProjectList;
