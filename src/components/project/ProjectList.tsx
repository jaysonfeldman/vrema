import React from 'react';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/project/ProjectCard';

interface ProjectListProps {
  projects: Project[];
  viewMode?: 'grid'; // Only grid view is supported now
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects,
  onUpdateProject, 
  onDeleteProject 
}) => {
  if (projects.length === 0) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
        <p className="text-zinc-500 mb-4">No projects found. Connect to Google Calendar to import your projects.</p>
        <p className="text-zinc-400 text-sm">Create calendar events with the format "ProjectName#ActivityType Description" to track time.</p>
      </div>
    );
  }

  return (
    <>
      {projects.map((project, index) => (
        <div 
          key={project.id} 
          id={`project-card-${project.id}`} 
          className="transition-all duration-300 hover:transform hover:scale-[1.02]"
        >
          <ProjectCard
            project={project}
            className="h-full"
            style={{ animationDelay: `${index * 100}ms` }}
            onUpdateProject={onUpdateProject}
            onDeleteProject={onDeleteProject}
          />
        </div>
      ))}
    </>
  );
};

export default ProjectList;
