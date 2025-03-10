
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Grid, LayoutList } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProjectCard from './ProjectCard';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';

const ProjectsOverview: React.FC = () => {
  const { 
    customProjects, 
    addProjectFilter, 
    removeProjectFilter, 
    projectFilters,
    events,
    syncCalendar,
    updateProject
  } = useCalendarSync();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('most-tracked');

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('projects-view-mode');
    if (savedViewMode) {
      setViewMode(savedViewMode as 'grid' | 'list');
    }
    
    const savedSortBy = localStorage.getItem('projects-sort-by');
    if (savedSortBy) {
      setSortBy(savedSortBy);
    }
  }, []);

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('projects-view-mode', viewMode);
  }, [viewMode]);

  // Save sort preference to localStorage
  useEffect(() => {
    localStorage.setItem('projects-sort-by', sortBy);
  }, [sortBy]);
  
  const handleAddProject = () => {
    if (newProjectName.trim() && newProjectFilter.trim()) {
      console.log("Adding new project filter:", newProjectName, newProjectFilter);
      
      // Add the new project filter
      addProjectFilter(newProjectName.trim(), newProjectFilter.trim());
      
      // Force an immediate calendar sync to update the projects
      syncCalendar();
      
      toast({
        title: "Project view created",
        description: `Created "${newProjectName}" view for events containing "${newProjectFilter}"`,
      });
      
      setNewProjectName('');
      setNewProjectFilter('');
      setShowAddProject(false);
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    updateProject(updatedProject);
    
    toast({
      title: "Project updated",
      description: `Updated "${updatedProject.name}" settings`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    // Find the project name before deleting
    const projectToDelete = customProjects.find(p => p.id === projectId);
    const projectName = projectToDelete ? projectToDelete.name : projectId;
    
    // Remove the project filter
    removeProjectFilter(projectId);
    
    // Force a sync to update
    syncCalendar();
    
    toast({
      title: "Project deleted",
      description: `Removed "${projectName}" project view`,
    });
  };

  // Sort projects by hours logged (most or least)
  const sortedProjects = [...customProjects].sort((a, b) => {
    if (sortBy === 'most-tracked') {
      return b.totalHours - a.totalHours;
    } else {
      return a.totalHours - b.totalHours;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-background p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-tracked">Most tracked hours</SelectItem>
              <SelectItem value="least-tracked">Least tracked hours</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddProject(!showAddProject)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        </div>
      </div>
      
      {showAddProject && (
        <Card className="bg-muted/50 mb-4">
          <CardContent className="pt-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Project Name</label>
                <Input 
                  placeholder="e.g., Marketing Project" 
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title Filter (matches events containing this text)</label>
                <Input 
                  placeholder="e.g., Marketing" 
                  value={newProjectFilter}
                  onChange={e => setNewProjectFilter(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will create a view of all events with titles containing this text
                </p>
              </div>
              <Button 
                onClick={handleAddProject}
                disabled={!newProjectName || !newProjectFilter}
              >
                Create Project View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Projects Grid/List View */}
      {customProjects.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
            : "space-y-4"
        )}>
          {sortedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              className="bg-gray-900 text-white border-0"
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900 text-white p-8 text-center">
          <div className="py-6">
            <h3 className="text-lg font-medium mb-2">No project views created yet</h3>
            <p className="text-gray-400">
              Create a custom project view to filter your calendar events
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectsOverview;
