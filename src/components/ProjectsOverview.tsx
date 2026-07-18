import React from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectSettingsDialog from '@/components/project/ProjectSettingsDialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LayoutGrid } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Project } from '@/lib/types';
import { useToast } from './ui/use-toast';

export default function ProjectsOverview() {
  const { isLoading, customProjects, setCustomProjects } = useSharedState();
  const { filteredProjects } = useProjectStats();
  const [sortBy, setSortBy] = React.useState('Most tracked hours');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const { toast } = useToast();

  const handleUpdateProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleSaveProjectSettings = (updatedProject: Project) => {
    const existing = customProjects.find((project) => project.id === updatedProject.id);
    const nextProjects = existing
      ? customProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
      : [...customProjects, updatedProject];

    setCustomProjects(nextProjects);
    toast({
      title: "Project updated",
      description: "Project settings have been saved successfully.",
    });
  };

  const sortedProjects = React.useMemo(() => {
    const projects = [...filteredProjects];

    switch (sortBy) {
      case 'Least tracked hours':
        return projects.sort((a, b) => a.totalHours - b.totalHours);
      case 'Name (A-Z)':
        return projects.sort((a, b) => a.name.localeCompare(b.name));
      case 'Name (Z-A)':
        return projects.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return projects.sort((a, b) => b.totalHours - a.totalHours);
    }
  }, [filteredProjects, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sortedProjects || sortedProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No projects found</h3>
        <p className="text-muted-foreground mt-2">
          Name calendar events like <code className="text-zinc-700">mx#design user flows</code><br />
          where <strong>mx</strong> is the project, <strong>design</strong> is the activity, and <strong>user flows</strong> is the description.
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
        {sortedProjects.map((project) => (
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
