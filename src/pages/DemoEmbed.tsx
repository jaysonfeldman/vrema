import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 820;
const LIGHT_BG = '#f2f2f2';
const DARK_BG = '#151818';

/**
 * Framer-only embed at /demo.
 * Theme is driven by the URL so each embed is independent and self-consistent:
 *   /demo            -> dark  (outer bg + inner app both #151818)
 *   /demo?theme=dark -> dark
 *   /demo?theme=light-> light (outer bg + inner app both #f2f2f2)
 *
 * Hosts the untouched preview in a real 1280×820 iframe, then scales that
 * iframe to fit. The outer background always matches the inner theme, so there
 * is never a light letterbox around a dark app (or vice versa).
 */
export default function DemoEmbed() {
  const [searchParams] = useSearchParams();
  const isLight = searchParams.get('theme') === 'light';
  const theme = isLight ? 'light' : 'dark';
  const bg = isLight ? LIGHT_BG : DARK_BG;

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
    <div className="h-svh w-full overflow-hidden" style={{ background: bg }}>
      <iframe
        title="Vrema demo"
        src={`/preview/app?theme=${theme}`}
        width={DESIGN_WIDTH}
        height={DESIGN_HEIGHT}
        className="origin-top-left border-0"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          background: bg,
        }}
      />
    </div>
  );
}
