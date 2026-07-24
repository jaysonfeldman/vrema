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
  email?: string;
  role?: TeamMemberRole;
  status?: TeamMemberStatus;
}

export type TeamMemberRole = 'owner' | 'member';
export type TeamMemberStatus = 'active' | 'pending';

/** Manual time log created on the calendar (drag-to-create). */
export interface TimeEntry {
  id: string;
  title: string;
  description?: string;
  projectId: string | null;
  projectName: string;
  activityType: ActivityType;
  /** Optional override color for this event block on the calendar. */
  color?: string;
  startTime: string;
  endTime: string;
  memberId: string;
  status: 'confirmed' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvite {
  id: string;
  token: string;
  name: string;
  email: string;
  invitedById: string;
  invitedByName: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'revoked';
  acceptedAt?: string;
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
  /** Optional project / company logo shown on dashboard cards. */
  logoUrl?: string;
  /** Lucide icon id from the project icon library (used when no logoUrl). */
  logoIcon?: string;
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
