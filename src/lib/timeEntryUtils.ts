import {
  addDays,
  addMinutes,
  differenceInMinutes,
  format,
  getDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { parseEventTitle } from '@/services/googleCalendarService';
import type { GoogleCalendarEvent, TimeEntry } from '@/lib/types';

export const SNAP_MINUTES = 15;
export const HOUR_HEIGHT = 64;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;
export const DEFAULT_VIEW_START_HOUR = 7;

export function snapMinutes(totalMinutes: number, snap = SNAP_MINUTES): number {
  return Math.round(totalMinutes / snap) * snap;
}

export function minutesToHeight(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function heightToMinutes(height: number): number {
  return (height / HOUR_HEIGHT) * 60;
}

export function yToMinutesInDay(y: number, snap = SNAP_MINUTES): number {
  const raw = heightToMinutes(y);
  const clamped = Math.max(0, Math.min(24 * 60 - snap, snapMinutes(raw, snap)));
  return clamped;
}

export function getWeekDays(reference: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(reference, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function entryDurationHours(entry: Pick<TimeEntry, 'startTime' | 'endTime'>): number {
  const start = new Date(entry.startTime);
  const end = new Date(entry.endTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours > 0 ? hours : 0;
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, 'HH:mm')} → ${format(end, 'HH:mm')}`;
}

export function formatCompactTime(date: Date): string {
  return format(date, 'HH:mm');
}

/** Compact duration like "2h", "45m", or "1h 30m". */
export function formatCompactDuration(start: Date, end: Date): string {
  const minutes = Math.max(0, differenceInMinutes(end, start));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatCompactDurationFromMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function minutesFromMidnight(date: Date): number {
  return getHours(date) * 60 + getMinutes(date);
}

export function dateFromDayAndMinutes(day: Date, minutes: number): Date {
  const base = startOfDay(day);
  return setSeconds(setMinutes(setHours(base, Math.floor(minutes / 60)), minutes % 60), 0);
}

export function ensureMinDuration(start: Date, end: Date, minMinutes = SNAP_MINUTES): { start: Date; end: Date } {
  if (differenceInMinutes(end, start) < minMinutes) {
    return { start, end: addMinutes(start, minMinutes) };
  }
  return { start, end };
}

/** Convert a time entry into a Google-calendar-shaped event for the existing stats pipeline. */
export function timeEntryToCalendarEvent(entry: TimeEntry): GoogleCalendarEvent {
  const title = entry.title.trim() || 'Untitled';
  const project = entry.projectName.trim() || 'General';
  const activity = entry.activityType.trim() || 'other';
  return {
    id: `entry-${entry.id}`,
    summary: `${project}#${activity} ${title}`,
    start: { dateTime: entry.startTime },
    end: { dateTime: entry.endTime },
  };
}

/** Show timed Google events; only tagged events contribute to project tracking. */
export function googleEventToTimeEntry(
  event: GoogleCalendarEvent,
  memberId: string
): TimeEntry | null {
  if (!event.start?.dateTime || !event.end?.dateTime) {
    return null;
  }

  const tagged = event.summary?.includes('#');
  const { projectName, activityType, description } = tagged
    ? parseEventTitle(event.summary)
    : { projectName: 'Google Calendar', activityType: 'other', description: event.summary || 'Untitled event' };
  const startTime = event.start.dateTime;
  const endTime = event.end.dateTime;
  if (new Date(endTime).getTime() <= new Date(startTime).getTime()) return null;

  return {
    id: `google-${event.id}`,
    title: description || `${projectName} · ${activityType}`,
    description: description || undefined,
    projectId: tagged ? projectName.toLowerCase() : null,
    projectName,
    activityType,
    startTime,
    endTime,
    memberId,
    status: 'confirmed',
    source: 'google',
    createdAt: startTime,
    updatedAt: startTime,
  };
}

/** Map synced timed Google Calendar events into the week calendar. */
export function googleEventsToTimeEntries(
  events: GoogleCalendarEvent[],
  memberId: string,
  excludedProjects: Set<string> = new Set()
): TimeEntry[] {
  const entries: TimeEntry[] = [];
  for (const event of events) {
    const entry = googleEventToTimeEntry(event, memberId);
    if (!entry) continue;
    if (excludedProjects.has(entry.projectName.toLowerCase())) continue;
    entries.push(entry);
  }
  return entries;
}

export function isGoogleTimeEntry(entry: Pick<TimeEntry, 'id' | 'source'>): boolean {
  return entry.source === 'google' || entry.id.startsWith('google-');
}

export function isTimeEntryEventId(id: string): boolean {
  return id.startsWith('entry-');
}

export function getEntryAtPosition(
  entries: TimeEntry[],
  day: Date,
  minutes: number,
  memberId?: string
): TimeEntry | undefined {
  const dayKey = format(day, 'yyyy-MM-dd');
  return entries.find((entry) => {
    if (memberId && entry.memberId !== memberId) return false;
    const start = new Date(entry.startTime);
    const end = new Date(entry.endTime);
    if (format(start, 'yyyy-MM-dd') !== dayKey) return false;
    const startMin = minutesFromMidnight(start);
    const endMin = minutesFromMidnight(end);
    return minutes >= startMin && minutes < endMin;
  });
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function dayIndexInWeek(date: Date, weekStartsOn: 0 | 1 = 1): number {
  const d = getDay(date);
  if (weekStartsOn === 1) return d === 0 ? 6 : d - 1;
  return d;
}

export type TimedSpan = {
  id: string;
  startMinutes: number;
  endMinutes: number;
};

/** Column placement for overlapping events (Notion / Google Calendar style). */
export type OverlapPlacement = {
  id: string;
  /** 0-based column within the collision cluster. */
  column: number;
  /** How many columns wide this event can expand into (always ≥ 1). */
  colSpan: number;
  /** Total columns in the collision cluster. */
  columnCount: number;
};

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Pack overlapping timed spans into columns and expand each span into free
 * columns on its right — same idea as Notion Calendar cascading cards.
 */
export function computeOverlapLayout(spans: TimedSpan[]): Map<string, OverlapPlacement> {
  const result = new Map<string, OverlapPlacement>();
  if (spans.length === 0) return result;

  const sorted = [...spans].sort(
    (a, b) =>
      a.startMinutes - b.startMinutes ||
      b.endMinutes - a.endMinutes ||
      a.id.localeCompare(b.id)
  );

  // Greedy leftmost column assignment
  const columnEndTimes: number[] = [];
  const placed: (TimedSpan & { column: number })[] = [];

  for (const span of sorted) {
    let column = columnEndTimes.findIndex((end) => end <= span.startMinutes);
    if (column === -1) {
      column = columnEndTimes.length;
      columnEndTimes.push(span.endMinutes);
    } else {
      columnEndTimes[column] = span.endMinutes;
    }
    placed.push({ ...span, column });
  }

  // Connected clusters by overlapping time ranges
  const byStart = [...placed].sort((a, b) => a.startMinutes - b.startMinutes);
  let cluster: (TimedSpan & { column: number })[] = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const columnCount = Math.max(...cluster.map((e) => e.column)) + 1;

    for (const ev of cluster) {
      let colSpan = 1;
      for (let c = ev.column + 1; c < columnCount; c += 1) {
        const blocked = cluster.some(
          (other) =>
            other.id !== ev.id &&
            other.column === c &&
            rangesOverlap(ev.startMinutes, ev.endMinutes, other.startMinutes, other.endMinutes)
        );
        if (blocked) break;
        colSpan += 1;
      }

      result.set(ev.id, {
        id: ev.id,
        column: ev.column,
        colSpan,
        columnCount,
      });
    }

    cluster = [];
    clusterEnd = -1;
  };

  for (const ev of byStart) {
    if (cluster.length > 0 && ev.startMinutes >= clusterEnd) flushCluster();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMinutes);
  }
  flushCluster();

  return result;
}
