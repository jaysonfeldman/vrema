
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project } from '@/lib/types';
import ProjectList from '@/components/project/ProjectList';
import ProjectFilters from '@/components/project/ProjectFilters';
import NewProjectDialog from '@/components/project/NewProjectDialog';
import ViewToggle from '@/components/project/ViewToggle';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const ProjectsOverview: React.FC = () => {
  const { 
    customProjects,
    updateProject,
    isLoading,
    syncCalendar,
    filters,
    updateFilters,
    getProjects,
    addProjectFilter,
  } = useCalendarSync();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);
  
  // New state for new project dialog
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  
  // Sync calendar when component mounts to ensure we have project data
  useEffect(() => {
    if (!isLoading && customProjects.length === 0) {
      console.log('ProjectsOverview - Initial calendar sync');
      syncCalendar(30); // Default to 30 days for initial load
    }
  }, []);
  
  useEffect(() => {
    if (customProjects.length > 0 && projectFilters.length === 0) {
      // Initialize project filters with all project names
      setProjectFilters(customProjects.map(project => project.name));
    }
    
    // Apply project filters and visibility settings
    if (projectFilters.length === 0) {
      setFilteredProjects([]);
    } else {
      // Filter by name and visibility (case-insensitive matching)
      let filtered = customProjects.filter(project => 
        projectFilters.some(filter => 
          // Case-insensitive comparison for project names
          project.name.toLowerCase() === filter.toLowerCase() ||
          filter === project.name
        )
      );
      
      // Apply visibility filter
      if (!showHiddenProjects) {
        filtered = filtered.filter(project => project.visible !== false);
      }
      
      setFilteredProjects(filtered);
    }
  }, [customProjects, projectFilters, showHiddenProjects]);
  
  const handleOpenChange = (open: boolean) => {
    setShowAddProject(open);
    if (!open) {
      // Reset form when dialog closes
      setNewProjectName('');
      setNewProjectFilter('');
    }
  };
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    updateProject(updatedProject);
    toast({
      title: "Project updated",
      description: `Updated "${updatedProject.name}" settings`
    });
  };
  
  const handleDeleteProject = (projectId: string) => {
    toast({
      title: "Project deleted",
      description: "Project has been removed"
    });
  };
  
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    
    // Update date range based on selected month
    switch (month) {
      case 'current':
        // Current month - about 30 days
        updateFilters({ dateRange: 30 });
        syncCalendar(30);
        break;
      case 'previous':
        // Previous month - about 60 days
        updateFilters({ dateRange: 60 });
        syncCalendar(60);
        break;
      case 'all':
        // All time - last 365 days
        updateFilters({ dateRange: 365 });
        syncCalendar(365);
        break;
      case 'custom':
        // Custom range - keep current range but show date picker
        // This would typically open a date picker dialog
        toast({
          title: "Custom date range",
          description: "Custom date range selection is not yet implemented"
        });
        break;
      default:
        updateFilters({ dateRange: 30 });
        syncCalendar(30);
    }
  };

  const toggleHiddenProjects = () => {
    setShowHiddenProjects(prev => !prev);
  };

  const availableProjects = customProjects.map(project => project.name);
  
  // Handle adding new project with filter
  const handleAddProject = () => {
    if (newProjectName && newProjectFilter) {
      // Convert to lowercase for case-insensitive comparison
      const normalizedName = newProjectName.toLowerCase();
      
      // Check if project already exists (case-insensitive)
      const projectExists = customProjects.some(
        p => p.name.toLowerCase() === normalizedName
      );
      
      if (!projectExists) {
        addProjectFilter(normalizedName, newProjectFilter);
        toast({
          title: "Project created",
          description: `Created new project "${newProjectName}"`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Project already exists",
          description: `A project with the name "${newProjectName}" already exists`
        });
      }
      
      setShowAddProject(false);
      setNewProjectName('');
      setNewProjectFilter('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <div className="flex items-center gap-2">
          <ProjectFilters 
            onAddProject={() => setShowAddProject(true)}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            projectFilters={projectFilters}
            availableProjects={availableProjects}
            onProjectFilterChange={setProjectFilters}
            showHiddenProjects={showHiddenProjects}
            onToggleHiddenProjects={toggleHiddenProjects}
          />
          <ViewToggle 
            viewMode={viewMode} 
            onViewChange={handleViewModeChange} 
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-muted/50 rounded-lg border border-border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No projects available</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first project or connect to Google Calendar.
          </p>
          <button 
            onClick={() => setShowAddProject(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <ProjectList 
          projects={filteredProjects} 
          viewMode={viewMode}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      )}
      
      <NewProjectDialog 
        open={showAddProject} 
        onOpenChange={handleOpenChange}
        newProjectName={newProjectName}
        onProjectNameChange={setNewProjectName}
        newProjectFilter={newProjectFilter}
        onProjectFilterChange={setNewProjectFilter}
        onAddProject={handleAddProject}
        existingProjects={availableProjects}
      />
    </div>
  );
};

export default ProjectsOverview;
