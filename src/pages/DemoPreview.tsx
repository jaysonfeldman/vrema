import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';

const LIGHT_CANVAS = '#F2F2F2';
const DARK_CANVAS = '#151818';

/**
 * Product preview shell.
 * - Landing iframe: dark (default)
 * - Framer embed (?theme=light): light with #F2F2F2 canvas
 *
 * Theme is owned entirely by next-themes (setTheme). We only scope a --canvas
 * override to this wrapper so the shell tint matches, without touching <html>.
 */
export default function DemoPreview() {
  const { setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const isLight = searchParams.get('theme') === 'light';
  const canvas = isLight ? LIGHT_CANVAS : DARK_CANVAS;

  useEffect(() => {
    setTheme(isLight ? 'light' : 'dark');
  }, [isLight, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('hide-scrollbar', 'hide-scrollbar-deep');
    body.classList.add('hide-scrollbar', 'hide-scrollbar-deep');

    return () => {
      root.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
      body.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
    };
  }, []);

  return (
    <div
      className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-canvas text-foreground"
      style={{ '--canvas': canvas, backgroundColor: canvas } as CSSProperties}
    >
      <Outlet />
    </div>
  );
}
