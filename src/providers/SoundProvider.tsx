import { useEffect } from 'react';
import { initSounds } from '@/lib/sounds';

/** Warm up the audio engine after first user gesture so later clicks can play instantly. */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unlock = () => {
      initSounds();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return <>{children}</>;
}
