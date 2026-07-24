import type { LucideIcon } from 'lucide-react';
import {
  AppWindow,
  Briefcase,
  Building2,
  Code2,
  Compass,
  Cpu,
  Feather,
  Flame,
  FolderKanban,
  Gem,
  Globe2,
  Hexagon,
  Layers,
  Leaf,
  Lightbulb,
  Mountain,
  Palette,
  Rocket,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from 'lucide-react';

export type ProjectIconId =
  | 'rocket'
  | 'zap'
  | 'sparkles'
  | 'briefcase'
  | 'building'
  | 'globe'
  | 'code'
  | 'palette'
  | 'layers'
  | 'target'
  | 'flame'
  | 'leaf'
  | 'gem'
  | 'cpu'
  | 'compass'
  | 'mountain'
  | 'feather'
  | 'lightbulb'
  | 'workflow'
  | 'folder'
  | 'hexagon'
  | 'window';

export const PROJECT_ICONS: { id: ProjectIconId; label: string; icon: LucideIcon }[] = [
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'zap', label: 'Zap', icon: Zap },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'briefcase', label: 'Briefcase', icon: Briefcase },
  { id: 'building', label: 'Building', icon: Building2 },
  { id: 'globe', label: 'Globe', icon: Globe2 },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'palette', label: 'Palette', icon: Palette },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'target', label: 'Target', icon: Target },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'leaf', label: 'Leaf', icon: Leaf },
  { id: 'gem', label: 'Gem', icon: Gem },
  { id: 'cpu', label: 'CPU', icon: Cpu },
  { id: 'compass', label: 'Compass', icon: Compass },
  { id: 'mountain', label: 'Mountain', icon: Mountain },
  { id: 'feather', label: 'Feather', icon: Feather },
  { id: 'lightbulb', label: 'Idea', icon: Lightbulb },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'folder', label: 'Folder', icon: FolderKanban },
  { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
  { id: 'window', label: 'App', icon: AppWindow },
];

export function getProjectIcon(id?: string): LucideIcon | null {
  if (!id) return null;
  return PROJECT_ICONS.find((item) => item.id === id)?.icon ?? null;
}

export function projectInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || name.slice(0, 2).toUpperCase()
  );
}
