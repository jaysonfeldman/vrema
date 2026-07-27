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

/** Persisted per-project settings (logos, rates, etc.) keyed by lowercase project id. */
export interface ProjectSettings {
  id: string;
  name?: string;
  logoUrl?: string;
  logoIcon?: string;
  hourlyRate?: number;
  budgetHours?: number | null;
  filterTerm?: string;
  color?: string;
}

const PROJECT_SETTINGS_KEY = 'vrema-project-settings';

function readProjectSettingsFromStorage(): Record<string, ProjectSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROJECT_SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProjectSettings>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProjectSettingsToStorage(settings: Record<string, ProjectSettings>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to persist project settings (storage full?)', error);
    throw error;
  }
}

function settingsToProjects(settings: Record<string, ProjectSettings>): Project[] {
  return Object.values(settings).map((item) => ({
    id: item.id,
    name: item.name || item.id,
    filterTerm: item.filterTerm,
    totalHours: 0,
    activities: [],
    teamMembers: [],
    budgetHours: item.budgetHours ?? undefined,
    hourlyRate: item.hourlyRate,
    color: item.color,
    logoUrl: item.logoUrl,
    logoIcon: item.logoIcon,
  }));
}

interface SharedState {
  events: GoogleCalendarEvent[];
  filteredEvents: GoogleCalendarEvent[];
  customProjects: Project[];
  /** Source of truth for logos / rates — survives refresh & logout. */
  projectSettings: Record<string, ProjectSettings>;
  projectFilters: Record<string, string>;
  filters: FilterOptions;
  lastSynced: Date | null;
  isLoading: boolean;
  activityColors: ActivityColor[];
  /** Explicit project names available in the calendar picker. */
  managedProjects: string[];
  /** Project names (lowercase) excluded from stats and pickers after deletion. */
  excludedProjects: string[];
  /** Activity types (lowercase) removed from Categories / calendar picker. */
  excludedActivities: string[];
  setEvents: (events: GoogleCalendarEvent[]) => void;
  setFilteredEvents: (events: GoogleCalendarEvent[]) => void;
  setCustomProjects: (projects: Project[]) => void;
  upsertProjectSettings: (project: Project) => void;
  setProjectFilters: (filters: Record<string, string>) => void;
  updateFilters: (filters: Partial<FilterOptions>) => void;
  setLastSynced: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
  updateActivityColor: (type: string, color: string) => void;
  ensureActivityColors: (types: string[]) => void;
  applyColorTemplate: (templateId: string, types?: string[]) => void;
  addManagedProject: (name: string) => void;
  excludeProject: (name: string) => void;
  addActivityType: (type: string) => void;
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

const initialProjectSettings = readProjectSettingsFromStorage();

export const useSharedState = create<SharedState>()(
  persist(
    (set, get) => ({
      events: [],
      filteredEvents: [],
      customProjects: settingsToProjects(initialProjectSettings),
      projectSettings: initialProjectSettings,
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
      excludedActivities: [],
      setEvents: (events) => set({ events }),
      setFilteredEvents: (filteredEvents) => set({ filteredEvents }),
      setCustomProjects: (customProjects) => set({ customProjects }),
      upsertProjectSettings: (project) => {
        const id = (project.id || project.name || '').trim().toLowerCase();
        if (!id) return;

        const nextEntry: ProjectSettings = {
          id,
          name: project.name?.trim() || id,
          logoUrl: project.logoUrl,
          logoIcon: project.logoIcon,
          hourlyRate: project.hourlyRate,
          budgetHours: project.budgetHours ?? null,
          filterTerm: project.filterTerm,
          color: project.color,
        };

        const projectSettings = {
          ...get().projectSettings,
          [id]: nextEntry,
        };

        writeProjectSettingsToStorage(projectSettings);
        set({
          projectSettings,
          customProjects: settingsToProjects(projectSettings),
        });
      },
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
              excludedActivities: state.excludedActivities.filter((a) => a !== key),
              activityColors: state.activityColors.map((ac) =>
                ac.type.toLowerCase() === key ? { ...ac, color } : ac
              ),
            };
          }
          return {
            excludedActivities: state.excludedActivities.filter((a) => a !== key),
            activityColors: [...state.activityColors, { type: key, color }],
          };
        }),
      ensureActivityColors: (types) => {
        const state = get();
        const excluded = new Set(state.excludedActivities.map((a) => a.toLowerCase()));
        const existing = new Set(state.activityColors.map((ac) => ac.type.toLowerCase()));
        const additions: ActivityColor[] = [];
        types.forEach((type) => {
          const key = type.trim().toLowerCase();
          if (!key || existing.has(key) || excluded.has(key)) return;
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
        set((state) => {
          const { [key]: _removed, ...rest } = state.projectSettings;
          try {
            writeProjectSettingsToStorage(rest);
          } catch {
            /* ignore */
          }
          return {
            excludedProjects: state.excludedProjects.includes(key)
              ? state.excludedProjects
              : [...state.excludedProjects, key],
            managedProjects: state.managedProjects.filter((p) => p.toLowerCase() !== key),
            projectSettings: rest,
            customProjects: settingsToProjects(rest),
          };
        });
      },
      removeActivityType: (type) => {
        const key = type.trim().toLowerCase();
        if (!key) return;
        set((state) => ({
          activityColors: state.activityColors.filter((ac) => ac.type.toLowerCase() !== key),
          excludedActivities: state.excludedActivities.includes(key)
            ? state.excludedActivities
            : [...state.excludedActivities, key],
        }));
      },
      addActivityType: (type) => {
        const trimmed = type.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        set((state) => {
          const withoutExcluded = state.excludedActivities.filter((a) => a !== key);
          if (state.activityColors.some((ac) => ac.type.toLowerCase() === key)) {
            return { excludedActivities: withoutExcluded };
          }
          return {
            excludedActivities: withoutExcluded,
            activityColors: [
              ...state.activityColors,
              { type: key, color: nextPaletteColor(state.activityColors.length) },
            ],
          };
        });
      },
    }),
    {
      name: 'vrema-activity-colors',
      partialize: (state) => ({
        activityColors: state.activityColors,
        managedProjects: state.managedProjects,
        excludedProjects: state.excludedProjects,
        excludedActivities: state.excludedActivities,
        projectSettings: state.projectSettings,
        customProjects: settingsToProjects(state.projectSettings),
      }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<SharedState>;
        const fromZustand = p.projectSettings || {};
        const fromBackup = readProjectSettingsFromStorage();
        // Prefer whichever has more logo data (backup key is the durable write path).
        const projectSettings = {
          ...fromZustand,
          ...fromBackup,
          ...Object.fromEntries(
            Object.entries(fromZustand).map(([id, settings]) => [
              id,
              {
                ...fromBackup[id],
                ...settings,
                logoUrl: settings.logoUrl || fromBackup[id]?.logoUrl,
                logoIcon: settings.logoIcon || fromBackup[id]?.logoIcon,
              },
            ])
          ),
        };
        return {
          ...current,
          ...p,
          projectSettings,
          customProjects: settingsToProjects(projectSettings),
        };
      },
    }
  )
);
