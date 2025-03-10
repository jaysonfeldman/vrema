
import React, { useState } from 'react';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Power, CheckCircle, Circle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
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
  
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.active;
    if (filter === 'inactive') return !project.active;
    return true;
  });
  
  const activeCount = projects.filter(p => p.active).length;
  const inactiveCount = projects.filter(p => !p.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Tabs defaultValue="all" className="w-auto" onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              All
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {projects.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Active
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <Power className="h-4 w-4 text-gray-500" />
              Inactive
              <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {inactiveCount}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">
            No {filter} projects found.
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
            : "space-y-4"
        )}>
          {filteredProjects.map((project, index) => (
            <div key={project.id} id={`project-card-${project.id}`}>
              <ProjectCard
                project={project}
                className="text-white"
                style={{ animationDelay: `${index * 100}ms` }}
                onUpdateProject={onUpdateProject}
                onDeleteProject={onDeleteProject}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
