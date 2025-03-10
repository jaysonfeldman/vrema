
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Edit3, Calendar } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ProjectFiltersProps {
  onAddProject: () => void;
  onManageProjects?: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ 
  onAddProject, 
  onManageProjects,
  selectedMonth,
  onMonthChange
}) => {
  const months = [
    { value: 'current', label: 'This Month' },
    { value: 'previous', label: 'Last Month' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="flex items-center gap-2">
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
