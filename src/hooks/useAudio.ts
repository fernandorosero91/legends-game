import { Howl } from 'howler';
import { useRef, useCallback } from 'react';

const sfxCache: Record<string, Howl> = {};

function getHowl(src: string, loop = false, volume = 0.5): Howl {
  if (!sfxCache[src]) {
    sfxCache[src] = new Howl({ src: [src], loop, volume, preload: true });
  }
  return sfxCache[src];
}

/** Play a one-shot sound effect */
export function playSfx(src: string, volume = 0.5) {
  const h = getHowl(src, false, volume);
  h.volume(volume);
  h.play();
}

/** Hook for background music — returns play/pause/stop */
export function useMusic(src: string, volume = 0.35) {
  const howlRef = useRef<Howl | null>(null);

  const play = useCallback(() => {
    if (!howlRef.current) {
      howlRef.current = getHowl(src, true, volume);
    }
    if (!howlRef.current.playing()) {
      howlRef.current.play();
    }
  }, [src, volume]);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    howlRef.current?.stop();
  }, []);

  return { play, pause, stop };
}
