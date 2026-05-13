/**
 * LEGENDS: ApartmentScene — Room Level 1
 * Loads all GLB assets from room_level1/ positioned by room_level1.json
 * Interacciones sobre los objetos existentes (sin agregar geometría extra)
 */

import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { RoomLevel1 } from '../components/game/RoomLevel1';
import { InteractableZone } from '../components/game/InteractableZone';
import { Suspense } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export const ApartmentScene = () => {
  const energy = usePlayerStore((s) => s.energy);
  const addEnergy = usePlayerStore((s) => s.addEnergy);
  const addNotification = useUIStore((s) => s.addNotification);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const setGamePhase = useGameStore((s) => s.setGamePhase);

  // Dormir en la cama (litera, abajo-izquierda)
  const handleSleep = () => {
    if (timeOfDay !== 'night') {
      addNotification('warning', '🌙 Solo puedes dormir por la noche');
      return;
    }
    if (energy >= 90) {
      addNotification('info', '😊 No estás cansado todavía');
      return;
    }
    addEnergy(50);
    advanceTime();
    addNotification('success', '😴 Descansaste bien. +50 energía');
  };

  // Descansar en el sofá (abajo-derecha)
  const handleRest = () => {
    if (energy >= 95) {
      addNotification('info', '😊 Ya tienes suficiente energía');
      return;
    }
    addEnergy(20);
    addNotification('info', '🛋️ Descansaste un poco. +20 energía');
  };

  // Grabar en el escritorio/computador (zona central-trasera)
  const handleRecord = () => {
    if (energy < 30) {
      addNotification('warning', '🎤 Necesitas al menos 30 de energía para grabar');
      return;
    }
    setGamePhase('rhythm_game');
  };

  // Computador — trabajos online (estantería con PC, derecha)
  const handleComputer = () => {
    addNotification('info', '💻 Trabajos online — próximamente...');
  };

  return (
    <>
      <CameraRig />

      {/* Room Level 1 — GLB assets positioned by JSON */}
      <Suspense fallback={null}>
        <RoomLevel1 />
      </Suspense>

      {/* === ZONAS DE INTERACCIÓN INVISIBLES SOBRE OBJETOS EXISTENTES === */}

      {/* 🎤 Escritorio con headset — GRABAR CANCIÓN
          Posición basada en cube.020 (mesa) y high_end_headset (audífonos)
          Mesa está en x≈0.29, y≈1.44, z≈-5.02 */}
      <InteractableZone
        position={[0.3, 1.5, -5.0]}
        size={[2.5, 1.5, 1.5]}
        label="Grabar Canción"
        icon="🎤"
        onInteract={handleRecord}
        tooltipOffset={[0, 2, 0]}
      />

      {/* 🛏️ Cama/Litera — DORMIR
          Posición basada en object_4.001 (x≈-7.18, y≈0.91, z≈4.64) */}
      <InteractableZone
        position={[-7.2, 1.0, 4.6]}
        size={[3, 2.5, 3]}
        label="Dormir"
        icon="🛏️"
        onInteract={handleSleep}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 🛋️ Sofá — DESCANSAR
          El sofá púrpura visible en la imagen, abajo-derecha
          Estimado en x≈5, z≈3 basado en la captura */}
      <InteractableZone
        position={[5.0, 0.6, 3.5]}
        size={[2.5, 1.5, 2]}
        label="Descansar"
        icon="🛋️"
        onInteract={handleRest}
        tooltipOffset={[0, 2, 0]}
      />

      {/* 💻 Estantería con PC — TRABAJOS ONLINE
          Posición basada en cube.004 (x≈6.35, y≈0.75, z≈-3.14) */}
      <InteractableZone
        position={[6.3, 1.5, -3.1]}
        size={[3, 3, 2.5]}
        label="Computador"
        icon="💻"
        onInteract={handleComputer}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* Player — spawn at center of room */}
      <Player position={[0, 0, 2]} />
    </>
  );
};
