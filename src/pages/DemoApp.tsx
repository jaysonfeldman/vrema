import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';

/** Native desktop composition — same as homepage preview. */
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 820;

/**
 * Outer shell for Framer (and other small iframes).
 * Hosts a nested iframe with a real 1280×820 viewport so Tailwind `md:` desktop
 * styles apply, then scales that iframe to fit the parent frame.
 */
function EmbedFrame() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const next = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT
      );
      setScale(Math.max(0.2, next));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="h-svh w-full overflow-hidden" style={{ background: '#F2F2F2' }}>
      <iframe
        title="Vrema demo"
        src="/demo/app?stage=1"
        width={DESIGN_WIDTH}
        height={DESIGN_HEIGHT}
        className="origin-top-left border-0"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          background: '#F2F2F2',
        }}
      />
    </div>
  );
}

/**
 * /demo shell.
 * - Full browser tab: normal app
 * - Small outer iframe (Framer): nested 1280×820 desktop stage, scaled to fit
 * - Inner stage (?stage=1): actual desktop UI (sidebar open, desktop breakpoints)
 */
export default function DemoRoot() {
  const { setTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const isStage = searchParams.get('stage') === '1';
  const [isOuterEmbed, setIsOuterEmbed] = useState(false);

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
    // Only the outermost Framer/homepage host should wrap a nested stage iframe.
    // The stage itself is already inside a 1280×820 iframe.
    setIsOuterEmbed(!isStage && window.self !== window.top);
  }, [isStage]);

  useEffect(() => {
    if (!isStage) {
      document.documentElement.classList.remove('demo-embed');
      return;
    }

    document.documentElement.classList.add('demo-embed');

    // Keep layout viewport at desktop width inside the nested stage iframe
    let meta = document.querySelector('meta[name="viewport"]');
    const previous = meta?.getAttribute('content') ?? null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'width=1280, initial-scale=1');

    return () => {
      document.documentElement.classList.remove('demo-embed');
      if (meta && previous != null) meta.setAttribute('content', previous);
    };
  }, [isStage]);

  if (isOuterEmbed) {
    return <EmbedFrame />;
  }

  return (
    <div
      className={
        isStage
          ? 'hide-scrollbar hide-scrollbar-deep h-[820px] w-[1280px] overflow-hidden text-foreground'
          : 'hide-scrollbar hide-scrollbar-deep h-svh overflow-hidden text-foreground'
      }
      style={{ background: '#F2F2F2' }}
    >
      <Outlet />
    </div>
  );
}
