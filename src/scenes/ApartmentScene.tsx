/**
 * LEGENDS: ApartmentScene — Dynamic room rendering
 * Loads the correct room based on gameStore.currentRoom
 * Interaction zones adjust per room layout
 */

import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { RoomLevel1 } from '../components/game/RoomLevel1';
import { StudioLevel3 } from '../components/game/StudioLevel3';
import { InteractableZone } from '../components/game/InteractableZone';
import { RentCollectorNPC } from '../components/game/RentCollectorNPC';
import { DJSonicNPC } from '../components/game/DJSonicNPC';
import { useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export const ApartmentScene = () => {
  const energy = usePlayerStore((s) => s.energy);
  const addEnergy = usePlayerStore((s) => s.addEnergy);
  const addNotification = useUIStore((s) => s.addNotification);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const currentRoom = useGameStore((s) => s.currentRoom);

  // Ensure gamePhase is 'playing' when apartment scene is active
  useEffect(() => {
    const state = useGameStore.getState();
    if (state.gamePhase !== 'playing' && state.gamePhase !== 'rhythm_game') {
      useGameStore.setState({ gamePhase: 'playing', isPaused: false });
    }
  }, [currentRoom]);

  // Dormir en la cama
  const handleSleep = () => {
    if (energy >= 100) {
      addNotification('info', '😊 Ya tienes energía al máximo');
      return;
    }
    addEnergy(50);
    advanceTime();
    addNotification('success', '😴 Descansaste bien. +50 energía. Avanzó el turno.');
  };

  // Descansar en el sofá
  const handleRest = () => {
    if (energy >= 100) {
      addNotification('info', '😊 Ya tienes energía al máximo');
      return;
    }
    addEnergy(40);
    addNotification('success', '🛋️ Descansaste un rato. +40 energía');
  };

  // Grabar canción — sienta al jugador en la silla frente al escritorio
  const handleRecord = () => {
    if (energy < 30) {
      addNotification('warning', '🎤 Necesitas al menos 30 de energía para grabar');
      return;
    }
    // Position player at the chair and sit
    usePlayerStore.getState().setPosition({ x: 0.3, y: 0, z: -3.2 });
    usePlayerStore.getState().setPlayerSitting(true);
    // Small delay to show sitting animation before opening minigame
    setTimeout(() => {
      setGamePhase('rhythm_game');
    }, 800);
  };

  // Computador — trabajos online
  const handleComputer = () => {
    useGameStore.getState().setGamePhase('online_job');
  };

  return (
    <>
      <CameraRig />

      {/* Room — dynamic based on currentRoom selection */}
      <Suspense fallback={null}>
        {currentRoom !== 'studio_level_3' && <RoomLevel1 />}
        {currentRoom === 'studio_level_3' && <StudioLevel3 />}
      </Suspense>

      {/* === ZONAS DE INTERACCIÓN POR HABITACIÓN === */}

      {currentRoom !== 'studio_level_3' && (
        <>
          {/* 🪑 Silla frente al escritorio */}
          <Suspense fallback={null}>
            <DeskChair position={[0.3, 0, -3.2]} rotation={[0, 0, 0]} />
          </Suspense>
          
          {/* 🎤 Escritorio con headset — GRABAR CANCIÓN */}
          <InteractableZone
            position={[0.3, 1.5, -5.0]}
            size={[2.5, 1.5, 1.5]}
            label="Grabar Canción"
            icon="🎤"
            onInteract={handleRecord}
            tooltipOffset={[0, 2, 0]}
          />
          {/* 🛏️ Cama/Litera — DORMIR */}
          <InteractableZone
            position={[-7.2, 1.0, 4.6]}
            size={[3, 2.5, 3]}
            label="Dormir"
            icon="🛏️"
            onInteract={handleSleep}
            tooltipOffset={[0, 2.5, 0]}
          />
          {/* 🛋️ Sofá — DESCANSAR */}
          <InteractableZone
            position={[5.0, 0.6, 3.5]}
            size={[2.5, 1.5, 2]}
            label="Descansar"
            icon="🛋️"
            onInteract={handleRest}
            tooltipOffset={[0, 2, 0]}
          />
          {/* � Estantería con PC — TRABAJOS ONLINE */}
          <InteractableZone
            position={[6.3, 1.5, -3.1]}
            size={[3, 3, 2.5]}
            label="Computador"
            icon="💻"
            onInteract={handleComputer}
            tooltipOffset={[0, 2.5, 0]}
          />
        </>
      )}

      {currentRoom === 'studio_level_3' && (
        <>
          {/* 🎤 Estudio de grabación — zona de grabación principal */}
          <InteractableZone
            position={[-6.6, 2.0, -3.5]}
            size={[3, 2, 2]}
            label="Grabar Canción"
            icon="🎤"
            onInteract={handleRecord}
            tooltipOffset={[0, 2, 0]}
          />
          {/* 🛋️ Sofá del estudio — descansar */}
          <InteractableZone
            position={[3.0, 0.8, 2.0]}
            size={[3, 1.5, 2]}
            label="Descansar"
            icon="🛋️"
            onInteract={handleRest}
            tooltipOffset={[0, 2, 0]}
          />
          {/* 💻 PC del estudio */}
          <InteractableZone
            position={[-6.5, 2.5, -4.0]}
            size={[2, 2, 1.5]}
            label="Computador"
            icon="💻"
            onInteract={handleComputer}
            tooltipOffset={[0, 2.5, 0]}
          />
          {/* 🎧 DJ Sonic — Mentor */}
          <Suspense fallback={null}>
            <DJSonicNPC />
          </Suspense>
        </>
      )}

      {/* NPC: El de la Renta — aparece al atardecer */}
      <Suspense fallback={null}>
        <RentCollectorNPC />
      </Suspense>

      {/* Player — spawn position adjusted per room */}
      <Player position={[0, 0, 2]} />
    </>
  );
};

/** Silla de escritorio — modelo GLB */
function DeskChair({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/accesorios/silla_inter.glb');
  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <primitive object={clone} position={position} rotation={rotation || [0, 0, 0]} scale={1.8} />
  );
}

useGLTF.preload('/models/accesorios/silla_inter.glb');
