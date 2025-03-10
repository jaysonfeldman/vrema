
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProjectName?: string;
  onProjectNameChange?: (value: string) => void;
  newProjectFilter?: string;
  onProjectFilterChange?: (value: string) => void;
  onAddProject?: () => void;
  onAddManualProject?: () => void;
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  newProjectName: externalProjectName,
  onProjectNameChange: externalProjectNameChange,
  newProjectFilter: externalProjectFilter,
  onProjectFilterChange: externalProjectFilterChange,
  onAddProject,
  onAddManualProject
}) => {
  // Local state to make the component work without all props
  const [localProjectName, setLocalProjectName] = useState('');
  const [localProjectFilter, setLocalProjectFilter] = useState('');
  
  // Use external state if provided, otherwise use local state
  const projectName = externalProjectName !== undefined ? externalProjectName : localProjectName;
  const projectFilter = externalProjectFilter !== undefined ? externalProjectFilter : localProjectFilter;
  
  const handleProjectNameChange = (value: string) => {
    if (externalProjectNameChange) {
      externalProjectNameChange(value);
    } else {
      setLocalProjectName(value);
    }
  };
  
  const handleProjectFilterChange = (value: string) => {
    if (externalProjectFilterChange) {
      externalProjectFilterChange(value);
    } else {
      setLocalProjectFilter(value);
    }
  };
  
  const handleAddProject = () => {
    if (onAddProject) {
      onAddProject();
    } else {
      console.log('Add project with filter', projectName, projectFilter);
      onOpenChange(false);
    }
  };
  
  const handleAddManualProject = () => {
    if (onAddManualProject) {
      onAddManualProject();
    } else {
      console.log('Add manual project', projectName);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => handleProjectNameChange(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Marketing Project"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-filter" className="text-right">
              Filter Term (Optional)
            </Label>
            <Input
              id="project-filter"
              value={projectFilter}
              onChange={(e) => handleProjectFilterChange(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Marketing"
            />
          </div>
          <p className="text-xs text-muted-foreground col-start-2 col-span-3">
            If provided, this will create a view of all events with titles containing this text
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          {projectFilter ? (
            <Button 
              type="button" 
              onClick={handleAddProject}
              disabled={!projectName}
            >
              Create Calendar Project
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleAddManualProject}
              disabled={!projectName}
            >
              Create Manual Project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
