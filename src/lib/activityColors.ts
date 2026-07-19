/** Shared activity / category color system */

export const COLOR_PALETTE = [
  '#22C55F', // green
  '#6EE7B7', // turquoise
  '#7ED3FC', // sky
  '#FEF18B', // yellow
  '#FED8AA', // peach
  '#D946EF', // magenta
  '#F97316', // orange
  '#0EA5E9', // ocean
  '#A78BFA', // violet
  '#FB7185', // rose
  '#14B8A6', // teal
  '#94A3B8', // slate
] as const;

export type ColorTemplate = {
  id: string;
  name: string;
  description: string;
  colors: string[];
};

export const COLOR_TEMPLATES: ColorTemplate[] = [
  {
    id: 'fresh',
    name: 'Fresh',
    description: 'Green, turquoise, and sky',
    colors: ['#22C55F', '#6EE7B7', '#7ED3FC', '#FEF18B', '#FED8AA', '#D946EF'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Blues and teals',
    colors: ['#0EA5E9', '#06B6D4', '#22D3EE', '#67E8F9', '#2DD4BF', '#818CF8'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and pinks',
    colors: ['#F97316', '#FB923C', '#FBBF24', '#FB7185', '#E879F9', '#F43F5E'],
  },
  {
    id: 'berry',
    name: 'Berry',
    description: 'Violet, magenta, rose',
    colors: ['#A78BFA', '#D946EF', '#FB7185', '#F472B6', '#818CF8', '#C084FC'],
  },
];

export function nextPaletteColor(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}
