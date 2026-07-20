import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';

/**
 * Product preview shell (rendered inside an iframe).
 *
 * The theme (and its default per embed) is owned by ThemeProvider via the
 * ?theme URL param + a per-embed storage key, so the in-app toggle works and
 * persists without embeds clobbering each other. The only visual tweak here is
 * the canvas tint, handled purely in CSS via `.preview-shell` (see index.css),
 * so the sidebar, header, surfaces and canvas always share one theme.
 *
 * We also broadcast the resolved theme to the parent frame so the /demo embed
 * shell can keep its letterbox background in sync when the toggle is used.
 */
export default function DemoPreview() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme && window.parent !== window) {
      window.parent.postMessage({ type: 'vrema-theme', theme: resolvedTheme }, '*');
    }
  }, [resolvedTheme]);

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
