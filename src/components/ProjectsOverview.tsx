
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project } from '@/lib/types';
import ProjectList from '@/components/project/ProjectList';
import ProjectFilters from '@/components/project/ProjectFilters';
import NewProjectDialog from '@/components/project/NewProjectDialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchProjects, saveProject, deleteProject } from '@/services/projectService';
import { v4 as uuidv4 } from 'uuid';

const ProjectsOverview: React.FC = () => {
  const { 
    customProjects,
    updateProject,
    isLoading: calendarLoading,
    syncCalendar,
    filters,
    updateFilters,
    getProjects,
    addProjectFilter,
  } = useCalendarSync();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [storedProjects, setStoredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for new project dialog
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFilter, setNewProjectFilter] = useState('');
  
  // Load projects from Supabase on mount
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const projects = await fetchProjects();
        setStoredProjects(projects);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          variant: "destructive",
          title: "Error loading projects",
          description: "Could not load your projects. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Sync calendar when component mounts to ensure we have project data
  useEffect(() => {
    if (!calendarLoading && customProjects.length === 0) {
      console.log('ProjectsOverview - Initial calendar sync');
      syncCalendar(30); // Default to 30 days for initial load
    }
  }, []);
  
  // Merge stored projects with calendar projects
  useEffect(() => {
    const allProjects = [...storedProjects];
    
    // Add any custom projects that aren't already in stored projects
    for (const customProject of customProjects) {
      const existingProject = storedProjects.find(p => 
        p.id === customProject.id || 
        p.name.toLowerCase() === customProject.name.toLowerCase());
      
      if (!existingProject) {
        allProjects.push(customProject);
      }
    }
    
    if (projectFilters.length === 0) {
      // Initialize project filters with all project names
      setProjectFilters(allProjects.map(project => project.name));
    }
    
    // Apply project filters and visibility settings
    if (projectFilters.length === 0) {
      setFilteredProjects([]);
    } else {
      // Filter by name (case-insensitive matching)
      let filtered = allProjects.filter(project => 
        projectFilters.some(filter => 
          // Case-insensitive comparison for project names
          project.name.toLowerCase() === filter.toLowerCase() ||
          filter === project.name
        )
      );
      
      // Only show visible projects
      filtered = filtered.filter(project => project.visible !== false);
      
      setFilteredProjects(filtered);
    }
  }, [customProjects, projectFilters, storedProjects]);
  
  const handleOpenChange = (open: boolean) => {
    setShowAddProject(open);
    if (!open) {
      // Reset form when dialog closes
      setNewProjectName('');
      setNewProjectFilter('');
    }
  };
  
  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      const result = await saveProject(updatedProject);
      
      if (result.success && result.project) {
        // Update local state
        setStoredProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? result.project! : p)
        );
        
        updateProject(updatedProject);
        
        toast({
          title: "Project updated",
          description: `Updated "${updatedProject.name}" settings`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error updating project",
          description: "Failed to update project. Please try again."
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await deleteProject(projectId);
      
      if (result.success) {
        // Update local state
        setStoredProjects(prev => prev.filter(p => p.id !== projectId));
        
        toast({
          title: "Project deleted",
          description: "Project has been removed"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error deleting project",
          description: "Failed to delete project. Please try again."
        });
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    }
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

  const availableProjects = [...new Set([
    ...customProjects.map(project => project.name),
    ...storedProjects.map(project => project.name)
  ])];
  
  // Handle adding new project with filter
  const handleAddProject = async () => {
    if (newProjectName && newProjectFilter) {
      // Convert to lowercase for case-insensitive comparison
      const normalizedName = newProjectName.toLowerCase();
      
      // Check if project already exists (case-insensitive)
      const projectExists = [
        ...customProjects,
        ...storedProjects
      ].some(p => p.name.toLowerCase() === normalizedName);
      
      if (!projectExists) {
        // Create new project
        const newProject: Project = {
          id: uuidv4(),
          name: newProjectName,
          totalHours: 0,
          budgetHours: undefined,
          hourlyRate: undefined,
          activities: [],
          teamMembers: [],
          filterTerm: newProjectFilter
        };
        
        // Save to Supabase
        const result = await saveProject(newProject);
        
        if (result.success && result.project) {
          // Update local state
          setStoredProjects(prev => [...prev, result.project!]);
          
          // Add project filter for calendar sync
          addProjectFilter(normalizedName, newProjectFilter);
          
          toast({
            title: "Project created",
            description: `Created new project "${newProjectName}"`
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error creating project",
            description: "Failed to create project. Please try again."
          });
        }
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
          />
        </div>
      </div>
      
      {isLoading || calendarLoading ? (
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
          viewMode="grid"
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
