/**
 * 🎮 LEGENDS: Game Initializer
 * Only preloads the absolute minimum needed to start the game.
 * Everything else loads on-demand when the user navigates to it.
 */

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { usePlayerStore } from '../store/playerStore';

export function GameInitializer() {
  useEffect(() => {
    // Only preload the active player model (not both)
    const gender = usePlayerStore.getState().characterGender;
    const playerModel = gender === 'female' ? '/models/players/player2.glb' : '/models/players/player1.glb';
    try { useGLTF.preload(playerModel); } catch { /* ignore */ }

    // Preload only the starting room JSON (GLBs load lazily via Suspense in the room component)
    fetch('/data/room_level1.json').catch(() => {});

    // Audio: only preload button click (tiny, used everywhere)
    const btn = new Audio('/audio/button.mp3');
    btn.preload = 'auto';

    console.log('[GameInitializer] Minimal preload done (player + room1 JSON + button audio)');
  }, []);

  return null;
}
