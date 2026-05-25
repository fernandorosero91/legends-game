/**
 * LEGENDS: RoomLevel4 — Loads room_level4 GLB assets
 * Se muestra en el apartamento cuando el jugador está en nivel 4.
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

const BASE_PATH = '/models/environments/rooms/room_level4/';

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
  { id: 'wall-back',  min: { x: 8, y: 0, z: -19   }, max: { x: 20, y: 5, z: -18 } },
  { id: 'wall-front', min: { x: 8, y: 0, z:  -7  }, max: { x: 23, y: 5, z:  -8   } },
  { id: 'wall-left',  min: { x: 8, y: 0, z: -7   }, max: { x: 8.5, y: 5, z: -18  } },
  { id: 'wall-right', min: { x: 23, y: 0, z: -7  }, max: { x: 24, y: 5, z:  -18   } },
  { id: 'wall-right2', min: { x: 18, y: 0, z: -13.8  }, max: { x: 21, y: 5, z:  -18   } },
  // Muebles — ajustar con debug
  { id: 'bed',   min: { x: 13, y: 0, z: -18 }, max: { x: 16, y: 1.7, z: -12.6 } },
  { id: 'desk',  min: { x: 19, y: 0, z: -14 }, max: { x: 24, y: 2, z: -12.2  } },
  { id: 'sofa',  min: { x: 9,  y: 0, z: -10 }, max: { x: 11, y: 1.2, z: -8  } },
  { id: 'sofa',  min: { x: 11,  y: 0, z: -8.5 }, max: { x: 13, y: 1.2, z: -7  } },
];

// Posiciones de muebles basadas en colisiones
const BED_CENTER:  [number, number, number] = [14.5, 0, -15.3];
const DESK_CENTER: [number, number, number] = [21.5, 0, -13.1];

export function RoomLevel4() {
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
    fetch('/data/room_level4.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[RoomLevel4] Config load error:', err));
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
    const BED_EXIT = { x: BED_CENTER[0], y: 0, z: BED_CENTER[2] + 4 };
    if (playerRef) {
      playerRef.position.set(BED_CENTER[0], -0.2, BED_CENTER[2]);
      playerRef.rotation.y = 0;
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
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] - 1, y: seatY, z: DESK_CENTER[2] + 1.5 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { setGamePhase('rhythm_game'); }, 800);
  };

  const handleWork = () => {
    if (energy < 15) { addNotification('warning', '💼 Necesitas al menos 15 de energía para trabajar'); return; }
    const gender = usePlayerStore.getState().characterGender;
    const seatY = gender === 'female' ? -0.65 : -0.3;
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] - 1, y: seatY, z: DESK_CENTER[2] + 1.5 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { useGameStore.getState().setGamePhase('online_job'); }, 800);
  };

  if (uniqueObjects.length === 0) return null;

  return (
    <>
      <group name="room-level-4" scale={[0.2, 0.2, 0.2]}>
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
