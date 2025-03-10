
import React, { useState } from 'react';
import { Project, Activity } from '@/lib/types';
import { formatTime, getActivityColor } from '@/lib/mock-data';
import ActivityTag from './ActivityTag';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash, Settings, Palette, Eye } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  onUpdateProject?: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className, 
  style,
  onUpdateProject,
  onDeleteProject
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>({...project});
  const [activityColors, setActivityColors] = useState<Record<string, string>>({});
  
  // Is the project over budget?
  const isOverBudget = project.budgetHours && project.totalHours > project.budgetHours;
  
  // Format budget info
  const getBudgetText = () => {
    if (!project.budgetHours) return null;
    
    const diff = Math.abs(project.budgetHours - project.totalHours);
    const formattedDiff = formatTime(diff);
    
    if (isOverBudget) {
      return `-${formattedDiff}`;
    } else {
      return `${formattedDiff}`;
    }
  };
  
  const budgetText = getBudgetText();
  
  // Get project tag (if any)
  const getProjectTag = () => {
    // Use a simpler approach to generate a tag from the first word or acronym
    const name = project.name.trim();
    
    if (!name) return null;
    
    // Get first two characters of the project name for a tag
    if (name.length <= 3) return name.toUpperCase();
    
    // Check if it's an acronym (all caps)
    if (name === name.toUpperCase() && name.length <= 5) return name;
    
    // Otherwise, get first 2-3 characters
    return name.substring(0, 3).toUpperCase();
  };
  
  const projectTag = getProjectTag();

  const handleSaveChanges = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setShowEditDialog(false);
  };

  const handleDeleteProject = () => {
    if (onDeleteProject) {
      onDeleteProject(project.id);
    }
  };

  const handleActivityVisibilityChange = (activityId: string, isVisible: boolean) => {
    const updatedActivities = editedProject.activities.map(activity => {
      if (activity.id === activityId) {
        return { ...activity, hidden: !isVisible };
      }
      return activity;
    });

    setEditedProject({
      ...editedProject,
      activities: updatedActivities
    });
  };

  const handleSaveSettings = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setShowSettingsDialog(false);
  };

  return (
    <>
      <div 
        className={cn(
          'rounded-lg overflow-hidden bg-zinc-900 text-white animate-fade-in',
          className
        )}
        style={{
          ...style,
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                {projectTag && (
                  <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700 text-xs">
                    {projectTag}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {project.teamMembers.length > 0 && (
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 3).map((member, index) => (
                    <div 
                      key={member.id} 
                      className="w-8 h-8 rounded-full border-2 border-zinc-800 overflow-hidden"
                      style={{ zIndex: project.teamMembers.length - index }}
                    >
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {project.teamMembers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs border-2 border-zinc-800">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Project Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteProject} className="text-red-500">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Time logged</p>
              <p className="font-mono font-bold text-2xl">{formatTime(project.totalHours)}</p>
              <p className="text-xs text-gray-500 mt-1">in total</p>
            </div>
            
            {project.budgetHours && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Budget left</p>
                <p className={cn(
                  "font-mono font-bold text-2xl",
                  isOverBudget ? "text-red-500" : "text-amber-500"
                )}>
                  {budgetText}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {project.monthlyHours ? "/this month" : "in total"}
                </p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Activities</p>
            <div className="flex flex-wrap gap-2">
              {project.activities
                .filter(activity => !activity.hidden)
                .slice(0, 3)
                .map((activity) => (
                  <ActivityTag
                    key={activity.id}
                    type={activity.type}
                    hours={activity.hours}
                    color={getActivityColor(activity.type)}
                  />
              ))}
              {project.activities.length > 3 && (
                <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700">
                  +{project.activities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
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
                        onCheckedChange={(checked) => handleActivityVisibilityChange(activity.id, checked)}
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
            <Button type="button" onClick={handleSaveSettings}>
              Save settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
