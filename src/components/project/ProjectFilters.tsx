
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Edit3 } from 'lucide-react';

interface ProjectFiltersProps {
  onAddProject: () => void;
  onManageProjects?: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ onAddProject, onManageProjects }) => {
  return (
    <div className="flex items-center gap-2">
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
      
      <Button 
        variant="ghost" 
        size="sm"
        className="gap-1"
      >
        <Filter className="h-4 w-4" />
        All projects
      </Button>
    </div>
  );
};

export default ProjectFilters;
