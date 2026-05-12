/**
 * LEGENDS: ApartmentScene — Room Level 1
 * Loads all GLB assets from room_level1/ positioned by room_level1.json
 */

import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { RoomLevel1 } from '../components/game/RoomLevel1';
import { MicStand } from '../components/game/MicStand';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { Suspense } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export const ApartmentScene = () => {
  const energy = usePlayerStore((s) => s.energy);
  const addEnergy = usePlayerStore((s) => s.addEnergy);
  const addNotification = useUIStore((s) => s.addNotification);
  const advanceTime = useGameStore((s) => s.advanceTime);

  const handleSleep = () => {
    addEnergy(50);
    advanceTime();
    addNotification('success', '😴 Descansaste bien. +50 energía');
  };

  const handleRest = () => {
    addEnergy(20);
    addNotification('info', '🛋️ Descansaste un poco. +20 energía');
  };

  const handleComputer = () => {
    // TODO: Abrir trabajos online
    addNotification('info', '💻 Trabajos online disponibles pronto...');
  };

  return (
    <>
      <CameraRig />

      {/* Room Level 1 — GLB assets positioned by JSON */}
      <Suspense fallback={null}>
        <RoomLevel1 />
      </Suspense>

      {/* Objetos interactuables */}
      <MicStand />

      <PropPlaceholder
        type="bed"
        position={[-7.5, 0, 4]}
        label="Dormir (+50 energía)"
        onInteract={handleSleep}
      />

      <PropPlaceholder
        type="sofa"
        position={[5, 0, 3]}
        label="Descansar (+20 energía)"
        onInteract={handleRest}
      />

      <PropPlaceholder
        type="computer"
        position={[0, 0.8, -4.5]}
        scale={0.8}
        label="Computador"
        onInteract={handleComputer}
      />

      {/* Player — spawn at center of room */}
      <Player position={[0, 0, 2]} />
    </>
  );
};
