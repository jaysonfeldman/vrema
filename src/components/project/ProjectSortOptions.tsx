
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface ProjectSortOptionsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const ProjectSortOptions: React.FC<ProjectSortOptionsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center ml-2">
      <span className="text-sm mr-2">Sort by</span>
      <Select
        value={sortBy}
        onValueChange={onSortChange}
      >
        <SelectTrigger className="w-[180px] border-none bg-transparent p-0">
          <div className="flex items-center gap-1">
            <span className="font-medium">
              {sortBy === 'most-tracked' ? 'Most tracked hours' : 
               sortBy === 'least-tracked' ? 'Least tracked hours' : 
               'Alphabetical'}
            </span>
            <ChevronDown size={16} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="most-tracked">Most tracked hours</SelectItem>
          <SelectItem value="least-tracked">Least tracked hours</SelectItem>
          <SelectItem value="alphabetical">Alphabetical</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSortOptions;
