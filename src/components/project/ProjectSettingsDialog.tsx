import React from 'react';
import { Project } from '@/lib/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProject: Project) => void;
}

export default function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  onSave,
}: ProjectSettingsDialogProps) {
  const [name, setName] = React.useState(project.name || '');
  const [hourlyRate, setHourlyRate] = React.useState(project.hourlyRate?.toString() || '');
  const [budgetHours, setBudgetHours] = React.useState(project.budgetHours?.toString() || '');
  const [filterTerm, setFilterTerm] = React.useState(project.filterTerm || '');

  const handleSave = () => {
    const updatedProject = {
      ...project,
      name: name.trim(),
      hourlyRate: parseFloat(hourlyRate) || 0,
      budgetHours: parseFloat(budgetHours) || 0,
      filterTerm: filterTerm,
    };
    onSave(updatedProject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budgetHours">Monthly Budget Hours</Label>
            <Input
              id="budgetHours"
              type="number"
              value={budgetHours}
              onChange={(e) => setBudgetHours(e.target.value)}
              placeholder="Enter monthly budget hours"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="filterTerm">Filter Term</Label>
            <Input
              id="filterTerm"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Enter filter term for calendar events"
            />
            <p className="text-sm text-muted-foreground">
              This term is used to filter calendar events for this project
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
