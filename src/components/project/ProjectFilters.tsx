
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Calendar, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProjectFiltersProps {
  onAddProject: () => void;
  onManageProjects?: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  projectFilters?: string[];
  availableProjects?: string[];
  onProjectFilterChange?: (projects: string[]) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  onAddProject, 
  onManageProjects,
  selectedMonth,
  onMonthChange,
  projectFilters = [],
  availableProjects = [],
  onProjectFilterChange = () => {},
}) => {
  const months = [
    { value: 'current', label: 'This Month' },
    { value: 'previous', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleProjectFilterChange = (project: string) => {
    if (projectFilters.includes(project)) {
      onProjectFilterChange(projectFilters.filter(p => p !== project));
    } else {
      onProjectFilterChange([...projectFilters, project]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={selectedMonth}
        onValueChange={onMonthChange}
      >
        <SelectTrigger className="w-[180px] bg-white border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <SelectValue placeholder="Select time period" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {months.map(month => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {availableProjects.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="border-gray-300">
              <Filter className="h-4 w-4 mr-1" />
              Filter Projects
              {projectFilters.length > 0 && (
                <span className="ml-1 bg-primary text-white rounded-full px-1.5 py-0.5 text-xs">
                  {projectFilters.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Show projects</h4>
              <div className="space-y-2">
                {availableProjects.map(project => (
                  <div key={project} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${project}`}
                      checked={projectFilters.includes(project)}
                      onCheckedChange={() => handleProjectFilterChange(project)}
                    />
                    <Label htmlFor={`filter-${project}`}>{project}</Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onProjectFilterChange([])}
                >
                  Clear
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onProjectFilterChange(availableProjects)}
                >
                  Select All
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        className="text-primary border-primary hover:bg-primary/10"
        onClick={onAddProject}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add project
      </Button>
      
      {onManageProjects && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-gray-700 border-gray-300 hover:bg-gray-100"
          onClick={onManageProjects}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Manage projects
        </Button>
      )}
    </div>
  );
};

export default ProjectFilters;
