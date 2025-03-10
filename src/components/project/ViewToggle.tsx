
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, LayoutList } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex items-center rounded-md border bg-white p-1 ml-2">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onViewChange('grid')}
      >
        <Grid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onViewChange('list')}
      >
        <LayoutList className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
};

export default ViewToggle;
