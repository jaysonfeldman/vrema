import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';

/**
 * Product preview shell (rendered inside an iframe).
 * - Landing iframe (/preview/app): dark by default
 * - Framer embed (/demo -> /preview/app?theme=light|dark): follows the param
 *
 * Theme is fully owned by next-themes. The only visual tweak is the canvas
 * tint, handled purely in CSS via `.preview-shell` (see index.css), so the
 * sidebar, header, surfaces and canvas always share one theme.
 */
export default function DemoPreview() {
  const { setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const requestedLight = searchParams.get('theme') === 'light';

  useEffect(() => {
    setTheme(requestedLight ? 'light' : 'dark');
  }, [requestedLight, setTheme]);

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
    <div className="preview-shell hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-canvas text-foreground">
      <Outlet />
    </div>
  );
}
