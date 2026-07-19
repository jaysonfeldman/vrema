import React from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectSettingsDialog from '@/components/project/ProjectSettingsDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FolderOpenIcon } from '@/components/icons/folder-open';
import { selectTriggerClass } from '@/components/DateRangeSelect';
import { WithTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface ProjectsOverviewProps {
  title?: string;
}

const sortOptions = [
  { value: 'most', label: 'Most hours' },
  { value: 'least', label: 'Least hours' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
] as const;

export default function ProjectsOverview({ title = 'Projects' }: ProjectsOverviewProps) {
  const { isLoading, customProjects, setCustomProjects } = useSharedState();
  const { filteredProjects } = useProjectStats();
  const [sortBy, setSortBy] = React.useState<(typeof sortOptions)[number]['value']>('most');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const { toast } = useToast();

  const handleSaveProjectSettings = (updatedProject: Project) => {
    const existing = customProjects.find((project) => project.id === updatedProject.id);
    const nextProjects = existing
      ? customProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project))
      : [...customProjects, updatedProject];

    setCustomProjects(nextProjects);
    toast({ title: 'Project updated', description: 'Project settings have been saved.' });
  };

  const sortedProjects = React.useMemo(() => {
    const projects = [...filteredProjects];
    switch (sortBy) {
      case 'least':
        return projects.sort((a, b) => a.totalHours - b.totalHours);
      case 'az':
        return projects.sort((a, b) => a.name.localeCompare(b.name));
      case 'za':
        return projects.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return projects.sort((a, b) => b.totalHours - a.totalHours);
    }
  }, [filteredProjects, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-medium">{title}</h2>
        {sortedProjects.length > 0 && (
          <WithTooltip content="Sort projects" side="bottom">
            <div className="inline-flex">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className={cn(selectTriggerClass)}>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[9rem] rounded-xl border-surface p-1 shadow-elevated">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="rounded-lg text-sm">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </WithTooltip>
        )}
      </div>

      {sortedProjects.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <FolderOpenIcon size={24} className="text-muted-foreground" />
            <h3 className="text-sm font-medium">No projects yet</h3>
            <p className="max-w-md text-xs text-muted-foreground">
              Name calendar events like{' '}
              <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs">vrema#design homepage mockups</code>
              . <span className="font-medium">vrema</span> is the project,{' '}
              <span className="font-medium">design</span> the activity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onUpdateProject={setSelectedProject} />
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectSettingsDialog
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onSave={handleSaveProjectSettings}
        />
      )}
    </section>
  );
}
