
import React, { useEffect, useState } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import ProjectList from '@/components/project/ProjectList';
import NewProjectDialog from '@/components/project/NewProjectDialog';
import ProjectFilterActions from '@/components/project/ProjectFilterActions';
import EmptyProjectsState from '@/components/project/EmptyProjectsState';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { toast } from 'sonner';

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
  
  // Force immediate sync when component mounts if needed
  useEffect(() => {
    if (isAuthenticated && !calendarSyncInitiated && !lastSynced) {
      // Only sync if we haven't synced before
      console.log('ProjectsOverview - Initial calendar sync');
      syncCalendar(30);
      setCalendarSyncInitiated(true);
    }
  }, [isAuthenticated, syncCalendar, calendarSyncInitiated, lastSynced]);

  // Additional effect to handle case when events are already loaded but projects aren't visible
  useEffect(() => {
    if (events.length > 0 && customProjects.length === 0 && !calendarLoading) {
      // Apply default settings once
      if (!calendarSyncInitiated) {
        console.log('ProjectsOverview - Events exist but no projects visible, applying filters');
        setCalendarSyncInitiated(true);
        handleMonthChange(selectedMonth || 'current');
      }
    }
  }, [events.length, customProjects.length, calendarLoading, handleMonthChange, selectedMonth, calendarSyncInitiated]);

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
