import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from 'next-themes';

/** Native demo composition size (matches homepage preview). */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 820;

/**
 * Shell for /demo.
 * - Full tab: normal app layout
 * - Iframe (Framer, homepage): keeps the desktop UI and scales it to fit the frame
 *   so it stays proportional on any responsive container size
 */
export default function DemoRoot() {
  const { setTheme } = useTheme();
  const [frame, setFrame] = useState({ scale: 1, embed: false });

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
    const update = () => {
      const embed = window.self !== window.top;
      if (!embed) {
        setFrame({ scale: 1, embed: false });
        return;
      }

      const scale = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT
      );

      setFrame({ scale: Math.max(scale, 0.25), embed: true });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!frame.embed) {
    return (
      <div className="hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden bg-canvas text-foreground">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-svh w-full items-center justify-center overflow-hidden bg-canvas text-foreground">
      <div
        className="hide-scrollbar hide-scrollbar-deep shrink-0 overflow-hidden"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${frame.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
