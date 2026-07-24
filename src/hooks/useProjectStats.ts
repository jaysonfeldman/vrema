import { useMemo } from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { useTeamStore } from '@/hooks/useTeamStore';
import { computeProjectsFromEvents, computeWeeklyProjectHours, getDateRange } from '@/lib/eventStats';
import { timeEntryToCalendarEvent } from '@/lib/timeEntryUtils';
import type { GoogleCalendarEvent } from '@/lib/types';

export function useProjectStats() {
  const { events, filters, customProjects, excludedProjects } = useSharedState();
  const { authState } = useGoogleAuth();
  const hoursScope = useTeamStore((s) => s.hoursScope);
  const members = useTeamStore((s) => s.members);
  const timeEntries = useTeamStore((s) => s.timeEntries);
  const excludedSet = useMemo(
    () => new Set(excludedProjects.map((p) => p.toLowerCase())),
    [excludedProjects]
  );

  const teamMembers = useMemo(() => {
    if (members.length > 0) {
      return members
        .filter((m) => m.status !== 'pending')
        .map((m) => ({
          id: m.id,
          name: m.name,
          imageUrl: m.imageUrl,
          hoursLogged: m.hoursLogged,
          email: m.email,
          role: m.role,
          status: m.status,
        }));
    }

    if (!authState.user) return [];

    return [
      {
        id: authState.user.id,
        name: authState.user.name,
        imageUrl: authState.user.imageUrl,
        hoursLogged: 0,
      },
    ];
  }, [members, authState.user]);

  const mergedEvents = useMemo(() => {
    const ownerId = authState.user?.id;
    const entryEvents: GoogleCalendarEvent[] = timeEntries
      .filter((entry) => {
        if (entry.status !== 'confirmed') return false;
        if (excludedSet.has(entry.projectName.toLowerCase())) return false;
        if (hoursScope === 'me') {
          return !ownerId || entry.memberId === ownerId;
        }
        return true;
      })
      .map(timeEntryToCalendarEvent);

    // Google Calendar events belong to the signed-in user ("me").
    // In team scope they still count toward the owner's hours.
    const googleEvents =
      hoursScope === 'me' || hoursScope === 'team' ? events : [];

    // Avoid double-counting when a manual entry was created from the same Google event id.
    const entryIds = new Set(entryEvents.map((e) => e.id));
    const filteredGoogle = googleEvents.filter((e) => !entryIds.has(`entry-${e.id}`) && !entryIds.has(e.id));

    const googleWithoutExcluded = filteredGoogle.filter((event) => {
      if (!event.summary?.includes('#')) return true;
      const projectName = event.summary.split('#')[0]?.trim().toLowerCase() ?? '';
      return !excludedSet.has(projectName);
    });

    return [...googleWithoutExcluded, ...entryEvents];
  }, [events, timeEntries, hoursScope, authState.user?.id, excludedSet]);

  const { startDate, endDate } = useMemo(() => getDateRange(filters.dateRange), [filters.dateRange]);

  const filteredProjects = useMemo(() => {
    return computeProjectsFromEvents(mergedEvents, {
      startDate,
      endDate,
      teamMembers,
      settings: customProjects,
    }).filter((p) => !excludedSet.has(p.id.toLowerCase()) && !excludedSet.has(p.name.toLowerCase()));
  }, [mergedEvents, startDate, endDate, teamMembers, customProjects, excludedSet]);

  const allProjects = useMemo(() => {
    return computeProjectsFromEvents(mergedEvents, { teamMembers, settings: customProjects }).filter(
      (p) => !excludedSet.has(p.id.toLowerCase()) && !excludedSet.has(p.name.toLowerCase())
    );
  }, [mergedEvents, teamMembers, customProjects, excludedSet]);

  const weeklySummaries = useMemo(() => {
    return computeWeeklyProjectHours(mergedEvents, 4).map((week) => ({
      ...week,
      projects: week.projects.filter((p) => !excludedSet.has(p.id.toLowerCase()) && !excludedSet.has(p.name.toLowerCase())),
      totalHours: week.projects
        .filter((p) => !excludedSet.has(p.id.toLowerCase()) && !excludedSet.has(p.name.toLowerCase()))
        .reduce((sum, p) => sum + p.hours, 0),
    }));
  }, [mergedEvents, excludedSet]);

  const memberHourBreakdown = useMemo(() => {
    return teamMembers.map((member) => {
      const hours = timeEntries
        .filter((entry) => {
          if (entry.memberId !== member.id || entry.status !== 'confirmed') return false;
          const s = new Date(entry.startTime);
          return s >= startDate && s <= endDate;
        })
        .reduce((sum, entry) => {
          const start = new Date(entry.startTime).getTime();
          const end = new Date(entry.endTime).getTime();
          return sum + Math.max(0, (end - start) / (1000 * 60 * 60));
        }, 0);

      // Attribute Google events to the owner in the breakdown
      const googleHours =
        member.id === authState.user?.id
          ? computeProjectsFromEvents(events, { startDate, endDate }).reduce((s, p) => s + p.totalHours, 0)
          : 0;

      return { member, hours: hours + googleHours };
    });
  }, [teamMembers, timeEntries, startDate, endDate, events, authState.user?.id]);

  return {
    filteredProjects,
    allProjects,
    weeklySummaries,
    memberHourBreakdown,
    mergedEvents,
  };
}
