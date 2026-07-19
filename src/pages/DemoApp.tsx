import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

/** Shell for the public interactive product preview. Theme follows the in-app toggle. */
export default function DemoRoot() {
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
