import { cn } from '@/lib/utils';
import { getProjectIcon, projectInitials } from '@/lib/projectLogos';

type ProjectLogoProps = {
  name: string;
  logoUrl?: string;
  logoIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'size-9 rounded-xl',
  md: 'size-12 rounded-xl',
  lg: 'size-14 rounded-2xl',
} as const;

const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

const textSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

export function ProjectLogo({
  name,
  logoUrl,
  logoIcon,
  size = 'sm',
  className,
}: ProjectLogoProps) {
  const Icon = getProjectIcon(logoIcon);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden bg-white font-semibold uppercase tracking-tight text-foreground shadow-sm ring-1 ring-black/[0.04] dark:bg-white/10 dark:ring-white/10',
        sizeClass[size],
        textSize[size],
        className
      )}
      aria-hidden
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="size-full object-cover" />
      ) : Icon ? (
        <Icon size={iconSize[size]} strokeWidth={2} className="text-foreground" />
      ) : (
        projectInitials(name)
      )}
    </div>
  );
}
