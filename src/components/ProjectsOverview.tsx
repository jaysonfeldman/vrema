
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import ProjectList from '@/components/project/ProjectList';
import NewProjectDialog from '@/components/project/NewProjectDialog';
import ProjectFilterActions from '@/components/project/ProjectFilterActions';
import EmptyProjectsState from '@/components/project/EmptyProjectsState';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { toast } from '@/components/ui/use-toast';

const ProjectsOverview: React.FC = () => {
  const { 
    isLoading: calendarLoading,
    syncCalendar,
    customProjects,
    events,
    isAuthenticated,
    lastSynced
  } = useCalendarSync();
  
  const [calendarSyncInitiated, setCalendarSyncInitiated] = useState(false);
  
  const {
    showAddProject,
    setShowAddProject,
    selectedMonth,
    projectFilters,
    filteredProjects,
    isLoading,
    newProjectName,
    setNewProjectName,
    newProjectFilter,
    setNewProjectFilter,
    availableProjects,
    handleOpenChange,
    handleUpdateProject,
    handleDeleteProject,
    handleMonthChange,
    handleAddProject,
    setProjectFilters
  } = useProjectManagement();
  
  // Force immediate sync when component mounts, even if lastSynced exists
  useEffect(() => {
    if (isAuthenticated && !calendarSyncInitiated) {
      console.log('ProjectsOverview - Forcing initial calendar sync');
      // Use a shorter timeout to make it feel more immediate
      setTimeout(() => {
        syncCalendar(30); // Default to 30 days for initial load
        setCalendarSyncInitiated(true);
      }, 100);
    }
  }, [isAuthenticated, syncCalendar, calendarSyncInitiated]);

  // Additional effect to handle case when events are already loaded but projects aren't visible
  useEffect(() => {
    if (events.length > 0 && customProjects.length === 0 && !calendarLoading && !calendarSyncInitiated) {
      console.log('ProjectsOverview - Events exist but no projects visible, resyncing');
      setCalendarSyncInitiated(true);
      syncCalendar(30);
    }
  }, [events.length, customProjects.length, calendarLoading, syncCalendar, calendarSyncInitiated]);

  // If we have events but no projects are showing, trigger a month change to force refresh
  useEffect(() => {
    if (events.length > 0 && filteredProjects.length === 0 && !isLoading && !calendarLoading && lastSynced) {
      console.log('ProjectsOverview - No filtered projects visible, applying default filters');
      // Small delay to ensure all hooks have run
      setTimeout(() => {
        handleMonthChange(selectedMonth || 'current');
        
        // Show a toast to let user know what's happening
        if (!calendarSyncInitiated) {
          toast({
            title: "Loading projects",
            description: "Synchronizing your calendar data to show projects"
          });
          setCalendarSyncInitiated(true);
        }
      }, 500);
    }
  }, [events.length, filteredProjects.length, isLoading, calendarLoading, lastSynced, handleMonthChange, selectedMonth, calendarSyncInitiated]);

  return (
    <div className="space-y-6">
      <ProjectFilterActions
        isLoading={isLoading}
        calendarLoading={calendarLoading}
        selectedMonth={selectedMonth}
        availableProjects={availableProjects}
        projectFilters={projectFilters}
        setShowAddProject={setShowAddProject}
        handleMonthChange={handleMonthChange}
        setProjectFilters={setProjectFilters}
      />
      
      {isLoading || calendarLoading ? (
        <ProjectsLoading />
      ) : filteredProjects.length === 0 ? (
        <EmptyProjectsState onAddProject={() => setShowAddProject(true)} />
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
