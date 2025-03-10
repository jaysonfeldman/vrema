
import React, { useState } from 'react';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Plus, Filter, ListFilter, Grid, LayoutList, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Projects: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          
          <div className="flex space-x-4">
            <Button 
              variant="outline"
              className="flex items-center space-x-2 bg-white"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            
            <div className="flex items-center">
              <span className="text-sm mr-2">Sort by</span>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] border-none bg-transparent p-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Most tracked hours</span>
                    <ChevronDown size={16} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-tracked">Most tracked hours</SelectItem>
                  <SelectItem value="least-tracked">Least tracked hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center rounded-md border bg-white p-1">
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
            
            <Button 
              className="flex items-center space-x-2 bg-black hover:bg-gray-800"
              onClick={() => setShowAddProject(true)}
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>
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
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              className="bg-gray-900 text-white border-0 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
