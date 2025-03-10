
import React, { useEffect } from 'react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import ProjectList from '@/components/project/ProjectList';
import NewProjectDialog from '@/components/project/NewProjectDialog';
import ProjectFilterActions from '@/components/project/ProjectFilterActions';
import EmptyProjectsState from '@/components/project/EmptyProjectsState';
import ProjectsLoading from '@/components/project/ProjectsLoading';
import { useProjectManagement } from '@/hooks/useProjectManagement';

const ProjectsOverview: React.FC = () => {
  const { 
    isLoading: calendarLoading,
    syncCalendar,
    events,
    isAuthenticated,
    lastSynced
  } = useCalendarSync();
  
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
    if (isAuthenticated && !lastSynced) {
      console.log('ProjectsOverview - Initial calendar sync');
      syncCalendar(30);
    }
  }, [isAuthenticated, syncCalendar, lastSynced]);

  // Make sure to show all projects
  useEffect(() => {
    if (availableProjects.length > 0 && projectFilters.length === 0) {
      console.log('ProjectsOverview - Setting all projects to be visible');
      setProjectFilters(availableProjects);
    }
  }, [availableProjects, projectFilters, setProjectFilters]);

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
