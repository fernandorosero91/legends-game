/**
 * LEGENDS: RestaurantLevel1 — Loads restaurant GLB assets from JSON manifest
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { RestaurantAsset } from './RestaurantAsset';

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
