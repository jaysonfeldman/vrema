import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatHours } from '@/lib/eventStats';
import ActivityBar from '@/components/ActivityBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SettingsIcon } from '@/components/icons/settings';
import { WithTooltip } from '@/components/ui/tooltip';
import { sound } from '@/lib/sounds';
import { useAppPath } from '@/lib/app-paths';

interface ProjectCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
  onUpdateProject?: (updatedProject: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, className, style, onUpdateProject }) => {
  const navigate = useNavigate();
  const appPath = useAppPath();
  const filterLabel = project.filterTerm?.trim();
  const showFilterBadge =
    !!filterLabel && filterLabel.toLowerCase() !== project.name.toLowerCase();

  return (
    <motion.div
      className={cn(
        'border-gradient-inner group relative flex h-full flex-col justify-between gap-4 rounded-2xl bg-gradient-to-b from-[#FAFAFA] to-[#F4F4F5] p-4 dark:from-[#2a2e2f] dark:to-[#222627]',
        className
      )}
      style={style}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <WithTooltip content="Project settings" side="left">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            sound.pop();
            onUpdateProject?.(project);
          }}
        >
          <SettingsIcon size={14} />
          <span className="sr-only">Project settings</span>
        </Button>
      </WithTooltip>

      <button
        type="button"
        onClick={() => {
          sound.click();
          navigate(appPath(`/projects/${project.id}`));
        }}
        className="min-w-0 text-left"
      >
        <div className="flex min-w-0 items-center gap-2 pr-8">
          <h3 className="truncate text-sm font-medium">{project.name}</h3>
          {showFilterBadge && (
            <Badge variant="secondary" className="shrink-0 text-xs font-normal">
              {filterLabel}
            </Badge>
          )}
        </div>
        <p className="mt-1.5 font-mono text-base font-semibold tabular-nums">
          {formatHours(project.totalHours)}
        </p>
      </button>

      <ActivityBar activities={project.activities} />
    </motion.div>
  );
};

export default ProjectCard;
