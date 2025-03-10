
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectCard from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { Project } from '@/lib/types';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const ProjectOverview: React.FC = () => {
  const { customProjects, syncCalendar, isLoading, updateProject } = useCalendarSync();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sync calendar when component mounts
  useEffect(() => {
    if (customProjects.length === 0) {
      syncCalendar(90); // Fetch 3 months of data
    }
  }, [syncCalendar, customProjects.length]);

  // Sort projects by total hours (descending)
  const sortedProjects = [...customProjects].sort((a, b) => b.totalHours - a.totalHours);

  if (isLoading) {
    return <ProjectsLoading />;
  }

  if (sortedProjects.length === 0) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">Calendar events with a "#" symbol will be grouped into projects.</p>
            <Button 
              onClick={() => syncCalendar(90)}
              className="mx-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Sync Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects ({sortedProjects.length})</CardTitle>
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
            <ProjectCard 
              key={project.id} 
              project={project} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
