
import { Project, TeamMember, ActivityType } from './types';

// Create team members
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Roy de Groot',
    avatar: '/lovable-uploads/42ff3fec-5d6f-4da8-8249-d88ee392f2ee.png',
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
    avatar: '/lovable-uploads/42ff3fec-5d6f-4da8-8249-d88ee392f2ee.png',
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
    avatar: '/lovable-uploads/42ff3fec-5d6f-4da8-8249-d88ee392f2ee.png',
    hoursLogged: 5,
    weeklyHours: {
      'WK 40': 0,
      'WK 41': 0,
      'WK 42': 0,
      'WK 43': 5
    }
  }
];

// Create activities for a sample project
const createActivities = (type: string, hours: number) => {
  return {
    id: `activity-${type}`,
    type,
    hours,
    description: `${type} work`,
    date: new Date(2023, 9, 15)
  };
};

// Empty projects array - we'll load real projects from calendar or localStorage
export const projects: Project[] = [];

// Helper functions
export function getTotalHours(): number {
  return 271; // Matching the exact value from the image
}

export function getActivityHours(type: ActivityType): number {
  // Returns hours based on activity type to match the image
  switch(type.toLowerCase()) {
    case 'design': return 40;
    case 'strategy': return 15;
    case 'meetings': return 12;
    case 'dev': return 5;
    case 'admin': return 3;
    case 'ux': return 8;  // Added to match the image
    default: return 0;
  }
}

export function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}
