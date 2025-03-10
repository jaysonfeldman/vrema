
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
    updateFilters
  } = useCalendarSync();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('current');
  
  useEffect(() => {
    console.log('ProjectsOverview - Current selected month:', selectedMonth);
  }, [selectedMonth]);
  
  const handleOpenChange = (open: boolean) => {
    setShowAddProject(open);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <div className="flex items-center gap-2">
          <ProjectFilters 
            onAddProject={() => setShowAddProject(true)}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
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
      ) : (
        <ProjectList 
          projects={customProjects} 
          viewMode={viewMode}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
        />
      )}
      
      <NewProjectDialog 
        open={showAddProject} 
        onOpenChange={handleOpenChange}
      />
    </div>
  );
};

export default ProjectsOverview;
