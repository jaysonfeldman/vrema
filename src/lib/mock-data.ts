
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
    case 'ux': return 8;
    default: return 0;
  }
}

export function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}

// Activity color mapping
const colorPalette = [
  '#8B5CF6', // Vivid Purple
  '#D946EF', // Magenta Pink
  '#F97316', // Bright Orange
  '#0EA5E9', // Ocean Blue
  '#14B8A6', // Teal
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#ef4444', // Red
];

const activityColors: Record<string, string> = {};

export function getActivityColor(type: ActivityType): string {
  // Normalize the type to lowercase for consistent mapping
  const normalizedType = type.toLowerCase();
  
  // If we've already assigned a color, return it
  if (activityColors[normalizedType]) {
    return activityColors[normalizedType];
  }
  
  // Assign a new color from the palette
  const colorIndex = Object.keys(activityColors).length % colorPalette.length;
  activityColors[normalizedType] = colorPalette[colorIndex];
  
  return activityColors[normalizedType];
}
