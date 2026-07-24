import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useSharedState } from '@/hooks/useSharedState';
import { useProjectStats } from '@/hooks/useProjectStats';
import { useTeamStore } from '@/hooks/useTeamStore';
import { formatHours } from '@/lib/eventStats';
import { COLOR_PALETTE, COLOR_TEMPLATES } from '@/lib/activityColors';
import { useActivityColor } from '@/components/ActivityBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sounds';

export default function Categories() {
  const {
    activityColors,
    updateActivityColor,
    ensureActivityColors,
    applyColorTemplate,
    managedProjects,
    addManagedProject,
    excludeProject,
    removeActivityType,
  } = useSharedState();
  const { allProjects } = useProjectStats();
  const timeEntries = useTeamStore((s) => s.timeEntries);
  const getColor = useActivityColor();

  const [newProject, setNewProject] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

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

    activityColors.forEach((ac) => {
      if (!map.has(ac.type.toLowerCase())) {
        map.set(ac.type.toLowerCase(), { type: ac.type, hours: 0 });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.hours - a.hours || a.type.localeCompare(b.type));
  }, [allProjects, activityColors]);

  const projects = useMemo(() => {
    const map = new Map<string, { name: string; hours: number }>();
    allProjects.forEach((p) => {
      map.set(p.name.toLowerCase(), { name: p.name, hours: p.totalHours });
    });
    managedProjects.forEach((name) => {
      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, { name, hours: 0 });
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));
  }, [allProjects, managedProjects]);

  useEffect(() => {
    ensureActivityColors(categories.map((c) => c.type));
  }, [categories, ensureActivityColors]);

  const types = categories.map((c) => c.type);

  const affectedEntryCount = projectToDelete
    ? timeEntries.filter((e) => e.projectName.toLowerCase() === projectToDelete.toLowerCase()).length
    : 0;

  const commitNewProject = () => {
    const name = newProject.trim();
    if (!name) {
      setAddingProject(false);
      return;
    }
    addManagedProject(name);
    setNewProject('');
    setAddingProject(false);
    sound.success();
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 pt-6 md:pt-8">
      <header className="space-y-2">
        <p className="text-base font-semibold tracking-tight text-foreground/30">Categories</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          Projects & activities
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage projects used on the calendar, and set colors for each activity.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-medium">Projects</h2>
          {!addingProject && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-lg text-muted-foreground"
              onClick={() => {
                sound.click();
                setAddingProject(true);
              }}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          )}
        </div>

        {addingProject && (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project name"
              className="h-9 rounded-xl border-transparent bg-[#f6f6f6] shadow-none focus-visible:ring-1 focus-visible:ring-foreground/15 dark:bg-white/[0.06]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitNewProject();
                }
                if (e.key === 'Escape') {
                  setAddingProject(false);
                  setNewProject('');
                }
              }}
            />
            <Button type="button" size="sm" className="h-9 rounded-xl" onClick={commitNewProject}>
              Add
            </Button>
          </div>
        )}

        {projects.length === 0 ? (
          <p className="rounded-xl bg-[#f6f6f6] px-4 py-8 text-center text-sm text-muted-foreground dark:bg-white/[0.04]">
            No projects yet. Add one here, or create it while logging time.
          </p>
        ) : (
          <ul className="divide-y divide-[#ebebeb] overflow-hidden rounded-xl bg-[#f6f6f6] dark:divide-white/[0.06] dark:bg-white/[0.04]">
            {projects.map((project) => (
              <li key={project.name} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatHours(project.hours)}
                  </p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      sound.click();
                      setProjectToDelete(project.name);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete {project.name}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">Color templates</h2>
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
        <h2 className="text-base font-medium">Activities</h2>
        {categories.length === 0 ? (
          <p className="rounded-xl bg-[#f6f6f6] px-4 py-8 text-center text-sm text-muted-foreground dark:bg-white/[0.04]">
            Sync calendar events or log time to see activities here.
          </p>
        ) : (
          <ul className="divide-y divide-[#ebebeb] overflow-hidden rounded-xl bg-[#f6f6f6] dark:divide-white/[0.06] dark:bg-white/[0.04]">
            {categories.map((category) => {
              const color = getColor(category.type);
              return (
                <li key={category.type} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
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

                  <div className="flex size-8 shrink-0 items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        sound.click();
                        setActivityToDelete(category.type);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete #{category.type}</span>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AlertDialog open={Boolean(projectToDelete)} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project “{projectToDelete}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This project will be removed from pickers and hours overview.
              {affectedEntryCount > 0
                ? ` ${affectedEntryCount} existing event${affectedEntryCount === 1 ? '' : 's'} will stay on the calendar but won’t count toward totals.`
                : ' Existing calendar events for this project won’t count toward totals anymore.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (projectToDelete) {
                  excludeProject(projectToDelete);
                  sound.pop();
                }
                setProjectToDelete(null);
              }}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(activityToDelete)} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove #{activityToDelete}?</AlertDialogTitle>
            <AlertDialogDescription>
              This activity will disappear from the calendar picker. Past events keep their label, but you won’t be able to select it for new ones until it’s used again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (activityToDelete) {
                  removeActivityType(activityToDelete);
                  sound.pop();
                }
                setActivityToDelete(null);
              }}
            >
              Remove activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
