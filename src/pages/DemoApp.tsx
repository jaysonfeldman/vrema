import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';

/** Layout width the demo is designed for (sidebar + dashboard). */
const DESIGN_WIDTH = 1280;
/** Layout height the demo is designed for. */
const DESIGN_HEIGHT = 800;

function readForcedScale(params: URLSearchParams): number | null {
  const raw = params.get('scale');
  if (raw == null || raw === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0.2 || value > 1) return null;
  return value;
}

/**
 * Shell for the public interactive product preview at /demo.
 * Defaults to light theme. When embedded in a smaller iframe (e.g. Framer),
 * scales the full desktop UI down to fit instead of looking zoomed in.
 */
export default function DemoRoot() {
  const { setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const forcedScale = readForcedScale(searchParams);
  const disableFit = searchParams.get('fit') === '0';
  const [fitScale, setFitScale] = useState(1);

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
    if (forcedScale != null || disableFit) {
      setFitScale(forcedScale ?? 1);
      return;
    }

    const inIframe = window.self !== window.top;
    if (!inIframe) {
      setFitScale(1);
      return;
    }

    const update = () => {
      const widthScale = window.innerWidth / DESIGN_WIDTH;
      const heightScale = window.innerHeight / DESIGN_HEIGHT;
      setFitScale(Math.min(1, widthScale, heightScale));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [forcedScale, disableFit]);

  const scale = forcedScale ?? fitScale;
  const scaled = scale < 0.999;

  return (
    <div className="hide-scrollbar hide-scrollbar-deep h-svh w-full overflow-hidden bg-canvas text-foreground">
      <div
        className="hide-scrollbar hide-scrollbar-deep h-full w-full origin-top-left"
        style={
          scaled
            ? {
                width: `${100 / scale}%`,
                height: `${100 / scale}%`,
                transform: `scale(${scale})`,
              }
            : undefined
        }
      >
        <Outlet />
      </div>
    </div>
  );
}
