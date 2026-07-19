import { useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { formatHours } from '@/lib/eventStats';
import { COLOR_PALETTE, COLOR_TEMPLATES } from '@/lib/activityColors';
import { useActivityColor } from '@/components/ActivityBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sounds';

export default function Categories() {
  const { activityColors, updateActivityColor, ensureActivityColors, applyColorTemplate } =
    useSharedState();
  const { allProjects } = useProjectStats();
  const getColor = useActivityColor();

  const categories = useMemo(() => {
    const map = new Map<string, { type: string; hours: number }>();
    allProjects.forEach((project) => {
      project.activities.forEach((activity) => {
        const key = activity.type.toLowerCase();
        const entry = map.get(key) ?? { type: activity.type, hours: 0 };
        entry.hours += activity.hours;
        map.set(key, entry);
      });
    });

    // Include saved colors even if no hours yet
    activityColors.forEach((ac) => {
      if (!map.has(ac.type.toLowerCase())) {
        map.set(ac.type.toLowerCase(), { type: ac.type, hours: 0 });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.hours - a.hours || a.type.localeCompare(b.type));
  }, [allProjects, activityColors]);

  useEffect(() => {
    ensureActivityColors(categories.map((c) => c.type));
  }, [categories, ensureActivityColors]);

  const types = categories.map((c) => c.type);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pt-6 md:pt-8">
      <header className="space-y-2">
        <p className="text-base font-semibold tracking-tight text-foreground/30">Categories</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">Activity colors</h1>
        <p className="text-sm text-muted-foreground">
          Pick a color for each activity category, or apply a palette template to all of them.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Templates</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {COLOR_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                sound.click();
                applyColorTemplate(template.id, types);
              }}
              className="rounded-xl border border-transparent bg-[#f6f6f6] p-3 text-left transition-colors hover:bg-[#f0f0f0] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-1.5">
                {template.colors.slice(0, 6).map((color) => (
                  <span
                    key={color}
                    className="size-3.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-sm font-medium text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Categories</h2>
        {categories.length === 0 ? (
          <p className="rounded-xl bg-[#f6f6f6] px-4 py-8 text-center text-sm text-muted-foreground dark:bg-white/[0.04]">
            Sync calendar events to see activity categories here.
          </p>
        ) : (
          <ul className="divide-y divide-[#ebebeb] overflow-hidden rounded-xl bg-[#f6f6f6] dark:divide-white/[0.06] dark:bg-white/[0.04]">
            {categories.map((category) => {
              const color = getColor(category.type);
              return (
                <li
                  key={category.type}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">#{category.type}</p>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">
                      {formatHours(category.hours)}
                    </p>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm transition-colors hover:text-foreground dark:bg-white/[0.06]"
                        onClick={() => sound.pop()}
                      >
                        <span
                          className="size-4 rounded-md ring-1 ring-black/5 dark:ring-white/10"
                          style={{ backgroundColor: color }}
                        />
                        Change
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 rounded-xl p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Color for #{category.type}
                      </p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {COLOR_PALETTE.map((swatch) => {
                          const selected = color.toLowerCase() === swatch.toLowerCase();
                          return (
                            <button
                              key={swatch}
                              type="button"
                              title={swatch}
                              onClick={() => {
                                sound.click();
                                updateActivityColor(category.type, swatch);
                              }}
                              className={cn(
                                'relative flex size-7 items-center justify-center rounded-md ring-offset-background transition-transform hover:scale-105',
                                selected && 'ring-2 ring-foreground ring-offset-2 dark:ring-offset-background'
                              )}
                              style={{ backgroundColor: swatch }}
                            >
                              {selected && (
                                <Check className="size-3.5 text-neutral-900 drop-shadow-sm" strokeWidth={3} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
