
export type ActivityType = 'design' | 'strategy' | 'dev' | 'meetings' | 'admin';

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
