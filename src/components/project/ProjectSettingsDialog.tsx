import React from 'react';
import { Project } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectLogo } from '@/components/project/ProjectLogo';
import { PROJECT_ICONS, type ProjectIconId } from '@/lib/projectLogos';
import { sound } from '@/lib/sounds';

interface ProjectSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProject: Project) => void;
}

type LogoMode = 'icon' | 'upload';

export default function ProjectSettingsDialog({
  project,
  open,
  onOpenChange,
  onSave,
}: ProjectSettingsDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = React.useState(project.name || '');
  const [logoUrl, setLogoUrl] = React.useState(project.logoUrl || '');
  const [logoIcon, setLogoIcon] = React.useState<ProjectIconId | ''>(
    (project.logoIcon as ProjectIconId) || ''
  );
  const [logoMode, setLogoMode] = React.useState<LogoMode>(project.logoUrl ? 'upload' : 'icon');
  const [logoBusy, setLogoBusy] = React.useState(false);
  const [hourlyRate, setHourlyRate] = React.useState(project.hourlyRate?.toString() || '');
  const [budgetHours, setBudgetHours] = React.useState(project.budgetHours?.toString() || '');
  const [filterTerm, setFilterTerm] = React.useState(project.filterTerm || '');

  React.useEffect(() => {
    if (!open) return;
    setName(project.name || '');
    setLogoUrl(project.logoUrl || '');
    setLogoIcon((project.logoIcon as ProjectIconId) || '');
    setLogoMode(project.logoUrl ? 'upload' : 'icon');
    setLogoBusy(false);
    setHourlyRate(project.hourlyRate?.toString() || '');
    setBudgetHours(project.budgetHours?.toString() || '');
    setFilterTerm(project.filterTerm || '');
  }, [open, project]);

  const handleSave = () => {
    if (logoBusy) return;
    const usingUpload = logoMode === 'upload' && Boolean(logoUrl.trim());
    const updatedProject: Project = {
      ...project,
      id: (project.id || project.name || '').toLowerCase(),
      name: name.trim() || project.name,
      logoUrl: usingUpload ? logoUrl.trim() : undefined,
      logoIcon: usingUpload ? undefined : logoIcon || undefined,
      hourlyRate: parseFloat(hourlyRate) || 0,
      budgetHours: parseFloat(budgetHours) || 0,
      filterTerm,
    };
    onSave(updatedProject);
    onOpenChange(false);
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setLogoBusy(true);

    const applyDataUrl = (dataUrl: string) => {
      setLogoUrl(dataUrl);
      setLogoMode('upload');
      setLogoBusy(false);
    };

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setLogoBusy(false);
        return;
      }
      const raw = reader.result;
      const img = new Image();
      img.onload = () => {
        const max = 192;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLogoBusy(false);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        applyDataUrl(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => {
        setLogoBusy(false);
      };
      img.src = raw;
    };
    reader.onerror = () => setLogoBusy(false);
    reader.readAsDataURL(file);
  };

  const previewUrl = logoMode === 'upload' ? logoUrl : undefined;
  const previewIcon = logoMode === 'icon' ? logoIcon || undefined : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Logo</Label>
              <div className="inline-flex rounded-lg bg-muted p-0.5">
                {(
                  [
                    { id: 'icon' as const, label: 'Icon' },
                    { id: 'upload' as const, label: 'Image' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setLogoMode(tab.id);
                    }}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                      logoMode === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProjectLogo
                name={name || project.name}
                logoUrl={previewUrl}
                logoIcon={previewIcon}
                size="md"
              />
              <p className="text-xs text-muted-foreground">
                {logoMode === 'icon'
                  ? 'Pick an icon for this project.'
                  : 'Upload a logo or paste an image URL.'}
              </p>
            </div>

            {logoMode === 'icon' ? (
              <div className="grid grid-cols-8 gap-1.5">
                {PROJECT_ICONS.map(({ id, label, icon: Icon }) => {
                  const active = logoIcon === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => {
                        sound.click();
                        setLogoIcon(id);
                      }}
                      className={cn(
                        'flex size-9 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      )}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-3.5" />
                    Upload image
                  </Button>
                  {logoBusy && (
                    <span className="text-xs text-muted-foreground">Processing image…</span>
                  )}
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-lg text-muted-foreground"
                      onClick={() => setLogoUrl('')}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleLogoFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
                <Input
                  value={logoUrl.startsWith('data:') ? '' : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Or paste an image URL"
                  className="rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Hourly Rate (€)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budgetHours">Monthly Budget Hours</Label>
            <Input
              id="budgetHours"
              type="number"
              value={budgetHours}
              onChange={(e) => setBudgetHours(e.target.value)}
              placeholder="Enter monthly budget hours"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="filterTerm">Filter Term</Label>
            <Input
              id="filterTerm"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Enter filter term for calendar events"
            />
            <p className="text-sm text-muted-foreground">
              This term is used to filter calendar events for this project
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={logoBusy}>
            {logoBusy ? 'Processing…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
