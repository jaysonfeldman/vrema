
import React from 'react';
import { Project } from '@/lib/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  editedProject: Project;
  setEditedProject: (project: Project) => void;
  onSave: () => void;
}

const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  onOpenChange,
  project,
  editedProject,
  setEditedProject,
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Name
            </Label>
            <Input
              id="project-name"
              value={editedProject.name}
              onChange={(e) => setEditedProject({...editedProject, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget-hours" className="text-right">
              Budget (hours)
            </Label>
            <Input
              id="budget-hours"
              type="number"
              value={editedProject.budgetHours || 0}
              onChange={(e) => setEditedProject({
                ...editedProject, 
                budgetHours: parseFloat(e.target.value) || undefined
              })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hourly-rate" className="text-right">
              Rate (€/hour)
            </Label>
            <Input
              id="hourly-rate"
              type="number"
              value={editedProject.hourlyRate || 0}
              onChange={(e) => setEditedProject({
                ...editedProject, 
                hourlyRate: parseFloat(e.target.value) || undefined
              })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
