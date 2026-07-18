import { create } from 'zustand';
import { GoogleCalendarEvent, Project } from '@/lib/types';

interface FilterOptions {
  searchTerm: string;
  project: string;
  dateRange: 'day' | 'week' | 'month' | 'year' | 'all';
  activity: string;
  selectedProjects: string[];
  selectedActivities: string[];
  startDate?: Date;
  endDate?: Date;
}

interface ActivityColor {
  type: string;
  color: string;
}

interface SharedState {
  events: GoogleCalendarEvent[];
  filteredEvents: GoogleCalendarEvent[];
  customProjects: Project[];
  projectFilters: Record<string, string>;
  filters: FilterOptions;
  lastSynced: Date | null;
  isLoading: boolean;
  activityColors: ActivityColor[];
  setEvents: (events: GoogleCalendarEvent[]) => void;
  setFilteredEvents: (events: GoogleCalendarEvent[]) => void;
  setCustomProjects: (projects: Project[]) => void;
  setProjectFilters: (filters: Record<string, string>) => void;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  setLastSynced: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateActivityColor: (type: string, color: string) => void;
}

export const useSharedState = create<SharedState>((set) => ({
  events: [],
  filteredEvents: [],
  customProjects: [],
  projectFilters: {},
  filters: {
    searchTerm: '',
    project: 'All',
    dateRange: 'week',
    activity: 'All',
    selectedProjects: [],
    selectedActivities: [],
    startDate: new Date(),
    endDate: new Date()
  },
  lastSynced: null,
  isLoading: false,
  activityColors: [
    { type: 'design', color: '#22C55F' },  // Green
    { type: 'dev', color: '#6EE7B7' },     // Light green
    { type: 'meeting', color: '#D1FAE5' }, // Mint
    { type: 'marketing', color: '#FEF18B' }, // Yellow
    { type: 'other', color: '#FED8AA' },    // Orange
    { type: 'admin', color: '#7ED3FC' }, // Blue
  ],
  setEvents: (events) => set({ events }),
  setFilteredEvents: (filteredEvents) => set({ filteredEvents }),
  setCustomProjects: (customProjects) => set({ customProjects }),
  setProjectFilters: (projectFilters) => set({ projectFilters }),
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  setLastSynced: (lastSynced) => set({ lastSynced }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateActivityColor: (type, color) => set((state) => ({
    activityColors: state.activityColors.map(ac => 
      ac.type === type ? { ...ac, color } : ac
    )
  }))
})); 