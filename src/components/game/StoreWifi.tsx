/**
 * LEGENDS: ClothingStore — Loads clothing_store GLB assets
 * Used for the Almacén StreetWear scene
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

const BASE_PATH = '/models/environments/clothing_store/';

function ClothingStoreAsset({ name }: { name: string }) {
  const path = `${BASE_PATH}${name}.glb`;
  const { scene } = useGLTF(path);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={[0, 0, 0]} />;
}

export function StoreWifi() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    fetch('/data/clothing_store.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[ClothingStore] Config load error:', err));
  }, []);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  // Collision boxes based on clothing store layout (scaled 0.45)
  useEffect(() => {
    const boxes = [
      { id: 'wall-back',  min: { x: -3, y: 0, z: -2 },  max: { x: 3, y: 2, z: -1.5 } },
      { id: 'wall-front', min: { x: -3, y: 0, z: 2.5 }, max: { x: 3, y: 2, z: 3 } },
      { id: 'wall-left',  min: { x: -3, y: 0, z: -2 },  max: { x: -2.5, y: 2, z: 3 } },
      { id: 'wall-right', min: { x: 2.5, y: 0, z: -2 }, max: { x: 3, y: 2, z: 3 } },
    ];
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  if (uniqueObjects.length === 0) {
    return (
      <group name="clothing-store-loading">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#1a0a2e" />
        </mesh>
      </group>
    );
  }

  return (
    <group name="clothing-store" scale={[0.45, 0.45, 0.45]} position={[0, -0.75, 0]}>
      {uniqueObjects.map((obj, i) => (
        <Suspense key={`${obj.name}-${i}`} fallback={null}>
          <ClothingStoreAsset name={obj.name} />
        </Suspense>
      ))}
    </group>
  );
}
