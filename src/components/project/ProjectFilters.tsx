
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Filter } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface ProjectFiltersProps {
  onAddProject: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  projectFilters: string[];
  availableProjects: string[];
  onProjectFilterChange: (projects: string[]) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  onAddProject,
  selectedMonth,
  onMonthChange,
  projectFilters,
  availableProjects,
  onProjectFilterChange
}) => {
  const handleSelectAll = () => {
    onProjectFilterChange([...availableProjects]);
  };
  
  const handleSelectNone = () => {
    onProjectFilterChange([]);
  };
  
  const handleToggleProject = (project: string) => {
    if (projectFilters.includes(project)) {
      onProjectFilterChange(projectFilters.filter(p => p !== project));
    } else {
      onProjectFilterChange([...projectFilters, project]);
    }
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={() => onMonthChange(selectedMonth === 'current' ? 'previous' : 'current')}
      >
        <Calendar className="h-4 w-4 mr-2" />
        {selectedMonth === 'current' ? 'This Month' : 'Last Month'}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleSelectAll}>
              Select All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSelectNone}>
              Select None
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {availableProjects.map(project => (
              <DropdownMenuCheckboxItem
                key={project}
                checked={projectFilters.includes(project)}
                onCheckedChange={() => handleToggleProject(project)}
              >
                {project}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="default" size="sm" className="h-9" onClick={onAddProject}>
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </>
  );
};

export default ProjectFilters;
