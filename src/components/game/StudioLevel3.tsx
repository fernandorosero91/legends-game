/**
 * LEGENDS: StudioLevel3 — Loads studio_level_3 GLB assets
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

const BASE_PATH = '/models/environments/studio_level_3/';

function StudioAsset({ name }: { name: string }) {
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

export function StudioLevel3() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    fetch('/data/studio_level_3.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[StudioLevel3] Config load error:', err));
  }, []);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  // Set collision boxes for studio
  useEffect(() => {
    const boxes = [
      { id: 'wall-back',   min: { x: -11, y: 0, z: -7 },   max: { x: 11, y: 5, z: -6.5 } },
      { id: 'wall-front',  min: { x: -11, y: 0, z: 6.5 },  max: { x: 11, y: 5, z: 7 } },
      { id: 'wall-left',   min: { x: -11, y: 0, z: -7 },   max: { x: -10.5, y: 5, z: 7 } },
      { id: 'wall-right',  min: { x: 10.5, y: 0, z: -7 },  max: { x: 11, y: 5, z: 7 } },
    ];
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  if (uniqueObjects.length === 0) {
    return (
      <group name="studio-level-3-loading">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#2d1b4e" />
        </mesh>
      </group>
    );
  }

  return (
    <group name="studio-level-3">
      {uniqueObjects.map((obj, i) => (
        <Suspense key={`${obj.name}-${i}`} fallback={null}>
          <StudioAsset name={obj.name} />
        </Suspense>
      ))}
    </group>
  );
}
