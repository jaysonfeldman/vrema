import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';

/** Native desktop composition — same as homepage preview. */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 820;

/**
 * /demo shell.
 * In iframes (Framer / homepage): render a fixed desktop UI and scale it to fit
 * the frame without clipping. Sidebar stays open like the real desktop app.
 */
export default function DemoRoot() {
  const { setTheme } = useTheme();
  const [embedScale, setEmbedScale] = useState<number | null>(null);

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

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

  useEffect(() => {
    const inIframe = window.self !== window.top;
    if (!inIframe) {
      setEmbedScale(null);
      document.documentElement.classList.remove('demo-embed');
      return;
    }

    document.documentElement.classList.add('demo-embed');

    const update = () => {
      const scale = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT
      );
      setEmbedScale(Math.max(0.2, scale));
    };

    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      document.documentElement.classList.remove('demo-embed');
    };
  }, []);

  if (embedScale == null) {
    return (
      <div className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-canvas text-foreground">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="relative h-svh w-full overflow-hidden bg-canvas text-foreground">
      <div
        className="hide-scrollbar hide-scrollbar-deep absolute left-0 top-0 overflow-hidden"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${embedScale})`,
          transformOrigin: 'top left',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
