
import React from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectCard from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { Project } from '@/lib/types';

const ProjectOverview: React.FC = () => {
  const { customProjects, getTotalHours } = useCalendarSync();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Sort projects by total hours (descending)
  const sortedProjects = [...customProjects].sort((a, b) => b.totalHours - a.totalHours);

  if (sortedProjects.length === 0) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No projects found. Calendar events with a "#" symbol will be grouped into projects.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
