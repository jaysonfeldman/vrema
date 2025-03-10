
import React from 'react';
import { Input } from '@/components/ui/input';

interface ProjectSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="w-full max-w-sm">
      <Input
        type="search"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-white"
      />
    </div>
  );
};

export default ProjectSearch;
