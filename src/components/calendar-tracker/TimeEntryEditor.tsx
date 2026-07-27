import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { useActivityColor } from '@/components/ActivityBar';
import { cn } from '@/lib/utils';
import { formatCompactTime } from '@/lib/timeEntryUtils';
import type { TimeEntry } from '@/lib/types';

export type TimeEntryDraft = {
  id?: string;
  title: string;
  description?: string;
  projectName: string;
  activityType: string;
  startTime: string;
  endTime: string;
  memberId: string;
};

type Props = {
  draft: TimeEntryDraft;
  onChange: (patch: Partial<TimeEntryDraft>) => void;
  onDelete?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  isEditing?: boolean;
  /** Google-synced events are view-only in the calendar. */
  readOnly?: boolean;
  /** Highlight missing required fields after an explicit Save attempt. */
  showRequiredErrors?: boolean;
};

export function isDraftComplete(draft: Pick<TimeEntryDraft, 'projectName' | 'activityType'>) {
  return Boolean(draft.projectName.trim() && draft.activityType.trim());
}

export function TimeEntryEditor({
  draft,
  onChange,
  onDelete,
  onSave,
  onDiscard,
  isEditing,
  readOnly,
  showRequiredErrors,
}: Props) {
  const { activityColors, ensureActivityColors, managedProjects, addManagedProject } = useSharedState();
  const { allProjects } = useProjectStats();
  const getColor = useActivityColor();
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState('');

  const projectNames = useMemo(() => {
    const names = new Map<string, string>();
    managedProjects.forEach((p) => names.set(p.toLowerCase(), p));
    allProjects.forEach((p) => {
      if (!names.has(p.name.toLowerCase())) names.set(p.name.toLowerCase(), p.name);
    });
    if (draft.projectName.trim()) {
      names.set(draft.projectName.toLowerCase(), draft.projectName.trim());
    }
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
  }, [managedProjects, allProjects, draft.projectName]);

  const activities = useMemo(
    () => activityColors.map((a) => a.type).sort((a, b) => a.localeCompare(b)),
    [activityColors]
  );

  useEffect(() => {
    if (activities.length === 0) {
      ensureActivityColors(['design', 'dev', 'meetings', 'marketing', 'admin', 'other']);
    }
  }, [activities.length, ensureActivityColors]);

  const start = new Date(draft.startTime);
  const end = new Date(draft.endTime);
  const eventColor = draft.activityType ? getColor(draft.activityType) : '#94A3B8';
  const missingProject = !draft.projectName.trim();
  const missingActivity = !draft.activityType.trim();
  const showProjectError = Boolean(showRequiredErrors && missingProject);
  const showActivityError = Boolean(showRequiredErrors && missingActivity);
  const canSave = isDraftComplete(draft);

  const commitNewProject = () => {
    const name = newProject.trim();
    if (!name) {
      setAddingProject(false);
      return;
    }
    addManagedProject(name);
    onChange({ projectName: name });
    setNewProject('');
    setAddingProject(false);
  };

  return (
    <div
      className={cn(
        'w-[min(100vw-2rem,19.5rem)] space-y-4',
        showRequiredErrors && !canSave && 'animate-shake'
      )}
    >
      <div className="space-y-1.5">
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {formatCompactTime(start)} – {formatCompactTime(end)}
          <span className="mx-1 text-foreground/15">·</span>
          {format(start, 'EEE d MMM')}
        </p>
        {readOnly && (
          <p className="text-[11px] text-muted-foreground">From Google Calendar · sync to update</p>
        )}
        <div className="flex items-center gap-2">
          <input
            autoFocus={!readOnly}
            readOnly={readOnly}
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Event title (optional)"
            className={cn(
              'h-9 min-w-0 w-full rounded-lg border-0 bg-[#f6f6f6] px-2.5 text-sm font-normal text-foreground/80 outline-none placeholder:text-muted-foreground/60 dark:bg-white/[0.06]',
              readOnly ? 'cursor-default' : 'focus:bg-[#f0f0f0] dark:focus:bg-white/[0.09]'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Enter' && !readOnly && onSave) {
                e.preventDefault();
                onSave();
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'text-[11px] font-medium',
              showProjectError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            Project <span className="text-destructive/80">*</span>
          </p>
          {showProjectError && (
            <p className="text-[10px] font-medium text-destructive">Required</p>
          )}
        </div>
        <div
          className={cn(
            'flex flex-wrap gap-1.5 rounded-lg transition-shadow',
            showProjectError && 'ring-2 ring-destructive/35 ring-offset-2 ring-offset-white dark:ring-offset-elevated'
          )}
        >
          {projectNames.map((name) => {
            const active = draft.projectName.toLowerCase() === name.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (readOnly) return;
                  onChange({ projectName: name });
                }}
                className={cn(
                  'rounded-md px-2 py-1 text-xs transition-colors',
                  active
                    ? 'bg-foreground font-medium text-background'
                    : 'bg-[#f6f6f6] font-normal text-muted-foreground dark:bg-white/[0.06]',
                  !readOnly && !active && 'hover:text-foreground',
                  readOnly && 'cursor-default'
                )}
              >
                {name}
              </button>
            );
          })}

          {!readOnly &&
            (addingProject ? (
              <Input
                autoFocus
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="Project name"
                className="h-7 w-28 rounded-md border border-[#ebebeb] bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-foreground/10 dark:border-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitNewProject();
                  }
                  if (e.key === 'Escape') {
                    setAddingProject(false);
                    setNewProject('');
                  }
                }}
                onBlur={commitNewProject}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddingProject(true);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#d4d4d4] bg-transparent px-2 py-1 text-xs font-normal text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground dark:border-white/15"
              >
                <Plus className="size-3" />
                Add project
              </button>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              'text-[11px] font-medium',
              showActivityError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            Activity <span className="text-destructive/80">*</span>
          </p>
          {showActivityError && (
            <p className="text-[10px] font-medium text-destructive">Required</p>
          )}
        </div>
        <div
          className={cn(
            'flex flex-wrap gap-1.5 rounded-lg transition-shadow',
            showActivityError && 'ring-2 ring-destructive/35 ring-offset-2 ring-offset-white dark:ring-offset-elevated'
          )}
        >
          {activities.map((type) => {
            const color = getColor(type);
            const active = draft.activityType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (readOnly) return;
                  onChange({ activityType: type });
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs capitalize transition-colors',
                  active
                    ? 'bg-white font-medium shadow-sm ring-1 ring-black/5 dark:bg-white/[0.1] dark:ring-white/10'
                    : 'bg-[#f6f6f6] font-normal text-muted-foreground dark:bg-white/[0.04]',
                  !readOnly && !active && 'hover:text-foreground',
                  readOnly && 'cursor-default'
                )}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </button>
            );
          })}
          {readOnly &&
            draft.activityType &&
            !activities.some((t) => t.toLowerCase() === draft.activityType.toLowerCase()) && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-medium capitalize shadow-sm ring-1 ring-black/5 dark:bg-white/[0.1] dark:ring-white/10">
                <span className="size-2 rounded-full" style={{ backgroundColor: eventColor }} />
                {draft.activityType}
              </span>
            )}
        </div>
      </div>

      {!readOnly && (
        <div className="space-y-2 pt-0.5">
          {showRequiredErrors && !canSave && (
            <p className="text-[11px] font-medium text-destructive">
              Pick a project and activity to save
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            ) : onDiscard ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={onDiscard}
              >
                Discard
              </Button>
            ) : (
              <span />
            )}
            {onSave && (
              <Button type="button" size="sm" className="h-8 px-3" onClick={() => onSave()}>
                Save
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function entryToDraft(entry: TimeEntry): TimeEntryDraft {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    projectName: entry.projectName,
    activityType: entry.activityType,
    startTime: entry.startTime,
    endTime: entry.endTime,
    memberId: entry.memberId,
  };
}
