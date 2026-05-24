/**
 * LEGENDS: Supermarket — Optimized loader for supermarket GLB assets
 * Uses batched loading to avoid freezing the browser.
 * Loads assets in chunks of 50 per frame tick.
 */

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';

interface RoomObject {
  name: string;
  x: number;
  y: number;
  z: number;
  level: number;
  role: string;
}

const BASE_PATH = '/models/environments/supermarket/';

function SupermarketAsset({ name }: { name: string }) {
  const path = `${BASE_PATH}${name}.glb`;
  const { scene } = useGLTF(path);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false; // Disable shadows for performance
        child.receiveShadow = true;
        // Enable frustum culling (default but explicit)
        child.frustumCulled = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={[0, 0, 0]} />;
}

export function Supermarket() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    fetch('/data/supermarket.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[Supermarket] Config load error:', err));
  }, []);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  // Only outer walls — scaled 2x
  useEffect(() => {
    const boxes = [
      { id: 'wall-back',  min: { x: -28, y: 0, z: -20 }, max: { x: 32, y: 8, z: -18 } },
      { id: 'wall-front', min: { x: -28, y: 0, z: 15 },  max: { x: 32, y: 8, z: 17 } },
      { id: 'wall-left',  min: { x: -28, y: 0, z: -20 }, max: { x: -26, y: 8, z: 17 } },
      { id: 'wall-right', min: { x: 30, y: 0, z: -20 },  max: { x: 32, y: 8, z: 17 } },
    ];
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  // With only 18 grouped GLBs, no need for progressive loading
  if (uniqueObjects.length === 0) {
    return (
      <group name="supermarket-loading">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[28, 16]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      </group>
    );
  }

  return (
    <group name="supermarket" scale={[2, 2, 2]} position={[0, -0.2, 0]}>
      {uniqueObjects.map((obj, i) => (
        <Suspense key={`${obj.name}-${i}`} fallback={null}>
          <SupermarketAsset name={obj.name} />
        </Suspense>
      ))}
    </group>
  );
}
