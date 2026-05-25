/**
 * LEGENDS: RoomLevel5 — Loads room_level5 GLB assets
 * Se muestra en el apartamento cuando el jugador está en nivel 5+.
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { InteractableZone } from './InteractableZone';

interface RoomObject {
  name: string;
  x: number;
  y: number;
  z: number;
  level: number;
  role: string;
}

const BASE_PATH = '/models/environments/rooms/room_level5/';

// DEBUG: set to true to see collision boxes in red
const DEBUG_COLLISIONS = false;

type Box = { id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };

function DebugBox({ box }: { box: Box }) {
  const sx = box.max.x - box.min.x;
  const sy = box.max.y - box.min.y;
  const sz = box.max.z - box.min.z;
  const cx = (box.min.x + box.max.x) / 2;
  const cy = (box.min.y + box.max.y) / 2;
  const cz = (box.min.z + box.max.z) / 2;
  return (
    <mesh position={[cx, cy, cz]}>
      <boxGeometry args={[sx, sy, sz]} />
      <meshBasicMaterial color="red" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

function RoomAsset({ name }: { name: string }) {
  const path = `${BASE_PATH}${name}.glb`;
  const { scene } = useGLTF(path);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={[0, 0, 0]} />;
}

// Colisiones — ajustar con el debug
const BOXES: Box[] = [
  { id: 'wall-back',  min: { x: -5, y: 0, z: -4   }, max: { x: 6, y: 5, z: -5 } },
  { id: 'wall-front', min: { x: -5, y: 0, z:  11  }, max: { x: 6, y: 5, z:  12   } },
  { id: 'wall-left',  min: { x: -5, y: 0, z: -7   }, max: { x: -6, y: 5, z: 12  } },
  { id: 'wall-right', min: { x: 7, y: 0, z: -7  }, max: { x: 6, y: 5, z:  11   } },
  // Cama (izquierda)
  { id: 'bed',   min: { x: -0.5, y: 0, z: 4  }, max: { x: 4, y: 1.2, z: 10  } },
  // Escritorio (derecha arriba)
  { id: 'desk',  min: { x: 3,  y: 0, z: -4 }, max: { x: -6, y: 2,   z: -1  } },
];

// Posiciones de muebles basadas en colisiones
const BED_CENTER:  [number, number, number] = [1.75, 0, 7];
const DESK_CENTER: [number, number, number] = [-1.5, 0, -2.5];

export function RoomLevel5() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);
  const energy = usePlayerStore((s) => s.energy);
  const addEnergy = usePlayerStore((s) => s.addEnergy);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const addNotification = useUIStore((s) => s.addNotification);
  const playerRef = usePlayerStore((s) => s.playerRef);
  const setPlayerSleeping = usePlayerStore((s) => s.setPlayerSleeping);

  useEffect(() => {
    fetch('/data/room_level5.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[RoomLevel5] Config load error:', err));
  }, []);

  useEffect(() => {
    setWallBoxes(BOXES);
  }, [setWallBoxes]);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  const handleSleep = () => {
    if (energy >= 100) { addNotification('info', '😊 Ya tienes energía al máximo'); return; }
    // Salida: Z negativo (frente a la cama, fuera de colisión bed Z[4,10])
    const BED_EXIT = { x: BED_CENTER[0], y: 0, z: BED_CENTER[2] - 4 };
    if (playerRef) {
      playerRef.position.set(BED_CENTER[0], -0.4, BED_CENTER[2]);
      playerRef.rotation.y = Math.PI; // 180° para cabeza en almohada (Z alto)
    }
    setPlayerSleeping(true);
    addEnergy(50);
    setTimeout(() => {
      setPlayerSleeping(false);
      if (playerRef) { playerRef.position.set(BED_EXIT.x, BED_EXIT.y, BED_EXIT.z); playerRef.rotation.y = 0; }
      advanceTime();
      addNotification('success', '😴 Descansaste bien. +50 energía. Avanzó el turno.');
    }, 4000);
  };

  const handleRecord = () => {
    if (energy < 30) { addNotification('warning', '🎤 Necesitas al menos 30 de energía para grabar'); return; }
    const gender = usePlayerStore.getState().characterGender;
    const seatY = gender === 'female' ? -0.65 : -0.3;
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] + 1.5, y: seatY, z: DESK_CENTER[2] + 2 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { setGamePhase('rhythm_game'); }, 800);
  };

  const handleWork = () => {
    if (energy < 15) { addNotification('warning', '💼 Necesitas al menos 15 de energía para trabajar'); return; }
    const gender = usePlayerStore.getState().characterGender;
    const seatY = gender === 'female' ? -0.65 : -0.3;
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] + 1.5 , y: seatY, z: DESK_CENTER[2] + 2 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { useGameStore.getState().setGamePhase('online_job'); }, 800);
  };

  if (uniqueObjects.length === 0) return null;

  return (
    <>
      <group name="room-level-5" scale={[0.35, 0.35, 0.35]}>
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <RoomAsset name={obj.name} />
          </Suspense>
        ))}
      </group>

      {/* 🛏️ Cama — Dormir */}
      <InteractableZone
        position={BED_CENTER}
        size={[4, 2, 3]}
        label="Dormir"
        icon="🛏️"
        onInteract={handleSleep}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 🎤 Escritorio — Grabar Canción */}
      <InteractableZone
        position={[DESK_CENTER[0] - 1.5, DESK_CENTER[1], DESK_CENTER[2]]}
        size={[2.5, 2, 1.5]}
        label="Grabar Canción"
        icon="🎤"
        onInteract={handleRecord}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 💼 Escritorio — Buscar Trabajo */}
      <InteractableZone
        position={[DESK_CENTER[0] + 1.5, DESK_CENTER[1], DESK_CENTER[2]]}
        size={[2.5, 2, 1.5]}
        label="Buscar Trabajo"
        icon="💼"
        onInteract={handleWork}
        tooltipOffset={[0, 2.5, 0]}
      />

      {DEBUG_COLLISIONS && BOXES.map((b) => <DebugBox key={b.id} box={b} />)}
    </>
  );
}
