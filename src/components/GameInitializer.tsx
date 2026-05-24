/**
 * 🎮 LEGENDS: Game Initializer
 * Preloads critical 3D assets (GLB models) so they're ready when the game starts.
 * Also preloads audio files.
 */

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

// Critical models to preload
const PRELOAD_MODELS = [
  '/models/player1.glb',
  '/models/player2.glb',
];

// Preload room models (fetch the JSON and preload each GLB)
async function preloadRoomModels() {
  const rooms = [
    { json: '/data/room_level1.json', base: '/models/environments/rooms/room_level1/' },
    { json: '/data/studio_level_3.json', base: '/models/environments/rooms/studio_level_3/' },
  ];

  for (const room of rooms) {
    try {
      const response = await fetch(room.json);
      const objects = await response.json();
      const uniqueNames = new Set<string>();
      objects.forEach((obj: { name: string }) => uniqueNames.add(obj.name));

      for (const name of uniqueNames) {
        fetch(`${room.base}${name}.glb`).catch(() => {});
      }

      console.log(`[GameInitializer] Preloading ${uniqueNames.size} models from ${room.json}`);
    } catch {
      // Ignore room load failures
    }
  }

  // Also preload NPC models
  fetch('/models/npcs/dj_sonic.glb').catch(() => {});
  fetch('/models/npcs/npc_rent_collector.glb').catch(() => {});
}

// Preload audio files
function preloadAudio() {
  const audioFiles = ['/audio/inicio.mp3', '/audio/button.mp3', '/audio/level-complete.mp3', '/audio/winner-game.mp3'];
  audioFiles.forEach(src => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
  });
}

export function GameInitializer() {
  useEffect(() => {
    // Preload player models via drei
    PRELOAD_MODELS.forEach(path => {
      try { useGLTF.preload(path); } catch { /* ignore */ }
    });
    
    // Preload room models
    preloadRoomModels();
    
    // Preload audio
    preloadAudio();
    
    console.log('[GameInitializer] Asset preloading initiated');
  }, []);

  return null;
}
