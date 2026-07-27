import { useCallback, useMemo, useRef, useState } from 'react';
import { addWeeks, format, isSameDay, isToday, subWeeks } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useSharedState } from '@/hooks/useSharedState';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useActivityColor } from '@/components/ActivityBar';
import { cn } from '@/lib/utils';
import {
  dateFromDayAndMinutes,
  entryDurationHours,
  getISOWeekNumber,
  getWeekDays,
  googleEventsToTimeEntries,
  initialsFromName,
} from '@/lib/timeEntryUtils';
import { TimeEntryEditor, entryToDraft, isDraftComplete, type TimeEntryDraft } from './TimeEntryEditor';
import { sound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import type { TimeEntry } from '@/lib/types';
import { formatHours } from '@/lib/eventStats';

const GRID_LINE = 'border-[#ebebeb] dark:border-white/[0.06]';

type Props = {
  weekAnchor: Date;
  onWeekChange: (date: Date) => void;
};

export function TeamRosterView({ weekAnchor, onWeekChange }: Props) {
  const { authState } = useGoogleAuth();
  const members = useTeamStore((s) => s.members);
  const timeEntries = useTeamStore((s) => s.timeEntries);
  const addTimeEntry = useTeamStore((s) => s.addTimeEntry);
  const updateTimeEntry = useTeamStore((s) => s.updateTimeEntry);
  const deleteTimeEntry = useTeamStore((s) => s.deleteTimeEntry);
  const addManagedProject = useSharedState((s) => s.addManagedProject);
  const googleEvents = useSharedState((s) => s.events);
  const excludedProjects = useSharedState((s) => s.excludedProjects);
  const getColor = useActivityColor();

  const draftRef = useRef<TimeEntryDraft | null>(null);
  const [draft, setDraft] = useState<TimeEntryDraft | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  draftRef.current = draft;

  const days = useMemo(() => getWeekDays(weekAnchor, 1), [weekAnchor]);
  const weekNumber = getISOWeekNumber(weekAnchor);
  const weekStart = days[0];
  const weekEnd = days[6];
  const ownerId = authState.user?.id ?? 'local-user';

  const excludedSet = useMemo(
    () => new Set(excludedProjects.map((p) => p.toLowerCase())),
    [excludedProjects]
  );

  /** Local entries + Google `#` events attributed to the signed-in owner. */
  const allEntries = useMemo(() => {
    const local = timeEntries.filter((e) => e.status === 'confirmed');
    const fromGoogle = googleEventsToTimeEntries(googleEvents, ownerId, excludedSet);
    return [...local, ...fromGoogle];
  }, [timeEntries, googleEvents, ownerId, excludedSet]);

  const activeMembers = useMemo(() => {
    const list = members.filter((m) => m.status !== 'pending');
    if (list.length === 0 && authState.user) {
      return [
        {
          id: authState.user.id,
          name: authState.user.name,
          email: authState.user.email,
          imageUrl: authState.user.imageUrl,
          hoursLogged: 0,
          role: 'owner' as const,
          status: 'active' as const,
        },
      ];
    }
    return list;
  }, [members, authState.user]);

  const hoursForMember = (memberId: string) =>
    allEntries
      .filter((e) => {
        if (e.memberId !== memberId) return false;
        const s = new Date(e.startTime);
        return s >= weekStart && s <= new Date(weekEnd.getTime() + 86400000 - 1);
      })
      .reduce((sum, e) => sum + entryDurationHours(e), 0);

  const dayTotals = days.map((day) => {
    const dayEntries = allEntries.filter((e) => isSameDay(new Date(e.startTime), day));
    const people = new Set(dayEntries.map((e) => e.memberId)).size;
    const hours = dayEntries.reduce((sum, e) => sum + entryDurationHours(e), 0);
    return { people, hours };
  });

  const weekTotal = dayTotals.reduce((s, d) => s + d.hours, 0);

  const closeEditor = useCallback(() => {
    setDraft(null);
    setAnchorPos(null);
    setShowRequiredErrors(false);
  }, []);

  const saveDraft = useCallback(
    (current: TimeEntryDraft) => {
      const projectName = current.projectName.trim();
      const activityType = current.activityType.trim();
      if (!projectName || !activityType) return false;
      const title = current.title.trim() || `${projectName} · ${activityType}`;
      addManagedProject(projectName);

      if (current.id) {
        updateTimeEntry(current.id, {
          title,
          projectName,
          projectId: projectName.toLowerCase(),
          activityType,
          color: undefined,
          startTime: current.startTime,
          endTime: current.endTime,
          status: 'confirmed',
        });
      } else {
        addTimeEntry({
          title,
          projectName,
          projectId: projectName.toLowerCase(),
          activityType,
          startTime: current.startTime,
          endTime: current.endTime,
          memberId: current.memberId,
          status: 'confirmed',
        });
      }
      sound.success();
      return true;
    },
    [addManagedProject, addTimeEntry, updateTimeEntry]
  );

  const requestSaveOrWarn = useCallback(() => {
    const current = draftRef.current;
    if (!current) return false;
    if (current.id?.startsWith('google-')) {
      closeEditor();
      return true;
    }
    if (!isDraftComplete(current)) {
      setShowRequiredErrors(true);
      return false;
    }
    draftRef.current = null;
    saveDraft(current);
    closeEditor();
    return true;
  }, [closeEditor, saveDraft]);

  /** Click-away: save when complete, otherwise discard (never trap the user). */
  const dismissEditor = useCallback(() => {
    const current = draftRef.current;
    if (!current) return;
    draftRef.current = null;

    if (current.id?.startsWith('google-')) {
      closeEditor();
      return;
    }

    if (isDraftComplete(current)) {
      saveDraft(current);
      closeEditor();
      return;
    }

    closeEditor();
    const touched =
      Boolean(current.title.trim()) ||
      Boolean(current.projectName.trim()) ||
      Boolean(current.activityType.trim());
    if (touched) {
      toast({
        title: 'Event discarded',
        description: 'Choose a project and activity to save time entries.',
      });
    }
  }, [closeEditor, saveDraft]);

  const discardEditor = useCallback(() => {
    draftRef.current = null;
    closeEditor();
  }, [closeEditor]);

  const openEditor = (next: TimeEntryDraft, x: number, y: number) => {
    setShowRequiredErrors(false);
    setDraft(next);
    setAnchorPos({
      x: Math.min(Math.max(x, 160), window.innerWidth - 160),
      y: Math.max(72, y - 6),
    });
  };

  const openNewEntry = (
    memberId: string,
    day: Date,
    clientX: number,
    clientY: number,
    afterEntries: TimeEntry[] = []
  ) => {
    if (draft) {
      dismissEditor();
      return;
    }

    let startMinutes = 9 * 60;
    if (afterEntries.length > 0) {
      const latestEnd = Math.max(
        ...afterEntries.map((entry) => {
          const end = new Date(entry.endTime);
          return end.getHours() * 60 + end.getMinutes();
        })
      );
      startMinutes = Math.min(latestEnd, 23 * 60);
    }
    const endMinutes = Math.min(startMinutes + 60, 24 * 60);
    const start = dateFromDayAndMinutes(day, startMinutes);
    const end = dateFromDayAndMinutes(day, endMinutes);

    openEditor(
      {
        title: '',
        projectName: '',
        activityType: '',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        memberId,
      },
      clientX,
      clientY
    );
  };

  const ghostCell =
    draft && !draft.id
      ? { memberId: draft.memberId, day: new Date(draft.startTime) }
      : null;

  return (
    <div className="flex w-full flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">Team</h2>
          <span className="rounded-md bg-[#f6f6f6] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
            W{weekNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(weekStart, 'd')} – {format(weekEnd, 'd MMM')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground"
              onClick={() => {
                onWeekChange(subWeeks(weekAnchor, 1));
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <button
              type="button"
              className="h-7 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-[#f6f6f6] hover:text-foreground dark:hover:bg-white/[0.06]"
              onClick={() => {
                onWeekChange(new Date());
              }}
            >
              Today
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground"
              onClick={() => {
                onWeekChange(addWeeks(weekAnchor, 1));
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            <span className="font-medium tabular-nums text-foreground">{formatHours(weekTotal)}</span>
            {' '}this week
          </span>
        </div>
      </div>

      <div className={cn('overflow-hidden rounded-lg border bg-white dark:bg-elevated', GRID_LINE)}>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className={cn('grid grid-cols-[11rem_repeat(7,minmax(0,1fr))] bg-white dark:bg-elevated', GRID_LINE, 'border-b')}>
              <div className="flex items-center px-4 py-2.5 text-xs font-medium text-muted-foreground">
                People
              </div>
              {days.map((day) => (
                <div key={day.toISOString()} className="flex items-center justify-center gap-1 py-2.5">
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
                      isToday(day) ? 'bg-foreground text-background' : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>

            {activeMembers.map((member) => {
              const hours = hoursForMember(member.id);
              return (
                <div
                  key={member.id}
                  className={cn(
                    'grid grid-cols-[11rem_repeat(7,minmax(0,1fr))]',
                    GRID_LINE,
                    'border-b last:border-b-0'
                  )}
                >
                  <div className="flex items-center gap-2.5 px-3 py-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={member.imageUrl} />
                      <AvatarFallback className="text-xs">{initialsFromName(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatHours(hours)}
                      </p>
                    </div>
                  </div>

                  {days.map((day) => {
                    const cellEntries = allEntries.filter(
                      (e) => e.memberId === member.id && isSameDay(new Date(e.startTime), day)
                    );
                    const showGhost =
                      ghostCell &&
                      ghostCell.memberId === member.id &&
                      isSameDay(ghostCell.day, day);
                    const ghostColor = draft?.activityType
                      ? getColor(draft.activityType)
                      : '#94A3B8';

                    return (
                      <div
                        key={`${member.id}-${day.toISOString()}`}
                        className={cn(
                          'group/cell relative flex min-h-[4.5rem] flex-col gap-1 p-1.5 transition-colors hover:bg-[#fafafa] dark:hover:bg-white/[0.03]',
                          GRID_LINE,
                          'border-l'
                        )}
                      >
                        <div className="flex flex-col items-stretch gap-1">
                          {cellEntries.map((entry) => (
                            <RosterBlock
                              key={entry.id}
                              entry={entry}
                              color={getColor(entry.activityType)}
                              selected={draft?.id === entry.id}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                if (draft && draft.id !== entry.id) dismissEditor();
                                openEditor(entryToDraft(entry), ev.clientX, ev.clientY);
                              }}
                            />
                          ))}
                          {showGhost && draft && (
                            <div
                              className="rounded-[4px] border border-dashed px-1.5 py-1.5 text-left text-[11px] font-medium leading-tight"
                              style={{
                                borderColor: ghostColor,
                                color: ghostColor,
                                backgroundColor: `${ghostColor}18`,
                              }}
                            >
                              {format(new Date(draft.startTime), 'H:mm')} –{' '}
                              {format(new Date(draft.endTime), 'H:mm')}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label="Add time entry"
                          className={cn(
                            'flex w-full items-center justify-center rounded-[4px] transition-colors',
                            cellEntries.length === 0 && !showGhost
                              ? 'min-h-[2.75rem] flex-1'
                              : 'h-7 shrink-0',
                            'text-muted-foreground/0 hover:bg-[#f0f0f0] hover:text-muted-foreground dark:hover:bg-white/[0.06]',
                            'group-hover/cell:text-muted-foreground/50'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            openNewEntry(member.id, day, e.clientX, e.clientY, cellEntries);
                          }}
                        >
                          <Plus className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <div className="grid grid-cols-[11rem_repeat(7,minmax(0,1fr))] bg-[#fafafa] dark:bg-white/[0.02]">
              <div className="flex items-center px-4 py-3 text-xs font-medium text-muted-foreground">
                Daily
              </div>
              {dayTotals.map((total, i) => (
                <div
                  key={days[i].toISOString()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-3 text-xs',
                    GRID_LINE,
                    'border-l'
                  )}
                >
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Users className="size-3" />
                    {total.people}
                  </span>
                  <span className="font-mono font-medium tabular-nums">{formatHours(total.hours)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Popover
        open={Boolean(draft)}
        onOpenChange={(open) => {
          if (!open) dismissEditor();
        }}
      >
        <PopoverAnchor asChild>
          <div
            className="pointer-events-none fixed size-0"
            style={{ left: anchorPos?.x ?? 0, top: anchorPos?.y ?? 0 }}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-[#ebebeb] bg-white p-3.5 shadow-elevated dark:border-white/10 dark:bg-elevated"
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={16}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            discardEditor();
          }}
        >
          <AnimatePresence>
            {draft && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <TimeEntryEditor
                  draft={draft}
                  isEditing={Boolean(draft.id)}
                  readOnly={Boolean(draft.id?.startsWith('google-'))}
                  showRequiredErrors={showRequiredErrors}
                  onChange={(patch) => {
                    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
                    if (patch.projectName !== undefined || patch.activityType !== undefined) {
                      setShowRequiredErrors(false);
                    }
                  }}
                  onSave={
                    draft.id?.startsWith('google-') ? undefined : () => requestSaveOrWarn()
                  }
                  onDiscard={draft.id?.startsWith('google-') ? undefined : discardEditor}
                  onDelete={
                    draft.id && !draft.id.startsWith('google-')
                      ? () => {
                          deleteTimeEntry(draft.id!);
                          closeEditor();
                        }
                      : undefined
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RosterBlock({
  entry,
  color,
  selected,
  onClick,
}: {
  entry: TimeEntry;
  color: string;
  selected?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const start = new Date(entry.startTime);
  const end = new Date(entry.endTime);
  const isDraft = entry.status === 'draft';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full overflow-hidden rounded-[4px] px-1.5 py-1.5 text-left text-[11px] font-medium leading-tight',
        selected && 'ring-2 ring-foreground/15',
        isDraft && 'border border-dashed'
      )}
      style={{
        backgroundColor: isDraft ? `${color}22` : `${color}55`,
        borderColor: isDraft ? color : undefined,
        boxShadow: isDraft ? undefined : `inset 2px 0 0 ${color}`,
      }}
    >
      <span className="block truncate tabular-nums text-foreground">
        {format(start, 'H:mm')} – {format(end, 'H:mm')}
      </span>
    </button>
  );
}
