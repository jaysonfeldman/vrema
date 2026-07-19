import { useState } from 'react';
import { useTheme } from 'next-themes';
import { CalendarDays, Clock, FolderKanban, Hash, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Segment = 'project' | 'hash' | 'activity' | 'description';

const tones = {
  green: {
    light: { bg: '#22C55F2E', text: '#15803D' },
    dark: { bg: 'rgba(34, 197, 95, 0.18)', text: '#86EFAC' },
  },
  amber: {
    light: { bg: '#FED8AA88', text: '#C2410C' },
    dark: { bg: 'rgba(251, 146, 60, 0.18)', text: '#FDBA74' },
  },
  blue: {
    light: { bg: '#7ED3FC55', text: '#0369A1' },
    dark: { bg: 'rgba(56, 189, 248, 0.18)', text: '#7DD3FC' },
  },
  muted: {
    light: { bg: '#e8e8e8', text: '#525252' },
    dark: { bg: 'rgba(255, 255, 255, 0.08)', text: '#A1A1AA' },
  },
} as const;

const segmentTone: Record<Segment, keyof typeof tones> = {
  project: 'green',
  hash: 'muted',
  activity: 'amber',
  description: 'blue',
};

function useToneMode() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? 'dark' : 'light';
}

function Pill({
  tone,
  children,
  onHover,
}: {
  tone: keyof typeof tones;
  children: React.ReactNode;
  onHover?: (active: boolean) => void;
}) {
  const mode = useToneMode();
  const { bg, text } = tones[tone][mode];
  return (
    <span
      className="inline-flex cursor-default items-center rounded-md px-2.5 py-0.5 font-mono text-[0.9em] font-medium transition-opacity hover:opacity-90"
      style={{ backgroundColor: bg, color: text }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {children}
    </span>
  );
}

function ExamplePart({
  segment,
  active,
  children,
}: {
  segment: Segment;
  active: Segment | null;
  children: React.ReactNode;
}) {
  const mode = useToneMode();
  const isActive = active === segment;
  const isDimmed = active !== null && !isActive;
  const color = tones[segmentTone[segment]][mode].text;

  return (
    <span
      className={cn(
        'transition-all duration-150',
        isActive && 'font-semibold',
        isDimmed && 'text-foreground/25'
      )}
      style={isActive ? { color } : undefined}
    >
      {children}
    </span>
  );
}

const examples = [
  { project: 'vrema', activity: 'design', rest: ' landing page' },
  { project: 'northstar', activity: 'dev', rest: ' checkout flow' },
  { project: 'studio', activity: 'meetings', rest: ' weekly sync' },
];

export default function Guide() {
  const [active, setActive] = useState<Segment | null>(null);

  const setHover = (segment: Segment) => (hovered: boolean) => {
    setActive(hovered ? segment : null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pt-6 md:pt-8">
      <header className="space-y-3">
        <div className="space-y-2">
          <p className="text-base font-semibold tracking-tight text-foreground/30">Guide</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">How Vrema works</h1>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Your calendar already knows how you spend your day. Block time as you normally would,
            give each event a short title, and sync. Vrema turns those events into clear projects,
            activities, and hours. No timers to start or stop.
          </p>
          <p>
            Title your events with this simple format. We’ll handle the categorization and time
            tracking from there.
          </p>
          <p className="flex flex-wrap items-center gap-1.5">
            <span>Title format:</span>
            <Pill tone="green" onHover={setHover('project')}>
              project
            </Pill>
            <Pill tone="muted" onHover={setHover('hash')}>
              #
            </Pill>
            <Pill tone="amber" onHover={setHover('activity')}>
              activity
            </Pill>
            <Pill tone="blue" onHover={setHover('description')}>
              description
            </Pill>
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-base font-medium">Example</h2>

        <div className="space-y-4 rounded-xl bg-[#f6f6f6] p-4 dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Calendar event
              </p>
              <p className="font-mono text-sm text-foreground">
                <ExamplePart segment="project" active={active}>
                  vrema
                </ExamplePart>
                <ExamplePart segment="hash" active={active}>
                  #
                </ExamplePart>
                <ExamplePart segment="activity" active={active}>
                  design
                </ExamplePart>
                <ExamplePart segment="description" active={active}>
                  {' '}
                  landing page
                </ExamplePart>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
              <Clock className="size-3" />
              9:00 – 11:30
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">Project</p>
              <p className="mt-1.5 font-mono text-sm text-foreground">vrema</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">Activity</p>
              <p className="mt-1.5 font-mono text-sm text-foreground">#design</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">Description</p>
              <p className="mt-1.5 font-mono text-sm text-foreground">landing page</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/[0.06]">
              <p className="text-[11px] text-muted-foreground">Hours</p>
              <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-foreground">
                2:30
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <code
              key={`${ex.project}-${ex.activity}-${ex.rest}`}
              className="rounded-lg bg-[#f6f6f6] px-2 py-1.5 font-mono text-xs text-foreground dark:bg-white/[0.04]"
            >
              {ex.project}#{ex.activity}
              {ex.rest}
            </code>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Tips</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2.5">
            <Hash className="mt-0.5 size-3.5 shrink-0 text-foreground/35" />
            <span>Events without hashtags are ignored.</span>
          </li>
          <li className="flex gap-2.5">
            <FolderKanban className="mt-0.5 size-3.5 shrink-0 text-foreground/35" />
            Reuse the same project name so hours stay grouped.
          </li>
          <li className="flex gap-2.5">
            <RefreshCw className="mt-0.5 size-3.5 shrink-0 text-foreground/35" />
            Sync from the top bar after you add or edit events.
          </li>
        </ul>
      </section>
    </div>
  );
}
