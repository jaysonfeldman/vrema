
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

interface ProjectFiltersProps {
  onAddProject: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ onAddProject }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-500"
        onClick={onAddProject}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add project
      </Button>
      
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
