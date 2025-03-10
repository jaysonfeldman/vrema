
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
  existingProjects?: string[]; // Add this prop to check for duplicate projects
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  newProjectName: externalProjectName,
  onProjectNameChange: externalProjectNameChange,
  newProjectFilter: externalProjectFilter,
  onProjectFilterChange: externalProjectFilterChange,
  onAddProject,
  onAddManualProject,
  existingProjects = []
}) => {
  // Local state to make the component work without all props
  const [localProjectName, setLocalProjectName] = useState('');
  const [localProjectFilter, setLocalProjectFilter] = useState('');
  const [nameError, setNameError] = useState('');
  
  // Use external state if provided, otherwise use local state
  const projectName = externalProjectName !== undefined ? externalProjectName : localProjectName;
  const projectFilter = externalProjectFilter !== undefined ? externalProjectFilter : localProjectFilter;
  
  const handleProjectNameChange = (value: string) => {
    // Check for duplicate project names (case-insensitive)
    setNameError('');
    
    if (value.trim()) {
      const normalizedName = value.trim().toLowerCase();
      const isDuplicate = existingProjects.some(
        existing => existing.toLowerCase() === normalizedName
      );
      
      if (isDuplicate) {
        setNameError('A project with this name already exists');
      }
    }
    
    if (externalProjectNameChange) {
      externalProjectNameChange(value);
    } else {
      setLocalProjectName(value);
    }
  };
  
  const handleProjectFilterChange = (value: string) => {
    // For case-insensitivity, we store filter term in original case but normalize when used for comparison
    if (externalProjectFilterChange) {
      externalProjectFilterChange(value);
    } else {
      setLocalProjectFilter(value);
    }
  };
  
  const handleAddProject = () => {
    if (nameError) return;
    
    if (onAddProject) {
      onAddProject();
    } else {
      console.log('Add project with filter', projectName, projectFilter);
      onOpenChange(false);
    }
  };
  
  const handleAddManualProject = () => {
    if (nameError) return;
    
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
            <div className="col-span-3 space-y-1">
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                className={nameError ? "border-red-500" : ""}
                placeholder="e.g., Marketing Project"
              />
              {nameError && (
                <p className="text-xs text-red-500">{nameError}</p>
              )}
            </div>
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
              disabled={!projectName || !!nameError}
            >
              Create Calendar Project
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleAddManualProject}
              disabled={!projectName || !!nameError}
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
