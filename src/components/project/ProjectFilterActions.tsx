
import React from 'react';
import { Loader2 } from 'lucide-react';
import ProjectFilters from '@/components/project/ProjectFilters';

interface ProjectFilterActionsProps {
  isLoading: boolean;
  calendarLoading: boolean;
  selectedMonth: string;
  availableProjects: string[];
  projectFilters: string[];
  setShowAddProject: (show: boolean) => void;
  handleMonthChange: (month: string) => void;
  setProjectFilters: (filters: string[]) => void;
}

const ProjectFilterActions: React.FC<ProjectFilterActionsProps> = ({
  isLoading,
  calendarLoading,
  selectedMonth,
  availableProjects,
  projectFilters,
  setShowAddProject,
  handleMonthChange,
  setProjectFilters
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
      <div className="flex items-center gap-2">
        {isLoading || calendarLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <ProjectFilters 
            onAddProject={() => setShowAddProject(true)}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            projectFilters={projectFilters}
            availableProjects={availableProjects}
            onProjectFilterChange={setProjectFilters}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectFilterActions;
