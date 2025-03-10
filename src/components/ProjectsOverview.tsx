
import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Project } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import ProjectFilters from './project/ProjectFilters';
import ProjectSortOptions from './project/ProjectSortOptions';
import ViewToggle from './project/ViewToggle';
import ProjectSearch from './project/ProjectSearch';
import ProjectList from './project/ProjectList';
import NewProjectDialog from './project/NewProjectDialog';
import { Button } from '@/components/ui/button';

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
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadSavedProjects = () => {
      try {
        const saved = localStorage.getItem('saved-projects');
        if (saved) {
          const parsedProjects = JSON.parse(saved) as Project[];
          setSavedProjects(parsedProjects);
        } else if (customProjects.length === 0) {
          setSavedProjects([]);
        }
      } catch (err) {
        console.error('Error loading saved projects:', err);
        setSavedProjects([]);
      }
    };
    
    loadSavedProjects();
  }, [customProjects.length]);

  useEffect(() => {
    if (events.length === 0) {
      syncCalendar(30);
    }
  }, [events.length, syncCalendar]);

  useEffect(() => {
    if (savedProjects.length > 0) {
      localStorage.setItem('saved-projects', JSON.stringify(savedProjects));
    }
  }, [savedProjects]);

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

  useEffect(() => {
    localStorage.setItem('projects-view-mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('projects-sort-by', sortBy);
  }, [sortBy]);

  useEffect(() => {
    let projectsToDisplay = [...savedProjects];
    
    customProjects.forEach(customProject => {
      if (!projectsToDisplay.some(p => p.id === customProject.id)) {
        projectsToDisplay.push(customProject);
      }
    });
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      projectsToDisplay = projectsToDisplay.filter(
        project => project.name.toLowerCase().includes(term)
      );
    }
    
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
  }, [customProjects, savedProjects, searchTerm, sortBy]);
  
  const handleAddProject = () => {
    if (newProjectName.trim() && newProjectFilter.trim()) {
      console.log("Adding new project filter:", newProjectName, newProjectFilter);
      
      addProjectFilter(newProjectName.trim(), newProjectFilter.trim());
      
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
    setSavedProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    updateProject(updatedProject);
    
    toast({
      title: "Project updated",
      description: `Updated "${updatedProject.name}" settings`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = filteredProjects.find(p => p.id === projectId);
    const projectName = projectToDelete ? projectToDelete.name : projectId;
    
    setSavedProjects(prev => prev.filter(p => p.id !== projectId));
    
    removeProjectFilter(projectId);
    
    syncCalendar();
    
    toast({
      title: "Project deleted",
      description: `Removed "${projectName}" project`,
    });
  };

  const handleAddManualProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: `manual-${Date.now()}`,
        name: newProjectName.trim(),
        totalHours: 0,
        budgetHours: 120,
        activities: [],
        teamMembers: []
      };
      
      setSavedProjects(prev => [...prev, newProject]);
      
      toast({
        title: "Project created",
        description: `Created "${newProjectName}" project`,
      });
      
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  const handleEmptyStateAction = () => {
    // Determine whether to sync or create new project
    if (events.length === 0) {
      syncCalendar(30);
    } else {
      setShowAddProject(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex items-center gap-2">
          <ProjectFilters onAddProject={() => setShowAddProject(true)} />
          <ProjectSortOptions sortBy={sortBy} onSortChange={setSortBy} />
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        </div>
      </div>
      
      <ProjectSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <NewProjectDialog
        open={showAddProject}
        onOpenChange={setShowAddProject}
        newProjectName={newProjectName}
        onProjectNameChange={setNewProjectName}
        newProjectFilter={newProjectFilter}
        onProjectFilterChange={setNewProjectFilter}
        onAddProject={handleAddProject}
        onAddManualProject={handleAddManualProject}
      />
      
      {filteredProjects.length > 0 ? (
        <ProjectList
          projects={filteredProjects}
          viewMode={viewMode}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500 mb-4">No projects found. Connect to Google Calendar to import your projects.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => syncCalendar(30)}>Sync Calendar</Button>
            <Button variant="outline" onClick={() => setShowAddProject(true)}>Create Manual Project</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsOverview;
