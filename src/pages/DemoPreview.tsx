import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';

/**
 * Landing-page product preview shell.
 * Unchanged desktop app experience for the wide homepage iframe.
 */
export default function DemoPreview() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add('dark', 'hide-scrollbar', 'hide-scrollbar-deep');
    body.classList.add('hide-scrollbar', 'hide-scrollbar-deep');
    root.style.backgroundColor = '#151818';
    body.style.backgroundColor = '#151818';

    return () => {
      root.classList.remove('dark', 'hide-scrollbar', 'hide-scrollbar-deep');
      body.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
      root.style.backgroundColor = '';
      body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-[#151818] text-foreground">
      <Outlet />
    </div>
  );
}
