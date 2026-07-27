import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addWeeks, format, isSameDay, isToday, subWeeks } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/hooks/useTeamStore';
import { useSharedState } from '@/hooks/useSharedState';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useActivityColor } from '@/components/ActivityBar';
import { cn } from '@/lib/utils';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  DEFAULT_VIEW_START_HOUR,
  HOUR_HEIGHT,
  SNAP_MINUTES,
  computeOverlapLayout,
  dateFromDayAndMinutes,
  ensureMinDuration,
  formatCompactTime,
  getISOWeekNumber,
  getWeekDays,
  googleEventsToTimeEntries,
  isGoogleTimeEntry,
  minutesFromMidnight,
  minutesToHeight,
  snapMinutes,
  yToMinutesInDay,
  type OverlapPlacement,
} from '@/lib/timeEntryUtils';
import { TimeEntryEditor, entryToDraft, isDraftComplete, type TimeEntryDraft } from './TimeEntryEditor';
import { sound } from '@/lib/sounds';
import { toast } from '@/hooks/use-toast';
import type { TimeEntry } from '@/lib/types';

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
const GRID_LINE = 'border-[#ebebeb] dark:border-white/[0.06]';
const EDGE_PX = 10;
const CLICK_THRESHOLD_PX = 3;
const MIN_EVENT_MINUTES = SNAP_MINUTES;

const hourGridBackground = (dark: boolean) =>
  `repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--hour-h) - 1px), ${
    dark ? 'rgba(255,255,255,0.06)' : '#ebebeb'
  } calc(var(--hour-h) - 1px), ${dark ? 'rgba(255,255,255,0.06)' : '#ebebeb'} var(--hour-h))`;

type DragCreate = {
  day: Date;
  originMinutes: number;
  currentMinutes: number;
  memberId: string;
};

type EntryInteraction = {
  entryId: string;
  mode: 'move' | 'resize-start' | 'resize-end';
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  /** Minutes from event start where the pointer grabbed (move only). */
  grabOffset: number;
  pointerId: number;
  originClientX: number;
  originClientY: number;
  didMove: boolean;
};

type Props = {
  weekAnchor: Date;
  onWeekChange: (date: Date) => void;
};

export function WeekCalendar({ weekAnchor, onWeekChange }: Props) {
  const { authState } = useGoogleAuth();
  const timeEntries = useTeamStore((s) => s.timeEntries);
  const addTimeEntry = useTeamStore((s) => s.addTimeEntry);
  const updateTimeEntry = useTeamStore((s) => s.updateTimeEntry);
  const deleteTimeEntry = useTeamStore((s) => s.deleteTimeEntry);
  const addManagedProject = useSharedState((s) => s.addManagedProject);
  const googleEvents = useSharedState((s) => s.events);
  const excludedProjects = useSharedState((s) => s.excludedProjects);
  const getColor = useActivityColor();
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dayColumnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const draftRef = useRef<TimeEntryDraft | null>(null);
  const interactionRef = useRef<EntryInteraction | null>(null);
  const createDragRef = useRef<DragCreate | null>(null);
  const daysRef = useRef<Date[]>([]);
  const entriesRef = useRef<TimeEntry[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [dragging, setDragging] = useState<DragCreate | null>(null);
  const [entryDrag, setEntryDrag] = useState<EntryInteraction | null>(null);
  const [draft, setDraft] = useState<TimeEntryDraft | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);
  const [showRequiredErrors, setShowRequiredErrors] = useState(false);
  /** Ignore outside-dismiss from the same click that opened the editor. */
  const ignoreDismissUntilRef = useRef(0);

  draftRef.current = draft;
  createDragRef.current = dragging;

  const days = useMemo(() => getWeekDays(weekAnchor, 1), [weekAnchor]);
  const weekNumber = getISOWeekNumber(weekAnchor);
  const userId = authState.user?.id ?? 'local-user';

  const excludedSet = useMemo(
    () => new Set(excludedProjects.map((p) => p.toLowerCase())),
    [excludedProjects]
  );

  const myEntries = useMemo(() => {
    const local = timeEntries.filter((e) => e.memberId === userId);
    const fromGoogle = googleEventsToTimeEntries(googleEvents, userId, excludedSet);
    return [...local, ...fromGoogle];
  }, [timeEntries, userId, googleEvents, excludedSet]);

  daysRef.current = days;
  entriesRef.current = myEntries;

  const selectionGhost = useMemo(() => {
    if (dragging) {
      const startMinutes = Math.min(dragging.originMinutes, dragging.currentMinutes);
      const endMinutes = Math.max(
        Math.max(dragging.originMinutes, dragging.currentMinutes),
        startMinutes + MIN_EVENT_MINUTES
      );
      return { day: dragging.day, startMinutes, endMinutes, memberId: dragging.memberId };
    }
    if (draft && !draft.id) {
      const start = new Date(draft.startTime);
      const end = new Date(draft.endTime);
      let endMinutes = minutesFromMidnight(end);
      if (!isSameDay(start, end) || endMinutes <= minutesFromMidnight(start)) {
        endMinutes = 24 * 60;
      }
      return {
        day: start,
        startMinutes: minutesFromMidnight(start),
        endMinutes,
        memberId: draft.memberId,
      };
    }
    return null;
  }, [dragging, draft]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = DEFAULT_VIEW_START_HOUR * HOUR_HEIGHT - 24;
  }, []);

  const closeEditor = useCallback(() => {
    setDraft(null);
    setAnchorPos(null);
    setDragging(null);
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
    // Only nudge if they started filling something in — empty cancel stays quiet.
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

  /** Escape / Discard: always cancel without saving. */
  const discardEditor = useCallback(() => {
    draftRef.current = null;
    closeEditor();
  }, [closeEditor]);

  const openEditor = (
    next: TimeEntryDraft,
    clientX: number,
    _clientY: number,
    selectionTop?: number
  ) => {
    // Prevent the opening pointer/click from immediately closing the popover.
    ignoreDismissUntilRef.current = performance.now() + 400;
    setShowRequiredErrors(false);
    const y = selectionTop ?? _clientY;
    setAnchorPos({
      x: Math.min(Math.max(clientX, 160), window.innerWidth - 160),
      y: Math.max(72, y - 6),
    });
    setDraft(next);
  };

  const minutesFromColumnEvent = (e: React.PointerEvent, el: HTMLElement) => {
    const colRect = el.getBoundingClientRect();
    return yToMinutesInDay(e.clientY - colRect.top);
  };

  const dayIndexFromClientX = useCallback((clientX: number) => {
    const cols = dayColumnRefs.current;
    for (let i = 0; i < cols.length; i += 1) {
      const col = cols[i];
      if (!col) continue;
      const rect = col.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return i;
    }
    // Clamp to nearest column
    let best = 0;
    let bestDist = Infinity;
    cols.forEach((col, i) => {
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const mid = (rect.left + rect.right) / 2;
      const dist = Math.abs(clientX - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, []);

  const rawMinutesFromClientY = useCallback((clientY: number, dayIndex: number) => {
    const col = dayColumnRefs.current[dayIndex];
    if (!col) return 0;
    const rect = col.getBoundingClientRect();
    const raw = ((clientY - rect.top) / HOUR_HEIGHT) * 60;
    return Math.max(0, Math.min(24 * 60, raw));
  }, []);

  const entryListenersCleanupRef = useRef<(() => void) | null>(null);

  const beginEntryInteraction = (
    entry: TimeEntry,
    mode: EntryInteraction['mode'],
    e: { clientX: number; clientY: number; stopPropagation: () => void },
    dayIndex: number
  ) => {
    e.stopPropagation();

    // Google-synced blocks are view-only — open details on click (no drag/resize).
    // Use the same pointerup path as local events so the opening click doesn't
    // immediately dismiss the popover.
    if (isGoogleTimeEntry(entry)) {
      if (interactionRef.current?.entryId === entry.id) return;
      entryListenersCleanupRef.current?.();
      entryListenersCleanupRef.current = null;
      if (draftRef.current && draftRef.current.id !== entry.id) {
        dismissEditor();
      }
      setDragging(null);
      createDragRef.current = null;

      let finished = false;
      const originX = e.clientX;
      const originY = e.clientY;
      const onUp = (ev: MouseEvent | PointerEvent) => {
        if (finished) return;
        finished = true;
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('mouseup', onUp);
        entryListenersCleanupRef.current = null;
        openEditor(entryToDraft(entry), ev.clientX || originX, ev.clientY || originY, ev.clientY || originY);
      };
      window.addEventListener('pointerup', onUp);
      window.addEventListener('mouseup', onUp);
      entryListenersCleanupRef.current = () => {
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('mouseup', onUp);
      };
      return;
    }

    // Already dragging this gesture (pointerdown + mousedown both fire)
    if (interactionRef.current?.entryId === entry.id) return;

    entryListenersCleanupRef.current?.();
    entryListenersCleanupRef.current = null;

    if (draftRef.current) dismissEditor();
    setDragging(null);
    createDragRef.current = null;

    const startMinutes = minutesFromMidnight(new Date(entry.startTime));
    const endMinutes = (() => {
      const end = new Date(entry.endTime);
      const start = new Date(entry.startTime);
      let mins = minutesFromMidnight(end);
      if (!isSameDay(start, end) || mins <= startMinutes) mins = 24 * 60;
      return mins;
    })();

    const pointerMinutes = rawMinutesFromClientY(e.clientY, dayIndex);
    const duration = Math.max(MIN_EVENT_MINUTES, endMinutes - startMinutes);

    const initial: EntryInteraction = {
      entryId: entry.id,
      mode,
      dayIndex,
      startMinutes,
      endMinutes,
      grabOffset: Math.max(0, Math.min(duration, pointerMinutes - startMinutes)),
      pointerId: 1,
      originClientX: e.clientX,
      originClientY: e.clientY,
      didMove: false,
    };
    interactionRef.current = initial;
    setEntryDrag(initial);

    let finished = false;

    const applyMove = (clientX: number, clientY: number) => {
      const current = interactionRef.current;
      if (!current || finished) return;

      const moved =
        Math.abs(clientX - current.originClientX) > CLICK_THRESHOLD_PX ||
        Math.abs(clientY - current.originClientY) > CLICK_THRESHOLD_PX;

      let next: EntryInteraction = { ...current, didMove: current.didMove || moved };

      if (current.mode === 'move') {
        const nextDayIndex = dayIndexFromClientX(clientX);
        const nextPointerMinutes = rawMinutesFromClientY(clientY, nextDayIndex);
        const dur = current.endMinutes - current.startMinutes;
        let nextStart = snapMinutes(nextPointerMinutes - current.grabOffset);
        nextStart = Math.max(0, Math.min(24 * 60 - dur, nextStart));
        next = {
          ...next,
          dayIndex: nextDayIndex,
          startMinutes: nextStart,
          endMinutes: nextStart + dur,
        };
      } else if (current.mode === 'resize-start') {
        const nextPointerMinutes = rawMinutesFromClientY(clientY, current.dayIndex);
        let nextStart = snapMinutes(nextPointerMinutes);
        nextStart = Math.max(0, Math.min(current.endMinutes - MIN_EVENT_MINUTES, nextStart));
        next = { ...next, startMinutes: nextStart };
      } else {
        const nextPointerMinutes = rawMinutesFromClientY(clientY, current.dayIndex);
        let nextEnd = snapMinutes(nextPointerMinutes);
        nextEnd = Math.max(current.startMinutes + MIN_EVENT_MINUTES, Math.min(24 * 60, nextEnd));
        next = { ...next, endMinutes: nextEnd };
      }

      interactionRef.current = next;
      setEntryDrag(next);
    };

    const finish = (clientX: number, clientY: number) => {
      if (finished) return;
      finished = true;
      entryListenersCleanupRef.current?.();
      entryListenersCleanupRef.current = null;

      const current = interactionRef.current;
      interactionRef.current = null;
      setEntryDrag(null);
      if (!current) return;

      const liveEntry = entriesRef.current.find((item) => item.id === current.entryId);
      if (!liveEntry) return;

      if (current.didMove) {
        const day = daysRef.current[current.dayIndex] ?? new Date(liveEntry.startTime);
        const { start, end } = ensureMinDuration(
          dateFromDayAndMinutes(day, current.startMinutes),
          dateFromDayAndMinutes(day, current.endMinutes)
        );
        updateTimeEntry(liveEntry.id, {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        });
        return;
      }

      if (draftRef.current && draftRef.current.id !== liveEntry.id) dismissEditor();
      openEditor(entryToDraft(liveEntry), clientX, clientY, clientY);
    };

    const onMove = (ev: MouseEvent | PointerEvent) => {
      applyMove(ev.clientX, ev.clientY);
    };
    const onUp = (ev: MouseEvent | PointerEvent) => {
      finish(ev.clientX, ev.clientY);
    };

    // Listen to both: pointerdown+preventDefault suppresses mouse events; some
    // environments only emit one family. Never call preventDefault on pointerdown.
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    entryListenersCleanupRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  };

  useEffect(() => {
    return () => {
      entryListenersCleanupRef.current?.();
    };
  }, []);

  const handleGridPointerDown = (day: Date, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || interactionRef.current) return;
    if ((e.target as HTMLElement | null)?.closest?.('[data-cal-event]')) return;
    if (draft) {
      dismissEditor();
      return;
    }
    const minutes = minutesFromColumnEvent(e, e.currentTarget);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const next = {
      day,
      originMinutes: minutes,
      currentMinutes: minutes,
      memberId: userId,
    };
    createDragRef.current = next;
    setDragging(next);
  };

  const handleGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interactionRef.current || !createDragRef.current) return;
    const minutes = minutesFromColumnEvent(e, e.currentTarget);
    const next = { ...createDragRef.current, currentMinutes: minutes };
    createDragRef.current = next;
    setDragging(next);
  };

  const handleGridPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interactionRef.current) return;
    const create = createDragRef.current;
    if (!create) return;
    createDragRef.current = null;
    const minutes = minutesFromColumnEvent(e, e.currentTarget);
    const startMin = Math.min(create.originMinutes, minutes);
    const endMin = Math.max(Math.max(create.originMinutes, minutes), startMin + MIN_EVENT_MINUTES);
    const { start, end } = ensureMinDuration(
      dateFromDayAndMinutes(create.day, startMin),
      dateFromDayAndMinutes(create.day, endMin)
    );
    const nextDraft: TimeEntryDraft = {
      title: '',
      projectName: '',
      activityType: '',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      memberId: create.memberId,
    };
    const colRect = e.currentTarget.getBoundingClientRect();
    const selectionTop = colRect.top + minutesToHeight(startMin);
    setDragging(null);
    openEditor(nextDraft, e.clientX, e.clientY, selectionTop);
  };

  const handleDelete = () => {
    if (draft?.id && !draft.id.startsWith('google-')) {
      deleteTimeEntry(draft.id);
    }
    closeEditor();
  };

  const draftIsGoogle = Boolean(draft?.id && draft.id.startsWith('google-'));

  const nowMinutes = minutesFromMidnight(now);
  const showNowLine = days.some((d) => isToday(d));
  const ghostColor = draft?.activityType ? getColor(draft.activityType) : '#F97316';

  const previewForEntry = (entryId: string) =>
    entryDrag && entryDrag.entryId === entryId ? entryDrag : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold tracking-tight">{format(weekAnchor, 'MMMM yyyy')}</h2>
            <span className="rounded-md bg-[#f6f6f6] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
              W{weekNumber}
            </span>
          </div>
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
        </div>
        <p className="text-xs text-muted-foreground">
          Google # events + your entries · drag to create
        </p>
      </div>

      <div className={cn('relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-white dark:bg-elevated', GRID_LINE)}>
        <div ref={scrollRef} className="h-full overflow-auto">
          <div className={cn('sticky top-0 z-20 grid grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] bg-white dark:bg-elevated', GRID_LINE, 'border-b')}>
            <div />
            {days.map((day) => {
              const today = isToday(day);
              return (
                <div key={day.toISOString()} className="flex items-center justify-center gap-1 py-2.5">
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium tabular-nums',
                      today ? 'bg-foreground text-background' : 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className="relative grid grid-cols-[3.25rem_repeat(7,minmax(0,1fr))]"
            style={
              {
                height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT,
                ['--hour-h' as string]: `${HOUR_HEIGHT}px`,
              } as React.CSSProperties
            }
          >
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground/70"
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
                >
                  {hour === 0 ? '' : format(dateFromDayAndMinutes(new Date(), hour * 60), 'ha')}
                </div>
              ))}
              {showNowLine && (
                <div
                  className="absolute right-1 z-30 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white"
                  style={{ top: nowMinutes * (HOUR_HEIGHT / 60) - 9 }}
                >
                  {format(now, 'HH:mm')}
                </div>
              )}
            </div>

            {days.map((day, dayIndex) => {
              const dayEntries = myEntries.filter((entry) => {
                const preview = previewForEntry(entry.id);
                if (preview) return preview.dayIndex === dayIndex;
                return isSameDay(new Date(entry.startTime), day);
              });

              const overlapLayout = computeOverlapLayout(
                dayEntries.map((entry) => {
                  const preview = previewForEntry(entry.id);
                  const start = new Date(entry.startTime);
                  const end = new Date(entry.endTime);
                  let startMinutes = preview?.startMinutes ?? minutesFromMidnight(start);
                  let endMinutes = preview?.endMinutes ?? minutesFromMidnight(end);
                  if (!preview && (!isSameDay(start, end) || endMinutes <= startMinutes)) {
                    endMinutes = 24 * 60;
                  }
                  return { id: entry.id, startMinutes, endMinutes };
                })
              );

              const ghost =
                selectionGhost && isSameDay(selectionGhost.day, day) ? selectionGhost : null;

              return (
                <div
                  key={day.toISOString()}
                  ref={(el) => {
                    dayColumnRefs.current[dayIndex] = el;
                  }}
                  className={cn('relative touch-none border-l', GRID_LINE)}
                  style={{
                    backgroundImage: hourGridBackground(isDark),
                    // Prevent the scroll parent from claiming the gesture mid-drag.
                    touchAction: entryDrag ? 'none' : undefined,
                  }}
                  onPointerDown={(e) => handleGridPointerDown(day, e)}
                  onPointerMove={handleGridPointerMove}
                  onPointerUp={handleGridPointerUp}
                >
                  {showNowLine && isToday(day) && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-orange-500"
                      style={{ top: nowMinutes * (HOUR_HEIGHT / 60) }}
                    >
                      <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 rounded-full bg-orange-500" />
                    </div>
                  )}

                  {dayEntries.map((entry) => {
                    const selected = draft?.id === entry.id;
                    const color = getColor(entry.activityType);
                    const preview = previewForEntry(entry.id);
                    const placement = overlapLayout.get(entry.id);
                    const fromGoogle = isGoogleTimeEntry(entry);
                    return (
                      <EntryBlock
                        key={entry.id}
                        entry={entry}
                        color={color}
                        selected={selected}
                        preview={preview}
                        placement={placement}
                        readOnly={fromGoogle}
                        interacting={Boolean(entryDrag && entryDrag.entryId === entry.id)}
                        onEdgeMouseDown={(mode, ev) =>
                          beginEntryInteraction(entry, mode, ev, dayIndex)
                        }
                        onBodyMouseDown={(ev) => beginEntryInteraction(entry, 'move', ev, dayIndex)}
                      />
                    );
                  })}

                  {ghost && (
                    <div
                      className="pointer-events-none absolute left-0 right-1 z-10 overflow-hidden rounded-[4px] border border-dashed px-1.5 pt-0.5 text-left"
                      style={{
                        top: minutesToHeight(ghost.startMinutes),
                        height: Math.max(minutesToHeight(ghost.endMinutes - ghost.startMinutes), 22),
                        backgroundColor: `${ghostColor}22`,
                        borderColor: ghostColor,
                        color: ghostColor,
                      }}
                    >
                      <div className="truncate text-[11px] font-medium leading-tight">
                        {draft?.title || 'New event'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Popover
        open={Boolean(draft && anchorPos)}
        onOpenChange={(open) => {
          if (!open) {
            if (performance.now() < ignoreDismissUntilRef.current) return;
            dismissEditor();
          }
        }}
      >
        <PopoverAnchor asChild>
          <div
            className="pointer-events-none fixed size-0"
            style={{ left: anchorPos?.x ?? -9999, top: anchorPos?.y ?? -9999 }}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border border-[#ebebeb] bg-white p-3.5 shadow-elevated dark:border-white/10 dark:bg-elevated"
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            if (performance.now() < ignoreDismissUntilRef.current) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (performance.now() < ignoreDismissUntilRef.current) {
              e.preventDefault();
            }
          }}
          onFocusOutside={(e) => {
            if (performance.now() < ignoreDismissUntilRef.current) {
              e.preventDefault();
            }
          }}
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
                  readOnly={draftIsGoogle}
                  showRequiredErrors={showRequiredErrors}
                  onChange={(patch) => {
                    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
                    if (patch.projectName !== undefined || patch.activityType !== undefined) {
                      setShowRequiredErrors(false);
                    }
                  }}
                  onSave={draftIsGoogle ? undefined : () => requestSaveOrWarn()}
                  onDiscard={draftIsGoogle ? undefined : discardEditor}
                  onDelete={draft.id && !draftIsGoogle ? handleDelete : undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const OVERLAP_GAP_PX = 2;
const COLUMN_RIGHT_PAD_PX = 4;

function EntryBlock({
  entry,
  color,
  selected,
  preview,
  placement,
  interacting,
  readOnly,
  onEdgeMouseDown,
  onBodyMouseDown,
}: {
  entry: TimeEntry;
  color: string;
  selected?: boolean;
  preview: EntryInteraction | null;
  placement?: OverlapPlacement;
  interacting?: boolean;
  readOnly?: boolean;
  onEdgeMouseDown: (
    mode: 'resize-start' | 'resize-end',
    e: { clientX: number; clientY: number; stopPropagation: () => void }
  ) => void;
  onBodyMouseDown: (e: { clientX: number; clientY: number; stopPropagation: () => void }) => void;
}) {
  const start = new Date(entry.startTime);
  const end = new Date(entry.endTime);

  const startMinutes = preview?.startMinutes ?? minutesFromMidnight(start);
  const endMinutes = preview?.endMinutes ?? (() => {
    let mins = minutesFromMidnight(end);
    if (!isSameDay(start, end) || mins <= minutesFromMidnight(start)) mins = 24 * 60;
    return mins;
  })();

  const top = minutesToHeight(startMinutes);
  const height = Math.max(minutesToHeight(endMinutes - startMinutes), 22);
  const edge = Math.min(EDGE_PX, Math.max(4, height / 3));

  const column = placement?.column ?? 0;
  const colSpan = placement?.colSpan ?? 1;
  const columnCount = Math.max(placement?.columnCount ?? 1, 1);
  const isStacked = columnCount > 1;
  const widthPct = (colSpan / columnCount) * 100;
  const leftPct = (column / columnCount) * 100;
  const leftGap = column > 0 ? OVERLAP_GAP_PX : 0;

  const startLabel = formatCompactTime(
    preview ? dateFromDayAndMinutes(new Date(2000, 0, 1), preview.startMinutes) : start
  );
  const endLabel = formatCompactTime(
    preview
      ? dateFromDayAndMinutes(
          new Date(2000, 0, 1),
          preview.endMinutes >= 24 * 60 ? 24 * 60 - SNAP_MINUTES : preview.endMinutes
        )
      : end
  );

  const showTime = height > 28 && widthPct > 28;
  const showActivity = height > 48 && widthPct > 40 && entry.activityType;
  const z = interacting ? 40 : selected ? 28 : 6 + column;

  return (
    <div
      role="button"
      tabIndex={-1}
      data-cal-event={entry.id}
      aria-label={`${entry.title || 'Untitled'} event`}
      className={cn(
        'absolute touch-none select-none overflow-hidden rounded-[5px] px-1.5 pt-0.5 text-left',
        selected && 'ring-2 ring-foreground/15',
        interacting && 'opacity-95'
      )}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + ${leftGap}px)`,
        width: `calc(${widthPct}% - ${leftGap + COLUMN_RIGHT_PAD_PX}px)`,
        zIndex: z,
        backgroundColor: `${color}48`,
        boxShadow: isStacked
          ? `inset 2px 0 0 ${color}, 0 1px 2px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.12)`
          : `inset 2px 0 0 ${color}`,
        cursor: readOnly ? 'pointer' : interacting ? 'grabbing' : 'grab',
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        // stopPropagation only — do NOT preventDefault (that kills mouse events).
        e.stopPropagation();
        if (readOnly) {
          onBodyMouseDown(e);
          return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        if (y <= edge) {
          e.currentTarget.style.cursor = 'ns-resize';
          onEdgeMouseDown('resize-start', e);
          return;
        }
        if (y >= rect.height - edge) {
          e.currentTarget.style.cursor = 'ns-resize';
          onEdgeMouseDown('resize-end', e);
          return;
        }
        e.currentTarget.style.cursor = 'grabbing';
        onBodyMouseDown(e);
      }}
      onMouseMove={(e) => {
        if (interacting || readOnly) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        e.currentTarget.style.cursor =
          y <= edge || y >= rect.height - edge ? 'ns-resize' : 'grab';
      }}
    >
      <div className="pointer-events-none relative z-[2] w-full min-w-0">
        <div className="truncate text-[11px] font-medium leading-tight text-foreground">
          {entry.title || 'Untitled'}
          {!showTime && height <= 28 && (
            <span className="ml-1 font-normal tabular-nums text-foreground/55">
              {startLabel}
            </span>
          )}
        </div>
        {showTime && (
          <div className="truncate text-[10px] leading-tight tabular-nums text-foreground/60">
            {startLabel} – {endLabel}
          </div>
        )}
        {showActivity && (
          <div className="mt-0.5 truncate text-[10px] capitalize leading-tight text-foreground/50">
            <span className="mr-1">•</span>
            {entry.activityType}
          </div>
        )}
      </div>
    </div>
  );
}
