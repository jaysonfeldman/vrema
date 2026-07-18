import type { GoogleCalendarEvent } from './types';

export const isDevAuthBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';
export const DEV_ACCESS_TOKEN = 'dev-bypass-token';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const devCalendarEvents: GoogleCalendarEvent[] = [
  {
    id: 'dev-1',
    summary: 'mx#design user flows',
    start: { dateTime: hoursAgo(26).toISOString() },
    end: { dateTime: hoursAgo(24).toISOString() },
  },
  {
    id: 'dev-2',
    summary: 'mx#dev api integration',
    start: { dateTime: hoursAgo(30).toISOString() },
    end: { dateTime: hoursAgo(27).toISOString() },
  },
  {
    id: 'dev-3',
    summary: 'mx#meetings client sync',
    start: { dateTime: hoursAgo(50).toISOString() },
    end: { dateTime: hoursAgo(49).toISOString() },
  },
  {
    id: 'dev-4',
    summary: 'client#design homepage wireframes',
    start: { dateTime: hoursAgo(52).toISOString() },
    end: { dateTime: hoursAgo(48).toISOString() },
  },
  {
    id: 'dev-5',
    summary: 'client#dev bug fixes',
    start: { dateTime: daysAgo(8).toISOString() },
    end: { dateTime: new Date(daysAgo(8).getTime() + 3 * 60 * 60 * 1000).toISOString() },
  },
  {
    id: 'dev-6',
    summary: 'mx#strategy roadmap review',
    start: { dateTime: daysAgo(10).toISOString() },
    end: { dateTime: new Date(daysAgo(10).getTime() + 2 * 60 * 60 * 1000).toISOString() },
  },
];
