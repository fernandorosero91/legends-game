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

// Preload room level 1 models (fetch the JSON and preload each GLB)
async function preloadRoomModels() {
  try {
    const response = await fetch('/data/room_level1.json');
    const objects = await response.json();
    
    // Get unique model names
    const uniqueNames = new Set<string>();
    objects.forEach((obj: { name: string }) => uniqueNames.add(obj.name));
    
    // Preload each GLB (browser will cache them)
    const basePath = '/models/environments/rooms/room_level1/';
    for (const name of uniqueNames) {
      try {
        // Use fetch to warm the browser cache
        fetch(`${basePath}${name}.glb`).catch(() => {});
      } catch {
        // Ignore individual model failures
      }
    }
    
    console.log(`[GameInitializer] Preloading ${uniqueNames.size} room models`);
  } catch (error) {
    console.warn('[GameInitializer] Could not preload room models:', error);
  }
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
