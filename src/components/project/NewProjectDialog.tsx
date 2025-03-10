
import React from 'react';
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
  newProjectName: string;
  onProjectNameChange: (value: string) => void;
  newProjectFilter: string;
  onProjectFilterChange: (value: string) => void;
  onAddProject: () => void;
  onAddManualProject: () => void;
}

const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  newProjectName,
  onProjectNameChange,
  newProjectFilter,
  onProjectFilterChange,
  onAddProject,
  onAddManualProject
}) => {
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
              value={newProjectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
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
              value={newProjectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value)}
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
          {newProjectFilter ? (
            <Button 
              type="button" 
              onClick={onAddProject}
              disabled={!newProjectName}
            >
              Create Calendar Project
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={onAddManualProject}
              disabled={!newProjectName}
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
