import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  subWeeks,
} from 'date-fns';
import { GoogleCalendarEvent, Project, TeamMember } from '@/lib/types';
import { parseEventTitle } from '@/services/googleCalendarService';

export type DateRange = 'day' | 'week' | 'month' | 'year' | 'all';

export function getDateRange(range: DateRange, reference = new Date()): { startDate: Date; endDate: Date } {
  switch (range) {
    case 'day':
      return { startDate: startOfDay(reference), endDate: endOfDay(reference) };
    case 'week':
      return {
        startDate: startOfWeek(reference, { weekStartsOn: 1 }),
        endDate: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case 'month':
      return { startDate: startOfMonth(reference), endDate: endOfMonth(reference) };
    case 'year':
      return { startDate: startOfYear(reference), endDate: endOfYear(reference) };
    case 'all':
    default:
      return { startDate: new Date(0), endDate: new Date(8640000000000000) };
  }
}

export function getEventDurationHours(event: GoogleCalendarEvent): number | null {
  if (!event.start?.dateTime || !event.end?.dateTime) {
    return null;
  }

  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  return hours > 0 ? hours : null;
}

export function computeProjectsFromEvents(
  events: GoogleCalendarEvent[],
  options?: {
    startDate?: Date;
    endDate?: Date;
    teamMembers?: TeamMember[];
    settings?: Project[];
  }
): Project[] {
  const { startDate, endDate, teamMembers = [], settings = [] } = options ?? {};
  const projectMap = new Map<string, Project>();

  events.forEach((event) => {
    // Only track events that follow the {project}#{activity} naming convention.
    // Regular calendar events (meetings, personal, all-day) are ignored.
    if (!event.summary || !event.summary.includes('#')) {
      return;
    }

    const hours = getEventDurationHours(event);
    if (hours === null) {
      return;
    }

    const eventStart = new Date(event.start!.dateTime!);

    if (startDate && endDate && (eventStart < startDate || eventStart > endDate)) {
      return;
    }

    const { projectName, activityType, description } = parseEventTitle(event.summary);
    const projectId = projectName.toLowerCase();
    const savedSettings = settings.find(
      (project) => project.id.toLowerCase() === projectId || project.name.toLowerCase() === projectId
    );

    if (!projectMap.has(projectId)) {
      projectMap.set(projectId, {
        id: projectId,
        name: savedSettings?.name?.trim() || projectName,
        filterTerm: savedSettings?.filterTerm || projectId,
        totalHours: 0,
        activities: [],
        teamMembers,
        budgetHours: savedSettings?.budgetHours ?? null,
        hourlyRate: savedSettings?.hourlyRate,
        color: savedSettings?.color,
        logoUrl: savedSettings?.logoUrl,
        logoIcon: savedSettings?.logoIcon,
      });
    }

    const project = projectMap.get(projectId)!;
    project.totalHours += hours;

    const existingActivity = project.activities.find(
      (activity) => activity.type.toLowerCase() === activityType.toLowerCase()
    );

    if (existingActivity) {
      existingActivity.hours += hours;
    } else {
      project.activities.push({
        id: `${projectId}-${activityType.toLowerCase()}`,
        type: activityType,
        hours,
        description,
        date: eventStart,
      });
    }
  });

  return Array.from(projectMap.values()).sort((a, b) => b.totalHours - a.totalHours);
}

export interface WeeklyProjectSummary {
  weekLabel: string;
  weekStart: Date;
  weekEnd: Date;
  projects: { id: string; name: string; hours: number }[];
  totalHours: number;
}

export function computeWeeklyProjectHours(
  events: GoogleCalendarEvent[],
  weeks = 4
): WeeklyProjectSummary[] {
  const now = new Date();
  const summaries: WeeklyProjectSummary[] = [];

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const referenceDate = subWeeks(now, offset);
    const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
    const weekProjects = computeProjectsFromEvents(events, { startDate: weekStart, endDate: weekEnd });

    summaries.push({
      weekLabel: offset === 0 ? 'This week' : format(weekStart, 'd MMM'),
      weekStart,
      weekEnd,
      projects: weekProjects.map((project) => ({
        id: project.id,
        name: project.name,
        hours: project.totalHours,
      })),
      totalHours: weekProjects.reduce((sum, project) => sum + project.totalHours, 0),
    });
  }

  return summaries;
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}
