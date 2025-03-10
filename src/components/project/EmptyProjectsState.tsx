
import React from 'react';

interface EmptyProjectsStateProps {
  onAddProject: () => void;
}

const EmptyProjectsState: React.FC<EmptyProjectsStateProps> = ({ onAddProject }) => {
  return (
    <div className="bg-muted/50 rounded-lg border border-border p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No projects available</h3>
      <p className="text-muted-foreground mb-4">
        Get started by creating your first project or connect to Google Calendar.
      </p>
      <button 
        onClick={onAddProject}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
      >
        Create Your First Project
      </button>
    </div>
  );
};

export default EmptyProjectsState;
