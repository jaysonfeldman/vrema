import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { SunIcon } from '@/components/icons/sun';
import { MoonIcon } from '@/components/icons/moon';
import { sound } from '@/lib/sounds';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  return (
    <WithTooltip content={isDark ? 'Switch to light mode' : 'Switch to dark mode'} side="bottom">
      <Button
        variant="ghost"
        size="icon"
        className="active:scale-[0.97] transition-transform"
        onClick={() => {
          sound.toggle(!isDark);
          setTheme(isDark ? 'light' : 'dark');
        }}
      >
        {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </WithTooltip>
  );
}
