
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Project } from '@/lib/types';
import { stringToColor } from '@/lib/utils';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import ProjectSettingsDialog from './project/ProjectSettingsDialog';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className, 
  style,
  onUpdateProject,
  onDeleteProject
}) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    console.log(`Rendering ProjectCard for ${project.name} (ID: ${project.id})`);
  }, [project]);

  const handleSaveSettings = (updatedProject: Project) => {
    onUpdateProject(updatedProject);
    setShowSettings(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-card-action')) {
      return;
    }
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      className={cn("relative overflow-hidden flex flex-col pb-4", className)} 
      style={style}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <div className="flex-1">
          <CardTitle>{project.name}</CardTitle>
          {!!project.budgetHours && (
            <CardDescription className="text-xs mt-1">
              Budget: {project.budgetHours} hours
            </CardDescription>
          )}
        </div>
        <div className="project-card-action">
          <ProjectCardMenu 
            project={project} 
            onEdit={() => setShowSettings(true)} 
            onDelete={() => onDeleteProject(project.id)} 
          />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="text-sm font-medium leading-none">Total Hours: {project.totalHours?.toFixed(1) || '0'}</div>
        <div className="flex items-center">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2">
            <circle cx="8" cy="8" r="8" fill={stringToColor(project.name)} />
          </svg>
          <span className="text-sm text-muted-foreground">
            {project.filterTerm}
          </span>
        </div>
      </CardContent>
      
      {showSettings && (
        <div className="project-card-action">
          <ProjectSettingsDialog 
            project={project}
            open={showSettings}
            onOpenChange={setShowSettings}
            onSave={handleSaveSettings}
          />
        </div>
      )}
    </Card>
  );
};

interface ProjectCardMenuProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCardMenu: React.FC<ProjectCardMenuProps> = ({ project, onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-md hover:bg-secondary">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Project</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectCard;
