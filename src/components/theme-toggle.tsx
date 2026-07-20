import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { WithTooltip } from '@/components/ui/tooltip';
import { SunIcon, type SunIconHandle } from '@/components/icons/sun';
import { MoonIcon, type MoonIconHandle } from '@/components/icons/moon';
import { sound } from '@/lib/sounds';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';
  const sunRef = useRef<SunIconHandle>(null);
  const moonRef = useRef<MoonIconHandle>(null);

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
        onMouseEnter={() => {
          if (isDark) moonRef.current?.startAnimation();
          else sunRef.current?.startAnimation();
        }}
        onMouseLeave={() => {
          if (isDark) moonRef.current?.stopAnimation();
          else sunRef.current?.stopAnimation();
        }}
      >
        {isDark ? <MoonIcon ref={moonRef} size={16} /> : <SunIcon ref={sunRef} size={16} />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </WithTooltip>
  );
}
