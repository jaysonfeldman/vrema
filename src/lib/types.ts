
export type ActivityType = string;

export interface Activity {
  id: string;
  type: ActivityType;
  hours: number;
  description?: string;
  date: Date;
}

export interface Project {
  id: string;
  name: string;
  totalHours: number;
  budgetHours?: number;
  activities: Activity[];
  teamMembers: TeamMember[];
  color?: string;
  monthlyHours?: number; // Hours logged in the current month
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  hoursLogged: number;
  weeklyHours: { [key: string]: number }; // e.g. { 'WK 40': 10, 'WK 41': 5 }
}

export interface WeekData {
  weekNumber: number;
  hours: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
  }[];
  organizer?: {
    email: string;
    displayName?: string;
  };
  created?: string;
  updated?: string;
  status?: string;
  htmlLink?: string;
}

export interface GoogleAuthState {
  isAuthenticated: boolean;
  token: string | null;
  profile: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
  tokenExpiry?: string | null;
}

export interface FilterOptions {
  searchTerm: string;
  project: string;
  dateRange: number;
  activity?: string; // Added activity filter
}

export interface ParsedEvent {
  projectName: string;
  activityType: ActivityType;
  description: string;
}
