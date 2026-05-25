/**
 * LEGENDS: ApartmentScene — Dynamic room rendering
 * Loads the correct room based on gameStore.currentRoom
 * Interaction zones adjust per room layout
 */

import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { RoomLevel1 } from '../components/game/RoomLevel1';
import { RoomLevel2 } from '../components/game/RoomLevel2';
import { RoomLevel3 } from '../components/game/RoomLevel3';
import { StudioLevel3 } from '../components/game/StudioLevel3';
import { InteractableZone } from '../components/game/InteractableZone';
import { RentCollectorNPC } from '../components/game/RentCollectorNPC';
import { DJSonicNPC } from '../components/game/DJSonicNPC';
import { useGLTF, useKTX2 } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export const ApartmentScene = () => {
  const energy = usePlayerStore((s) => s.energy);
  const addEnergy = usePlayerStore((s) => s.addEnergy);
  const inventory = usePlayerStore((s) => s.inventory);
  const addNotification = useUIStore((s) => s.addNotification);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const currentLevel = useGameStore((s) => s.currentLevel);

  // Ensure gamePhase is 'playing' when apartment scene is active
  useEffect(() => {
    const state = useGameStore.getState();
    if (state.gamePhase !== 'playing' && state.gamePhase !== 'rhythm_game') {
      useGameStore.setState({ gamePhase: 'playing', isPaused: false });
    }
  }, [currentRoom]);

  const setPlayerSleeping = usePlayerStore((s) => s.setPlayerSleeping);
  const playerRef = usePlayerStore((s) => s.playerRef);

  // Posicion encima de la cama (ajustada visualmente)
  const BED_POSITION = { x: -7.2, y: -0.7, z: 4.2 };
  // Posicion de salida — al lado de la cama, fuera de la colision
  const BED_EXIT = { x: -5.0, y: 0.0, z: 2 };

  // Dormir en la cama
  const handleSleep = () => {
    if (energy >= 100) {
      addNotification('info', '😊 Ya tienes energía al máximo');
      return;
    }
    // Mover al jugador encima de la cama
    if (playerRef) {
      playerRef.position.set(BED_POSITION.x, BED_POSITION.y, BED_POSITION.z);
      // Orientar a lo largo de la cama (cabecera a la izquierda = rotar 90 en Y)
      playerRef.rotation.y = Math.PI * 0.5;
    }
    // Activar animación de dormir
    setPlayerSleeping(true);
    addEnergy(50);
    // Después de 2.5 segundos, avanzar turno y despertar
    setTimeout(() => {
      setPlayerSleeping(false);
      // Mover al jugador fuera de la cama antes de reactivar movimiento
      if (playerRef) {
        playerRef.position.set(BED_EXIT.x, BED_EXIT.y, BED_EXIT.z);
        playerRef.rotation.y = 0;
      }
      advanceTime();
      addNotification('success', '😴 Descansaste bien. +50 energía. Avanzó el turno.');
    }, 4000);
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
    // Player2 (femenino) necesita Y más bajo para que la cola quede en la silla
    const gender = usePlayerStore.getState().characterGender;
    const seatY = gender === 'female' ? -2.9 : 0;
    usePlayerStore.getState().setPosition({ x: 0.3, y: seatY, z: -3.2 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => {
      setGamePhase('rhythm_game');
    }, 800);
  };

  // Computador — trabajos online (sienta al jugador en la silla del PC)
  const handleComputer = () => {
    if (energy < 15) {
      addNotification('warning', '💻 Necesitas al menos 15 de energía para trabajar');
      return;
    }
    usePlayerStore.getState().setPosition({ x: 6.0, y: 0, z: -3.5 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => {
      useGameStore.getState().setGamePhase('online_job');
    }, 800);
  };

  return (
    <>
      <CameraRig />

      {/* Room — dynamic based on currentRoom and currentLevel */}
      <Suspense fallback={null}>
        {currentRoom !== 'studio_level_3' && currentLevel >= 3 && <RoomLevel3 />}
        {currentRoom !== 'studio_level_3' && currentLevel === 2 && <RoomLevel2 />}
        {currentRoom !== 'studio_level_3' && currentLevel < 2 && <RoomLevel1 />}
        {currentRoom === 'studio_level_3' && <StudioLevel3 />}
      </Suspense>

      {/* === ZONAS DE INTERACCIÓN POR HABITACIÓN === */}

      {currentRoom !== 'studio_level_3' && (
        <>
          {/* Nivel 1 — zonas propias de room_level1 */}
          {currentLevel < 2 && (            <>
              {/* 🪑 Silla frente al escritorio de grabación */}
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
              {inventory.some(i => i.itemId === 'comfy_couch') && (
                <Suspense fallback={null}>
                  <SofaModel position={[5.0, 0, 5.0]} rotation={[0, Math.PI, 0]} />
                </Suspense>
              )}
              <InteractableZone
                position={[5.0, 0.6, 5.0]}
                size={[2.5, 1.5, 2]}
                label="Descansar"
                icon="🛋️"
                onInteract={handleRest}
                tooltipOffset={[0, 2, 0]}
              />
              {/* 💻 Estantería con PC — TRABAJOS ONLINE */}
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
          {/* Nivel 2+ — zonas manejadas por RoomLevel2 directamente */}
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

      {/* Player — spawn position adjusted per room and level */}
      <Player position={currentLevel >= 3 ? [3, 0, -0.5] : currentLevel >= 2 ? [2.5, 0, 3] : [0, 0, 2]} />
    </>
  );
};

/** Silla de escritorio — GLB con texturas KTX2 */
function DeskChair({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/accesorios/silla-inter.glb', '/draco/');
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

/** Sofá — modelo GLB */
function SofaModel({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/accesorios/sofa_3230.glb', '/draco/');
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
    <primitive object={clone} position={position} rotation={rotation || [0, 0, 0]} scale={1.5} />
  );
}

useGLTF.preload('/models/accesorios/sofa_3230.glb');
