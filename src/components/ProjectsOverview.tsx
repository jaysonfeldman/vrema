
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid, LayoutList, ChevronDown, Filter } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProjectCard from './ProjectCard';
import { cn } from '@/lib/utils';
import { Project, Activity } from '@/lib/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ProjectsOverview: React.FC = () => {
  const { 
    customProjects, 
    addProjectFilter, 
    removeProjectFilter, 
    projectFilters,
    events,
    syncCalendar,
    updateProject,
    getActivitiesFromEvents
  } = useCalendarSync();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('most-tracked');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

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

  // Update filtered projects based on customProjects, sort and search
  useEffect(() => {
    let projectsToDisplay = [...customProjects];
    
    // Apply search filter if any
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      projectsToDisplay = projectsToDisplay.filter(
        project => project.name.toLowerCase().includes(term)
      );
    }
    
    // Sort projects
    projectsToDisplay.sort((a, b) => {
      if (sortBy === 'most-tracked') {
        return b.totalHours - a.totalHours;
      } else if (sortBy === 'least-tracked') {
        return a.totalHours - b.totalHours;
      } else if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    setFilteredProjects(projectsToDisplay);
  }, [customProjects, searchTerm, sortBy]);
  
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-500"
            onClick={() => setShowAddProject(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add project
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            All projects
          </Button>

          <div className="flex items-center ml-2">
            <span className="text-sm mr-2">Sort by</span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] border-none bg-transparent p-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {sortBy === 'most-tracked' ? 'Most tracked hours' : 
                     sortBy === 'least-tracked' ? 'Least tracked hours' : 
                     'Alphabetical'}
                  </span>
                  <ChevronDown size={16} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-tracked">Most tracked hours</SelectItem>
                <SelectItem value="least-tracked">Least tracked hours</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center rounded-md border bg-white p-1 ml-2">
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
        </div>
      </div>
      
      {/* Search input */}
      <div className="w-full max-w-sm">
        <Input
          type="search"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white"
        />
      </div>
      
      {/* Add Project Dialog */}
      <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Name
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Marketing Project"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-filter" className="text-right">
                Filter Term
              </Label>
              <Input
                id="project-filter"
                value={newProjectFilter}
                onChange={(e) => setNewProjectFilter(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Marketing"
              />
            </div>
            <p className="text-xs text-muted-foreground col-start-2 col-span-3">
              This will create a view of all events with titles containing this text
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleAddProject}
              disabled={!newProjectName || !newProjectFilter}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Projects Grid/List View */}
      {filteredProjects.length > 0 ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
            : "space-y-4"
        )}>
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              className="bg-zinc-900 text-white"
              style={{ animationDelay: `${index * 100}ms` }}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500 mb-4">No projects found</p>
          <Button onClick={() => setShowAddProject(true)}>Create your first project</Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;
