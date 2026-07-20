import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';

const LIGHT_CANVAS = '#F2F2F2';
const DARK_CANVAS = '#151818';

/**
 * Product preview shell.
 * - Landing iframe: dark (default)
 * - Framer embed (?theme=light): light with #F2F2F2 canvas
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
    root.classList.toggle('dark', !isLight);
    root.style.setProperty('--canvas', canvas);
    root.style.backgroundColor = canvas;
    body.style.backgroundColor = canvas;

    return () => {
      root.classList.remove('dark', 'hide-scrollbar', 'hide-scrollbar-deep');
      body.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
      root.style.removeProperty('--canvas');
      root.style.backgroundColor = '';
      body.style.backgroundColor = '';
    };
  }, [canvas, isLight]);

  return (
    <div
      className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden text-foreground"
      style={{ backgroundColor: canvas }}
    >
      <Outlet />
    </div>
  );
}
