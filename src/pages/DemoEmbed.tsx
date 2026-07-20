import { useEffect, useState } from 'react';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 820;
const EMBED_BG = '#F2F2F2';

/**
 * Framer-only embed at /demo.
 * Hosts the untouched landing preview in a real 1280×820 iframe, then scales
 * that iframe to fit. Does not change shared app layout/sidebar behavior.
 */
export default function DemoEmbed() {
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
    <div className="h-svh w-full overflow-hidden" style={{ background: EMBED_BG }}>
      <iframe
        title="Vrema demo"
        src="/preview/app"
        width={DESIGN_WIDTH}
        height={DESIGN_HEIGHT}
        className="origin-top-left border-0"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          background: EMBED_BG,
        }}
      />
    </div>
  );
}
