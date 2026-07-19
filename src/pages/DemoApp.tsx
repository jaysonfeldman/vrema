import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';

/** Shell for the public interactive product preview. Defaults to dark on the landing embed. */
export default function DemoRoot() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    // Hide scrollbars only — keep overflow so nested panels can still scroll
    root.classList.add('hide-scrollbar', 'hide-scrollbar-deep');
    body.classList.add('hide-scrollbar', 'hide-scrollbar-deep');

    return () => {
      root.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
      body.classList.remove('hide-scrollbar', 'hide-scrollbar-deep');
    };
  }, []);

  return (
    <div className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-canvas text-foreground">
      <Outlet />
    </div>
  );
}
