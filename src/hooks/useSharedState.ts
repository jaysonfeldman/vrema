import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleCalendarEvent, Project } from '@/lib/types';
import { COLOR_TEMPLATES, nextPaletteColor } from '@/lib/activityColors';

interface FilterOptions {
  searchTerm: string;
  project: string;
  dateRange: 'day' | 'week' | 'month' | 'year' | 'all';
  activity: string;
  selectedProjects: string[];
  selectedActivities: string[];
}

export interface ActivityColor {
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
  /** Explicit project names available in the calendar picker. */
  managedProjects: string[];
  /** Project names (lowercase) excluded from stats and pickers after deletion. */
  excludedProjects: string[];
  setEvents: (events: GoogleCalendarEvent[]) => void;
  setFilteredEvents: (events: GoogleCalendarEvent[]) => void;
  setCustomProjects: (projects: Project[]) => void;
  setProjectFilters: (filters: Record<string, string>) => void;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  setLastSynced: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateActivityColor: (type: string, color: string) => void;
  ensureActivityColors: (types: string[]) => void;
  applyColorTemplate: (templateId: string, types?: string[]) => void;
  addManagedProject: (name: string) => void;
  excludeProject: (name: string) => void;
  removeActivityType: (type: string) => void;
}

const defaultActivityColors: ActivityColor[] = [
  { type: 'design', color: '#22C55F' },
  { type: 'dev', color: '#6EE7B7' },
  { type: 'meetings', color: '#7ED3FC' },
  { type: 'marketing', color: '#FEF18B' },
  { type: 'admin', color: '#FED8AA' },
  { type: 'other', color: '#D946EF' },
];

export const useSharedState = create<SharedState>()(
  persist(
    (set, get) => ({
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
      },
      lastSynced: null,
      isLoading: false,
      activityColors: defaultActivityColors,
      managedProjects: [],
      excludedProjects: [],
      setEvents: (events) => set({ events }),
      setFilteredEvents: (filteredEvents) => set({ filteredEvents }),
      setCustomProjects: (customProjects) => set({ customProjects }),
      setProjectFilters: (projectFilters) => set({ projectFilters }),
      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      setLastSynced: (lastSynced) => set({ lastSynced }),
      setIsLoading: (isLoading) => set({ isLoading }),
      updateActivityColor: (type, color) =>
        set((state) => {
          const key = type.toLowerCase();
          const exists = state.activityColors.some((ac) => ac.type.toLowerCase() === key);
          if (exists) {
            return {
              activityColors: state.activityColors.map((ac) =>
                ac.type.toLowerCase() === key ? { ...ac, color } : ac
              ),
            };
          }
          return {
            activityColors: [...state.activityColors, { type: key, color }],
          };
        }),
      ensureActivityColors: (types) => {
        const state = get();
        const existing = new Set(state.activityColors.map((ac) => ac.type.toLowerCase()));
        const additions: ActivityColor[] = [];
        types.forEach((type) => {
          const key = type.trim().toLowerCase();
          if (!key || existing.has(key)) return;
          existing.add(key);
          additions.push({
            type: key,
            color: nextPaletteColor(state.activityColors.length + additions.length),
          });
        });
        if (additions.length === 0) return;
        set({ activityColors: [...state.activityColors, ...additions] });
      },
      applyColorTemplate: (templateId, types) => {
        const template = COLOR_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;
        set((state) => {
          const targets =
            types && types.length > 0
              ? types.map((t) => t.toLowerCase())
              : state.activityColors.map((ac) => ac.type.toLowerCase());

          const colorByType = new Map(state.activityColors.map((ac) => [ac.type.toLowerCase(), ac.color]));
          targets.forEach((type, index) => {
            colorByType.set(type, template.colors[index % template.colors.length]);
          });

          const next = Array.from(colorByType.entries()).map(([type, color]) => ({ type, color }));
          return { activityColors: next };
        });
      },
      addManagedProject: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        set((state) => {
          if (state.managedProjects.some((p) => p.toLowerCase() === key)) {
            return {
              excludedProjects: state.excludedProjects.filter((p) => p !== key),
            };
          }
          return {
            managedProjects: [...state.managedProjects, trimmed],
            excludedProjects: state.excludedProjects.filter((p) => p !== key),
          };
        });
      },
      excludeProject: (name) => {
        const key = name.trim().toLowerCase();
        if (!key) return;
        set((state) => ({
          excludedProjects: state.excludedProjects.includes(key)
            ? state.excludedProjects
            : [...state.excludedProjects, key],
          managedProjects: state.managedProjects.filter((p) => p.toLowerCase() !== key),
          customProjects: state.customProjects.filter((p) => p.id.toLowerCase() !== key && p.name.toLowerCase() !== key),
        }));
      },
      removeActivityType: (type) => {
        const key = type.trim().toLowerCase();
        if (!key) return;
        set((state) => ({
          activityColors: state.activityColors.filter((ac) => ac.type.toLowerCase() !== key),
        }));
      },
    }),
    {
      name: 'vrema-activity-colors',
      partialize: (state) => ({
        activityColors: state.activityColors,
        managedProjects: state.managedProjects,
        excludedProjects: state.excludedProjects,
      }),
    }
  )
);
