
import React, { useState } from 'react';
import { Project } from '@/lib/types';
import { formatTime } from '@/lib/mock-data';
import ActivityTag from './ActivityTag';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
  const [editedProject, setEditedProject] = useState<Project>({...project});
  
  // Is the project over budget?
  const isOverBudget = project.budgetHours && project.totalHours > project.budgetHours;
  
  // Format budget info
  const getBudgetInfo = () => {
    if (!project.budgetHours) return null;
    
    const diff = Math.abs(project.budgetHours - project.totalHours);
    const formattedDiff = formatTime(diff);
    
    if (isOverBudget) {
      return { 
        text: `-${formattedDiff}`,
        color: 'text-red-500'
      };
    } else {
      return { 
        text: `${formattedDiff}`,
        color: 'text-amber-500'
      };
    }
  };
  
  const budgetInfo = getBudgetInfo();
  
  // Get project tag (if any)
  const getProjectTag = () => {
    // This would be expanded in a real app
    const tagMap: Record<string, string> = {
      'umc': 'UMC',
      'web': 'Web',
      'design': 'Design',
      'marketing': 'MKT'
    };
    
    // Look for a match in the project name (simplified approach)
    const nameWords = project.name.toLowerCase().split(' ');
    for (const word of nameWords) {
      if (tagMap[word]) {
        return tagMap[word];
      }
    }
    return null;
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

  return (
    <>
      <div 
        className={cn(
          'rounded-lg overflow-hidden animate-fade-in',
          className
        )}
        style={{
          ...style,
          borderLeft: project.color ? `4px solid ${project.color}` : undefined
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                {projectTag && (
                  <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700">
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
                      className="w-8 h-8 rounded-full border-2 border-gray-800 overflow-hidden"
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
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs border-2 border-gray-800">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteProject} className="text-red-500">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Time logged</p>
              <p className="font-bold text-2xl">{formatTime(project.totalHours)}</p>
              <p className="text-xs text-gray-500 mt-1">in total</p>
            </div>
            
            {project.budgetHours && (
              <div>
                <p className="text-sm text-gray-400 mb-1">Budget left</p>
                <p className={cn(
                  "font-bold text-2xl",
                  isOverBudget ? "text-red-500" : ""
                )}>
                  {isOverBudget ? `-${formatTime(Math.abs(project.budgetHours - project.totalHours))}` : 
                    formatTime(project.budgetHours - project.totalHours)}
                </p>
                <p className="text-xs text-gray-500 mt-1">in total</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Activities</p>
            <div className="flex flex-wrap gap-2">
              {project.activities.map((activity) => (
                <ActivityTag
                  key={activity.id}
                  type={activity.type}
                  hours={activity.hours}
                />
              ))}
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
    </>
  );
};

export default ProjectCard;
