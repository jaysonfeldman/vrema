export type ActivityType = string;

export interface Activity {
  id: string;
  type: ActivityType;
  hours: number;
  description?: string;
  date: Date;
  hidden?: boolean;
  color?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  imageUrl: string;
  hoursLogged: number;
  weeklyHours?: { [key: string]: number }; // e.g. { 'WK 40': 10, 'WK 41': 5 }
}

export interface Project {
  id: string;
  name: string;
  filterTerm?: string;
  totalHours: number;
  hourlyRate?: number;
  budgetHours?: number;
  teamMembers: TeamMember[];
  activities: Activity[];
  color?: string;
  monthlyHours?: number; // Hours logged in the current month
  visible?: boolean;     // Whether the project is visible in the UI
}

export interface WeekData {
  weekNumber: number;
  hours: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start?: {
    dateTime: string;
    timeZone?: string;
  };
  end?: {
    dateTime: string;
    timeZone?: string;
  };
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
  activity: string;
  selectedProjects?: string[];
  selectedActivities?: string[]; // Added for multi-select activities
}

export interface ParsedEvent {
  projectName: string;
  activityType: ActivityType;
  description: string;
}
