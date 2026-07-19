import type { GoogleCalendarEvent } from './types';

/** Token used by the public landing-page product preview. */
export const DEMO_ACCESS_TOKEN = 'demo-preview-token';

const hoursFromWeekStart = (dayOffset: number, hour: number, durationHours: number) => {
  const now = new Date();
  const day = now.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset + dayOffset);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return { start, end };
};

const event = (
  id: string,
  summary: string,
  dayOffset: number,
  hour: number,
  durationHours: number
): GoogleCalendarEvent => {
  const { start, end } = hoursFromWeekStart(dayOffset, hour, durationHours);
  return {
    id,
    summary,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
};

/** Sample week matching the marketing dashboard (neon / vrema / sasha). */
export const demoCalendarEvents: GoogleCalendarEvent[] = [
  event('demo-1', 'vrema#marketing landing page copy', 0, 9, 1.5),
  event('demo-2', 'neon#dev api integration', 0, 11, 1),
  event('demo-3', 'neon#design user flows', 0, 14, 1),
  event('demo-4', 'neon#admin standup notes', 1, 9, 1),
  event('demo-5', 'sasha#cooking meal prep', 1, 12, 1),
  event('demo-6', 'sasha#chilling evening walk', 1, 18, 0.75),
  event('demo-7', 'vrema#other inbox zero', 2, 10, 0.5),
  event('demo-8', 'vrema#marketing social posts', 2, 15, 0.5),
  event('demo-9', 'neon#dev bug fixes', 3, 9, 1),
  event('demo-10', 'sasha#cooking dinner', 3, 17, 0.5),
  event('demo-11', 'vrema#marketing waitlist launch', 4, 10, 1),
  event('demo-12', 'neon#design homepage polish', 4, 13, 0.5),
];

export const demoUser = {
  id: 'demo-user',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  imageUrl: '',
};
