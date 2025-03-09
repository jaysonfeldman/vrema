
import { Project, TeamMember, ActivityType } from './types';

// Create team members
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Roy de Groot',
    avatar: '/lovable-uploads/35c09f58-d9d4-4dc9-b5fc-c9882501f22c.png',
    hoursLogged: 32,
    weeklyHours: {
      'WK 40': 10,
      'WK 41': 10,
      'WK 42': 10,
      'WK 43': 2
    }
  },
  {
    id: '2',
    name: 'Ruben van Gaalen',
    avatar: '/lovable-uploads/35c09f58-d9d4-4dc9-b5fc-c9882501f22c.png',
    hoursLogged: 15,
    weeklyHours: {
      'WK 40': 5,
      'WK 41': 5,
      'WK 42': 5,
      'WK 43': 0
    }
  },
  {
    id: '3',
    name: 'Jayson Feldman',
    avatar: '/lovable-uploads/35c09f58-d9d4-4dc9-b5fc-c9882501f22c.png',
    hoursLogged: 5,
    weeklyHours: {
      'WK 40': 0,
      'WK 41': 0,
      'WK 42': 0,
      'WK 43': 5
    }
  }
];

// Create activities for each activity type
const createActivities = () => {
  const types: ActivityType[] = ['design', 'strategy', 'dev', 'meetings', 'admin'];
  const hours = {
    design: 40,
    strategy: 15,
    dev: 5,
    meetings: 12,
    admin: 3
  };
  
  return types.map((type, index) => ({
    id: `activity-${index}`,
    type,
    hours: hours[type],
    description: `${type} work`,
    date: new Date(2023, 9, 15 - index)
  }));
};

// Create projects
export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'Geldfit 3.0',
    totalHours: 52,
    budgetHours: 75,
    activities: createActivities(),
    teamMembers: teamMembers,
    color: '#1c1c1e'
  },
  {
    id: 'project-2',
    name: 'TimeTracker App',
    totalHours: 28,
    budgetHours: 40,
    activities: createActivities().map(a => ({...a, hours: Math.floor(a.hours * 0.6)})),
    teamMembers: teamMembers.slice(0, 2),
    color: '#1c1c1e'
  },
  {
    id: 'project-3',
    name: 'Website Redesign',
    totalHours: 18,
    budgetHours: 25,
    activities: createActivities().map(a => ({...a, hours: Math.floor(a.hours * 0.4)})),
    teamMembers: [teamMembers[0], teamMembers[2]],
    color: '#1c1c1e'
  }
];

// Helper functions
export function getTotalHours(): number {
  return projects.reduce((sum, project) => sum + project.totalHours, 0);
}

export function getActivityHours(type: ActivityType): number {
  return projects.reduce((sum, project) => {
    const activityHours = project.activities
      .filter(activity => activity.type === type)
      .reduce((actSum, activity) => actSum + activity.hours, 0);
    return sum + activityHours;
  }, 0);
}

export function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}
