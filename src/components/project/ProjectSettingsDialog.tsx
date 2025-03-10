
import React from 'react';
import { Project, Activity } from '@/lib/types';
import { getActivityColor, formatTime } from '@/lib/mock-data';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  editedProject: Project;
  setEditedProject: (project: Project) => void;
  onActivityVisibilityChange: (activityId: string, isVisible: boolean) => void;
  onSave: () => void;
}

const ProjectSettingsDialog: React.FC<ProjectSettingsDialogProps> = ({
  open,
  onOpenChange,
  project,
  editedProject,
  setEditedProject,
  onActivityVisibilityChange,
  onSave
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="activities">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="space-y-4 mt-4">
            <h3 className="text-sm font-medium">Activity Visibility & Colors</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {editedProject.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getActivityColor(activity.type) }}
                    />
                    <span className="font-medium">{activity.type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{formatTime(activity.hours)}</span>
                    <Switch 
                      checked={!activity.hidden} 
                      onCheckedChange={(checked) => onActivityVisibilityChange(activity.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filter-term" className="text-right">
                  Filter Term
                </Label>
                <Input
                  id="filter-term"
                  value={editedProject.filterTerm || ""}
                  onChange={(e) => setEditedProject({
                    ...editedProject, 
                    filterTerm: e.target.value
                  })}
                  className="col-span-3"
                  placeholder="e.g., Marketing"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget-hours-setting" className="text-right">
                  Budget (hours)
                </Label>
                <Input
                  id="budget-hours-setting"
                  type="number"
                  value={editedProject.budgetHours || 0}
                  onChange={(e) => setEditedProject({
                    ...editedProject, 
                    budgetHours: parseFloat(e.target.value) || undefined
                  })}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave}>
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettingsDialog;
