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
  // All coordinates are in world space (already factoring in the 0.8 group scale).
  useEffect(() => {
    const boxes = [
      // ===== ROOM BOUNDARIES (walls / limits of the map) =====
      { id: 'wall-back',   min: { x: -8, y: 0, z: -9 },   max: { x: 8, y: 5, z: -8.5 } },
      { id: 'wall-front',  min: { x: -8, y: 0, z: 8 },    max: { x: 8, y: 5, z: 8.5 } },
      { id: 'wall-left',   min: { x: -8, y: 0, z: -9 },   max: { x: -7.5, y: 5, z: 8.5 } },
      { id: 'wall-right',  min: { x: 7.5, y: 0, z: -9 },  max: { x: 8, y: 5, z: 8.5 } },

      // ===== BARRA DEL CHEF (bar_mesh.001, .001.001, .001.003) =====
      // La barra corre horizontalmente de x≈-2 a x≈5, z entre -4.5 y -2.5
      { id: 'bar-counter', min: { x: -2.5, y: 0, z: -4.5 }, max: { x: 5.5, y: 2, z: -2.0 } },

      // ===== MESA 1 (derecha) — bar_mesh.019_lev1 =====
      // Centro aprox: (3.37, y, 3.94), radio aprox 1.2
      { id: 'table-1',    min: { x: 2.2, y: 0, z: 2.8 },  max: { x: 4.5, y: 1.5, z: 5.1 } },

      // ===== MESA 2 (izquierda) — bar_mesh.014_lev1 =====
      // Centro aprox: (-3.80, y, 3.94), radio aprox 1.2
      { id: 'table-2',    min: { x: -5.0, y: 0, z: 2.8 },  max: { x: -2.6, y: 1.5, z: 5.1 } },
    ];
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  if (uniqueObjects.length === 0) return null;

  return (
    <group name="restaurant-level-1" scale={0.8}>
      {uniqueObjects.map((obj, i) => (
        <Suspense key={`${obj.name}-${i}`} fallback={null}>
          <RestaurantAsset name={obj.name} />
        </Suspense>
      ))}
    </group>
  );
}
