import React from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectSettingsDialog from '@/components/project/ProjectSettingsDialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LayoutGrid } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Project } from '@/lib/types';
import { useToast } from './ui/use-toast';

export default function ProjectsOverview() {
  const { customProjects, isLoading, setCustomProjects } = useSharedState();
  const [sortBy, setSortBy] = React.useState('Most tracked hours');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const { toast } = useToast();

  const handleUpdateProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleSaveProjectSettings = (updatedProject: Project) => {
    setCustomProjects(
      customProjects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    );
    toast({
      title: "Project updated",
      description: "Project settings have been saved successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customProjects || customProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No projects found</h3>
        <p className="text-muted-foreground mt-2">
          Add a calendar event with a title like "projectname#activity description"<br />
          For example: "marvel#design making the homepage"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-medium">Projects</h2>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-900 hover:underline">
              add project
            </button>
            <button className="text-sm text-gray-900 hover:underline">
              all projects
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Most tracked hours">Most tracked hours</SelectItem>
              <SelectItem value="Least tracked hours">Least tracked hours</SelectItem>
              <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
              <SelectItem value="Name (Z-A)">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            className="w-[100px] justify-center"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onUpdateProject={handleUpdateProject}
            className="h-full"
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectSettingsDialog
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onSave={handleSaveProjectSettings}
        />
      )}
    </div>
  );
}
