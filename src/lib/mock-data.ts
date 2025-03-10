
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

// Create activities for projects
const createActivities = (type: string, hours: number) => {
  return {
    id: `activity-${type}`,
    type,
    hours,
    description: `${type} work`,
    date: new Date(2023, 9, 15)
  };
};

// Create default projects that match the image
export const projects: Project[] = [
  {
    id: 'project-1',
    name: 'UMCU de Netwerkintake',
    totalHours: 120,
    budgetHours: 90,
    activities: [
      createActivities('design', 40),
      createActivities('strategy', 15),
      createActivities('dev', 5)
    ],
    teamMembers: teamMembers.slice(0, 2),
    color: '#1c1c1e',
    monthlyHours: 30  // Changed from boolean to number
  },
  {
    id: 'project-2',
    name: 'Wisebrick carbon shepherd',
    totalHours: 80,
    budgetHours: 128,
    activities: [
      createActivities('design', 50),
      createActivities('dev', 30)
    ],
    teamMembers: teamMembers,
    color: '#1c1c1e',
    monthlyHours: 60  // Changed from boolean to number
  },
  {
    id: 'project-3',
    name: 'Geldfit 3.0',
    totalHours: 52,
    budgetHours: 64,
    activities: [
      createActivities('design', 40),
      createActivities('strategy', 15),
      createActivities('pm', 5)
    ],
    teamMembers: teamMembers,
    color: '#1c1c1e',
    monthlyHours: 35  // Changed from boolean to number
  },
  {
    id: 'project-4',
    name: 'The Next Big Thing',
    totalHours: 110,
    budgetHours: 80,
    activities: [
      createActivities('design', 40),
      createActivities('strategy', 15)
    ],
    teamMembers: [teamMembers[0], teamMembers[2]],
    color: '#1c1c1e',
    monthlyHours: 42  // Changed from boolean to number
  }
];

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
    default: return 0;
  }
}

export function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}
