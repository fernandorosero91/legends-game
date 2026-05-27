/**
 * LEGENDS: RestaurantLevel1 — Loads restaurant GLB assets from JSON manifest
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { RestaurantAsset } from './RestaurantAsset';
import { usePlayerStore } from '../../store/playerStore';

interface RoomObject {
  name: string;
  x: number;
  y: number;
  z: number;
  level: number;
  role: string;
}

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

export function RestaurantLevel1() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    fetch('/data/restaurant.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[RestaurantLevel1] Config load error:', err));
  }, []);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  // Collision boxes for the restaurant.
  const boxes: Box[] = [
    // ===== ROOM BOUNDARIES (walls / limits of the map) =====
    { id: 'wall-back',   min: { x: -8, y: 0, z: -8.5 },   max: { x: 8, y: 5, z: -7.5 } },
    { id: 'wall-front',  min: { x: -8, y: 0, z: 8 },    max: { x: 8, y: 5, z: 8.5 } },
    { id: 'wall-left',   min: { x: -8, y: 0, z: -9 },   max: { x: -7.5, y: 5, z: 8.5 } },
    { id: 'wall-right',  min: { x: 7.5, y: 0, z: -9 },  max: { x: 8, y: 5, z: 8.5 } },

    // ===== BARRA DEL CHEF =====
    { id: 'bar-counter', min: { x: -2.5, y: 0, z: -4 }, max: { x: 5.5, y: 2, z: -1.0 } },
    { id: 'bar-counter', min: { x: -2.5, y: 0, z: -7.5 }, max: { x: -1, y: 2, z: -2.0 } },
    { id: 'bar-counter', min: { x: 3.5, y: 0, z: -7.5 }, max: { x: 5.5, y: 2, z: -5.5 } },

    // ===== MESA 1 (derecha) =====
    { id: 'table-1',    min: { x: 2.2, y: 0, z: 2.8 },  max: { x: 4.5, y: 1.5, z: 5.1 } },

    // ===== MESA 2 (izquierda) =====
    { id: 'table-2',    min: { x: -5.0, y: 0, z: 2.8 },  max: { x: -2.6, y: 1.5, z: 5.1 } },
  ];

  useEffect(() => {
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  if (uniqueObjects.length === 0) return null;

  return (
    <>
      <group name="restaurant-level-1" scale={0.8}>
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <RestaurantAsset name={obj.name} />
          </Suspense>
        ))}
      </group>
      {DEBUG_COLLISIONS && boxes.map((b) => <DebugBox key={b.id} box={b} />)}
    </>
  );
}
