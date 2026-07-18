import { useMemo } from 'react';
import { useSharedState } from '@/hooks/useSharedState';
import { useGoogleAuth } from '@/providers/GoogleAuthProvider';
import { computeProjectsFromEvents, computeWeeklyProjectHours, getDateRange } from '@/lib/eventStats';

export function useProjectStats() {
  const { events, filters, customProjects } = useSharedState();
  const { authState } = useGoogleAuth();

  const teamMembers = useMemo(() => {
    if (!authState.user) {
      return [];
    }

    return [{
      id: authState.user.id,
      name: authState.user.name,
      imageUrl: authState.user.imageUrl,
      hoursLogged: 0,
    }];
  }, [authState.user]);

  const { startDate, endDate } = useMemo(() => getDateRange(filters.dateRange), [filters.dateRange]);

  const filteredProjects = useMemo(() => {
    return computeProjectsFromEvents(events, {
      startDate,
      endDate,
      teamMembers,
      settings: customProjects,
    });
  }, [events, startDate, endDate, teamMembers, customProjects]);

  const allProjects = useMemo(() => {
    return computeProjectsFromEvents(events, { teamMembers, settings: customProjects });
  }, [events, teamMembers, customProjects]);

  const weeklySummaries = useMemo(() => {
    return computeWeeklyProjectHours(events, 4);
  }, [events]);

  return {
    filteredProjects,
    allProjects,
    weeklySummaries,
  };
}
