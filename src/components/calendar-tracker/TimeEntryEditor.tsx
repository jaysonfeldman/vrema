import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { useActivityColor } from '@/components/ActivityBar';
import { COLOR_PALETTE } from '@/lib/activityColors';
import { cn } from '@/lib/utils';
import { formatCompactTime } from '@/lib/timeEntryUtils';
import { sound } from '@/lib/sounds';
import type { TimeEntry } from '@/lib/types';

export type TimeEntryDraft = {
  id?: string;
  title: string;
  description?: string;
  projectName: string;
  activityType: string;
  color?: string;
  startTime: string;
  endTime: string;
  memberId: string;
};

type Props = {
  draft: TimeEntryDraft;
  onChange: (patch: Partial<TimeEntryDraft>) => void;
  onDelete?: () => void;
  isEditing?: boolean;
};

export function TimeEntryEditor({ draft, onChange, onDelete, isEditing }: Props) {
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
  const eventColor = draft.color || (draft.activityType ? getColor(draft.activityType) : '#94A3B8');

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
    sound.click();
  };

  return (
    <div className="w-[min(100vw-2rem,19.5rem)] space-y-4">
      <div className="space-y-1.5">
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {formatCompactTime(start)} – {formatCompactTime(end)}
          <span className="mx-1 text-foreground/15">·</span>
          {format(start, 'EEE d MMM')}
        </p>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="size-5 shrink-0 rounded-[4px] ring-1 ring-black/10 transition-transform hover:scale-105 dark:ring-white/15"
                style={{ backgroundColor: eventColor }}
                title="Event color"
                onClick={() => sound.pop()}
              />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48 overflow-hidden rounded-xl p-2.5">
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">Event color</p>
              <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PALETTE.map((swatch) => {
                  const selected = eventColor.toLowerCase() === swatch.toLowerCase();
                  return (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => {
                        sound.click();
                        onChange({ color: swatch });
                      }}
                      className={cn(
                        'relative flex size-6 items-center justify-center rounded-[4px] transition-transform hover:scale-105',
                        selected && 'ring-2 ring-foreground ring-offset-1'
                      )}
                      style={{ backgroundColor: swatch }}
                    >
                      {selected && (
                        <Check className="size-3 text-neutral-900" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          {/* Native input avoids shared Input focus-ring / radius artifacts */}
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Event title"
            className="h-9 min-w-0 flex-1 rounded-lg border-0 bg-[#f6f6f6] px-2.5 text-sm font-normal text-foreground/80 outline-none placeholder:text-muted-foreground/60 focus:bg-[#f0f0f0] dark:bg-white/[0.06] dark:focus:bg-white/[0.09]"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">Project</p>
        <div className="flex flex-wrap gap-1.5">
          {projectNames.map((name) => {
            const active = draft.projectName.toLowerCase() === name.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  sound.click();
                  onChange({ projectName: name });
                }}
                className={cn(
                  'rounded-md px-2 py-1 text-xs transition-colors',
                  active
                    ? 'bg-foreground font-medium text-background'
                    : 'bg-[#f6f6f6] font-normal text-muted-foreground hover:text-foreground dark:bg-white/[0.06]'
                )}
              >
                {name}
              </button>
            );
          })}

          {addingProject ? (
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
                sound.click();
                setAddingProject(true);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#d4d4d4] bg-transparent px-2 py-1 text-xs font-normal text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground dark:border-white/15"
            >
              <Plus className="size-3" />
              Add project
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">Activity</p>
        <div className="flex flex-wrap gap-1.5">
          {activities.map((type) => {
            const color = getColor(type);
            const active = draft.activityType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  sound.click();
                  onChange({ activityType: type, color });
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs capitalize transition-colors',
                  active
                    ? 'bg-white font-medium shadow-sm ring-1 ring-black/5 dark:bg-white/[0.1] dark:ring-white/10'
                    : 'bg-[#f6f6f6] font-normal text-muted-foreground hover:text-foreground dark:bg-white/[0.04]'
                )}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {isEditing && onDelete && (
        <div className="flex justify-start">
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
    color: entry.color,
    startTime: entry.startTime,
    endTime: entry.endTime,
    memberId: entry.memberId,
  };
}
