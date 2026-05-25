/**
 * LEGENDS: RoomLevel2 — Loads room_level2 GLB assets
 * Se muestra en el apartamento cuando el jugador está en nivel 2.
 * Incluye colisiones y zonas interactivas propias de esta habitación.
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { Html } from '@react-three/drei';
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

const BASE_PATH = '/models/environments/rooms/room_level2/';

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

// Colisiones de room_level2
const BOXES: Box[] = [
  { id: 'wall-back',  min: { x: -4,   y: 0, z: -3   }, max: { x: 9,    y: 5, z: -4    } },
  { id: 'wall-front', min: { x: -4,   y: 0, z:  8.3  }, max: { x: 9,    y: 5, z:  8.6  } },
  { id: 'wall-left',  min: { x: -4,   y: 0, z: -4    }, max: { x: -3.5, y: 5, z:  8.5  } },
  { id: 'wall-right', min: { x:  9,   y: 0, z: -4    }, max: { x:  9.5, y: 5, z:  8.5  } },
  { id: 'bed',        min: { x: -3.5, y: 0, z: -3.2  }, max: { x:  0,   y: 1.6, z: 3   } },
  { id: 'desk',       min: { x:  3,   y: 0, z: -3.5  }, max: { x:  8,   y: 2,   z: -1.7} },
  { id: 'desk2',      min: { x:  6.6, y: 0, z: -3.5  }, max: { x:  8,   y: 2,   z:  0  } },
  { id: 'wardrobe',   min: { x: -3.5, y: 0, z:  4.5  }, max: { x: -2.2, y: 4,   z:  7  } },
];

// Centro de cada mueble para los botones interactivos
const BED_CENTER:      [number, number, number] = [-1.75, 0, -0.1];
const DESK_CENTER:     [number, number, number] = [ 5.5,  0, -2.6];
const WARDROBE_CENTER: [number, number, number] = [-2.85, 0,  5.75];

export function RoomLevel2() {
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
    fetch('/data/room_level2.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[RoomLevel2] Config load error:', err));
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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSleep = () => {
    if (energy >= 100) { addNotification('info', '😊 Ya tienes energía al máximo'); return; }
    const BED_POS = { x: -1.75, y: 0.6, z: -0.1 };
    const BED_EXIT = { x: 0.5, y: 0, z: -0.1 };
    if (playerRef) {
      playerRef.position.set(BED_POS.x, BED_POS.y, BED_POS.z);
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
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] - 1, y: seatY, z: DESK_CENTER[2] + 1.7 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { setGamePhase('rhythm_game'); }, 800);
  };

  const handleWork = () => {
    if (energy < 15) { addNotification('warning', '💼 Necesitas al menos 15 de energía para trabajar'); return; }
    const gender = usePlayerStore.getState().characterGender;
    const seatY = gender === 'female' ? -0.65 : -0.3;
    usePlayerStore.getState().setPosition({ x: DESK_CENTER[0] - 1, y: seatY, z: DESK_CENTER[2] + 1.7 });
    usePlayerStore.getState().setPlayerSitting(true);
    setTimeout(() => { useGameStore.getState().setGamePhase('online_job'); }, 800);
  };

  if (uniqueObjects.length === 0) return null;

  return (
    <>
      <group name="room-level-2" scale={[0.3, 0.3, 0.3]} rotation={[0, Math.PI, 0]}>
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <RoomAsset name={obj.name} />
          </Suspense>
        ))}
      </group>

      {/* 🛏️ Cama — Dormir */}
      <InteractableZone
        position={BED_CENTER}
        size={[3.5, 2, 6.2]}
        label="Dormir"
        icon="🛏️"
        onInteract={handleSleep}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 🎤 Computador — Grabar Canción (lado izquierdo del escritorio) */}
      <InteractableZone
        position={[4.5, 0, -2.6]}
        size={[2.5, 2, 1.8]}
        label="Grabar Canción"
        icon="🎤"
        onInteract={handleRecord}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 💼 Computador — Buscar Trabajo (lado derecho del escritorio) */}
      <InteractableZone
        position={[7, 0, -2.6]}
        size={[2.5, 2, 1.8]}
        label="Buscar Trabajo"
        icon="💼"
        onInteract={handleWork}
        tooltipOffset={[0, 2.5, 0]}
      />

      {DEBUG_COLLISIONS && BOXES.map((b) => <DebugBox key={b.id} box={b} />)}
    </>
  );
}
