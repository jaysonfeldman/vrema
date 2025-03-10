
import React from 'react';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';

interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list'; // We'll keep this for API compatibility, but will always use grid
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects,
  viewMode, // Kept for API compatibility but not used
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
  
  console.log(`Rendering project list with ${projects.length} projects`, projects.map(p => ({id: p.id, name: p.name, hours: p.totalHours})));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project, index) => (
        <div key={project.id} id={`project-card-${project.id}`}>
          <ProjectCard
            project={project}
            className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
