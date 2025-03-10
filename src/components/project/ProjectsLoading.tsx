
import React from 'react';
import { Loader2 } from 'lucide-react';

const ProjectsLoading: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="text-muted-foreground">Loading projects and synchronizing calendar data...</span>
    </div>
  );
};

export default ProjectsLoading;
