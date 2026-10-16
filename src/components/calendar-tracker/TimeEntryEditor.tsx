import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { addMinutes, differenceInMinutes, format } from 'date-fns';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { useActivityColor } from '@/components/ActivityBar';
import { cn } from '@/lib/utils';
import {
  SNAP_MINUTES,
  dateFromDayAndMinutes,
  formatCompactDuration,
  formatCompactDurationFromMinutes,
  formatCompactTime,
  minutesFromMidnight,
} from '@/lib/timeEntryUtils';
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
  isSaving?: boolean;
  /** Google-synced events are view-only in the calendar. */
  readOnly?: boolean;
  /** Highlight missing required fields after an explicit Save attempt. */
  showRequiredErrors?: boolean;
};

const TIME_SLOTS = Array.from({ length: (24 * 60) / SNAP_MINUTES }, (_, i) => i * SNAP_MINUTES);

const PICKER_ATTR = { 'data-entry-picker': '' } as const;

export function isDraftComplete(draft: Pick<TimeEntryDraft, 'projectName' | 'activityType'>) {
  return Boolean(draft.projectName.trim() && draft.activityType.trim());
}

function applyMinutesOnDay(day: Date, minutes: number) {
  return dateFromDayAndMinutes(day, Math.max(0, Math.min(24 * 60 - SNAP_MINUTES, minutes)));
}

type PickerField = 'start' | 'end' | 'date';

function useAnchoredPanel(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelWidth: number,
  panelHeight: number
) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setCoords(null);
      return;
    }

    const place = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const gap = 8;
      let left = rect.left - panelWidth - gap;
      if (left < 8) left = Math.min(rect.right + gap, window.innerWidth - panelWidth - 8);
      let top = rect.top;
      if (top + panelHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - panelHeight - 8);
      }
      if (top < 8) top = 8;
      setCoords({ top, left });
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, triggerRef, panelWidth, panelHeight]);

  return coords;
}

function TimeSlotPicker({
  field,
  label,
  valueMinutes,
  startMinutes,
  open,
  onOpenChange,
  onSelect,
  disabled,
}: {
  field: 'start' | 'end';
  label: string;
  valueMinutes: number;
  startMinutes: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (minutes: number) => void;
  disabled?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const showDuration = field === 'end';
  const panelWidth = showDuration ? 140 : 104;
  const panelHeight = Math.min(288, typeof window !== 'undefined' ? window.innerHeight * 0.5 : 288);
  const coords = useAnchoredPanel(open, triggerRef, panelWidth, panelHeight);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-entry-picker]') || triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      selectedRef.current?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [open, valueMinutes]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          onOpenChange(!open);
        }}
        className={cn(
          'rounded-md border border-transparent px-1.5 py-0.5 font-medium tabular-nums transition-colors',
          disabled
            ? 'cursor-default'
            : 'hover:border-[#e5e5e5] hover:bg-[#f6f6f6] dark:hover:border-white/10 dark:hover:bg-white/[0.08]',
          open && 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300'
        )}
      >
        {label}
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            {...PICKER_ATTR}
            role="listbox"
            className={cn(
              'fixed z-[200] overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-1.5 text-white shadow-elevated',
              showDuration ? 'w-[8.75rem]' : 'w-[6.5rem]'
            )}
            style={{ top: coords.top, left: coords.left }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ScrollArea className={cn('h-[min(18rem,50vh)]', showDuration ? 'w-[8.25rem]' : 'w-[6rem]')}>
              <div className="flex flex-col gap-0.5 pr-2">
                {TIME_SLOTS.map((minutes) => {
                  const active = minutes === valueMinutes;
                  const durationMins = minutes - startMinutes;
                  const durationLabel =
                    showDuration && durationMins > 0
                      ? formatCompactDurationFromMinutes(durationMins)
                      : null;

                  return (
                    <button
                      key={minutes}
                      ref={active ? selectedRef : undefined}
                      type="button"
                      role="option"
                      aria-selected={active}
                      {...PICKER_ATTR}
                      onClick={() => {
                        onSelect(minutes);
                        onOpenChange(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[13px] tabular-nums transition-colors',
                        active
                          ? 'bg-white/15 font-medium text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <span>
                        {formatCompactTime(dateFromDayAndMinutes(new Date(2000, 0, 1), minutes))}
                      </span>
                      {durationLabel && (
                        <span className="text-[11px] text-white/45">{durationLabel}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>,
          document.body
        )}
    </>
  );
}

function DateDayPicker({
  label,
  value,
  open,
  onOpenChange,
  onSelect,
  disabled,
}: {
  label: string;
  value: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (day: Date) => void;
  disabled?: boolean;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelWidth = 280;
  const panelHeight = 320;
  const coords = useAnchoredPanel(open, triggerRef, panelWidth, panelHeight);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-entry-picker]') || triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          onOpenChange(!open);
        }}
        className={cn(
          'shrink-0 rounded-md border border-transparent px-1.5 py-0.5 text-[12px] text-muted-foreground transition-colors',
          disabled
            ? 'cursor-default'
            : 'hover:border-[#e5e5e5] hover:bg-[#f6f6f6] hover:text-foreground dark:hover:border-white/10 dark:hover:bg-white/[0.08]',
          open && 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300'
        )}
      >
        {label}
      </button>
      {open &&
        coords &&
        createPortal(
          <div
            {...PICKER_ATTR}
            role="dialog"
            aria-label="Choose date"
            className="fixed z-[200] w-[17.5rem] overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1c1c1c] p-2 text-white shadow-elevated"
            style={{ top: coords.top, left: coords.left }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Calendar
              mode="single"
              selected={value}
              defaultMonth={value}
              onSelect={(day) => {
                if (!day) return;
                onSelect(day);
                onOpenChange(false);
              }}
              weekStartsOn={1}
              showOutsideDays
              className="bg-transparent p-1 text-white"
              classNames={{
                months: 'flex flex-col space-y-2',
                month: 'space-y-2',
                caption: 'flex justify-between items-center relative px-1 pt-0.5',
                caption_label: 'text-[13px] font-medium text-white',
                nav: 'flex items-center gap-1',
                nav_button:
                  'inline-flex size-7 items-center justify-center rounded-md border-0 bg-transparent p-0 text-white/60 opacity-100 hover:bg-white/10 hover:text-white',
                nav_button_previous: 'static',
                nav_button_next: 'static',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'w-8 rounded-md text-[10px] font-medium text-white/40',
                row: 'mt-1 flex w-full',
                cell: 'relative h-8 w-8 p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: 'inline-flex size-8 items-center justify-center rounded-md p-0 text-[12px] font-normal text-white/85 hover:bg-white/10 hover:text-white aria-selected:opacity-100',
                day_selected:
                  'bg-white/15 text-white hover:bg-white/20 hover:text-white focus:bg-white/15 focus:text-white',
                day_today: 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white',
                day_outside:
                  'text-white/30 opacity-100 aria-selected:bg-white/10 aria-selected:text-white/70',
                day_disabled: 'text-white/25 opacity-50',
                day_hidden: 'invisible',
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export function TimeEntryEditor({
  draft,
  onChange,
  onDelete,
  onSave,
  onDiscard,
  isEditing,
  isSaving = false,
  readOnly,
  showRequiredErrors,
}: Props) {
  const { activityColors, ensureActivityColors, managedProjects, addManagedProject } = useSharedState();
  const { allProjects } = useProjectStats();
  const getColor = useActivityColor();
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [openField, setOpenField] = useState<PickerField | null>(null);

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
  const startMinutes = minutesFromMidnight(start);
  const endMinutes = minutesFromMidnight(end);
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

  const setStartMinutes = (minutes: number) => {
    const duration = Math.max(SNAP_MINUTES, differenceInMinutes(end, start));
    const nextStart = applyMinutesOnDay(start, minutes);
    let nextEnd = addMinutes(nextStart, duration);
    if (
      minutesFromMidnight(nextEnd) <= minutesFromMidnight(nextStart) ||
      nextEnd.getDate() !== nextStart.getDate()
    ) {
      nextEnd = applyMinutesOnDay(nextStart, Math.min(24 * 60 - SNAP_MINUTES, minutes + SNAP_MINUTES));
      if (minutesFromMidnight(nextEnd) <= minutesFromMidnight(nextStart)) {
        nextEnd = addMinutes(nextStart, SNAP_MINUTES);
      }
    }
    onChange({ startTime: nextStart.toISOString(), endTime: nextEnd.toISOString() });
  };

  const setEndMinutes = (minutes: number) => {
    const clamped = Math.max(startMinutes + SNAP_MINUTES, minutes);
    const nextEnd = applyMinutesOnDay(start, Math.min(24 * 60, clamped));
    if (minutesFromMidnight(nextEnd) <= startMinutes) {
      onChange({ endTime: addMinutes(start, SNAP_MINUTES).toISOString() });
      return;
    }
    onChange({ endTime: nextEnd.toISOString() });
  };

  const setDay = (day: Date) => {
    const duration = Math.max(SNAP_MINUTES, differenceInMinutes(end, start));
    const nextStart = applyMinutesOnDay(day, startMinutes);
    const nextEnd = addMinutes(nextStart, duration);
    onChange({ startTime: nextStart.toISOString(), endTime: nextEnd.toISOString() });
  };

  return (
    <fieldset disabled={isSaving}
      className={cn(
        'w-[min(100vw-2rem,20.5rem)] space-y-4',
        showRequiredErrors && !canSave && 'animate-shake'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            autoFocus={!readOnly}
            readOnly={readOnly}
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Title"
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

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px] tabular-nums text-foreground">
            <Clock className="size-3.5 shrink-0 text-muted-foreground/70" />
            <TimeSlotPicker
              field="start"
              label={formatCompactTime(start)}
              valueMinutes={startMinutes}
              startMinutes={startMinutes}
              open={!readOnly && openField === 'start'}
              onOpenChange={(open) => setOpenField(open ? 'start' : null)}
              onSelect={setStartMinutes}
              disabled={readOnly}
            />
            <span className="text-muted-foreground/40">→</span>
            <TimeSlotPicker
              field="end"
              label={formatCompactTime(end)}
              valueMinutes={endMinutes}
              startMinutes={startMinutes}
              open={!readOnly && openField === 'end'}
              onOpenChange={(open) => setOpenField(open ? 'end' : null)}
              onSelect={setEndMinutes}
              disabled={readOnly}
            />
            <span className="ml-0.5 text-[12px] text-muted-foreground/70">
              {formatCompactDuration(start, end)}
            </span>
          </div>
          <DateDayPicker
            label={format(start, 'EEE MMM d')}
            value={start}
            open={!readOnly && openField === 'date'}
            onOpenChange={(open) => setOpenField(open ? 'date' : null)}
            onSelect={setDay}
            disabled={readOnly}
          />
        </div>

        {readOnly && (
          <p className="text-[11px] text-muted-foreground">From Google Calendar · sync to update</p>
        )}
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
            showProjectError &&
              'ring-2 ring-destructive/35 ring-offset-2 ring-offset-white dark:ring-offset-elevated'
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
            showActivityError &&
              'ring-2 ring-destructive/35 ring-offset-2 ring-offset-white dark:ring-offset-elevated'
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
                disabled={isSaving}
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
                disabled={isSaving}
                onClick={onDiscard}
              >
                Discard
              </Button>
            ) : (
              <span />
            )}
            {onSave && (
              <Button type="button" size="sm" className="h-8 px-3" disabled={isSaving} onClick={() => onSave()}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      )}
    </fieldset>
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
