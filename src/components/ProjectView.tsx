
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Calendar, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProjectCard from './ProjectCard';

const ProjectView: React.FC = () => {
  const { 
    customProjects, 
    addProjectFilter, 
    removeProjectFilter, 
    projectFilters,
    events,
    syncCalendar
  } = useCalendarSync();
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Debug log when component renders
  useEffect(() => {
    console.log("ProjectView rendered with customProjects:", customProjects);
    console.log("Current project filters:", projectFilters);
  }, [customProjects, projectFilters]);

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
      setIsAddingProject(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects from Calendar Events</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="mr-2">
            {events.length} events available
          </Badge>
          <Button onClick={() => setIsAddingProject(!isAddingProject)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {isAddingProject ? 'Cancel' : 'Add Project View'}
          </Button>
        </div>
      </div>

      {isAddingProject && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Project View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g., Marketing Campaign"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-term">
                  Filter Term (matches event titles containing this text)
                </Label>
                <Input
                  id="filter-term"
                  placeholder="e.g., Marketing"
                  value={newProjectFilter}
                  onChange={(e) => setNewProjectFilter(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will create a project view for all calendar events containing this text in their title
                </p>
              </div>
              <Button 
                onClick={handleAddProject} 
                disabled={!newProjectName.trim() || !newProjectFilter.trim()}
              >
                Create Project View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project cards display */}
      {customProjects.length === 0 ? (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2 py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold">No Project Views Yet</h3>
            <p className="text-muted-foreground">
              Create a project view to group calendar events by specific keywords in their titles.
            </p>
            <Button onClick={() => setIsAddingProject(true)} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Project View
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              className="opacity-100 transition-all bg-gray-900 text-white"
            />
          ))}
        </div>
      )}

      {customProjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Current Project Filters</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {Object.entries(projectFilters).map(([projectId, filterTerm]) => (
                  <div key={projectId} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{projectId}:</span>
                      <Badge variant="outline">Contains "{filterTerm}"</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        removeProjectFilter(projectId);
                        // Force sync after removing filter
                        syncCalendar();
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
