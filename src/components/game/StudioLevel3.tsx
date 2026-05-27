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
  const boxes: Box[] = [
    { id: 'wall-back',   min: { x: -14, y: 0, z: -5   }, max: { x: 0.5, y: 5, z: -4.5 } },
    { id: 'wall-front',  min: { x: -14, y: 0, z:  13.5  }, max: { x: 0.5, y: 5, z:  14   } },
    { id: 'wall-left',   min: { x: -14.5, y: 0, z: -7   }, max: { x: -13.5, y: 5, z: 13  } },
    { id: 'wall-right',  min: { x: 0.5, y: 0, z: -7  }, max: { x: 1, y: 5, z:  13   } },
    // Muebles del estudio — ajustar con debug
    { id: 'studio-desk', min: { x: -12,  y: 0, z: -5   }, max: { x: -0,  y: 2, z: -2.5  } },
    { id: 'couch ', min: { x: -8,  y: 0, z: 8   }, max: { x: -0,  y: 1, z: 10  } },
    { id: 'couch2 ', min: { x: -8,  y: 0, z: 4   }, max: { x: -0,  y: 1, z: 6.5  } },
  ];

  useEffect(() => {
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
    <>
      <group name="studio-level-3">
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <StudioAsset name={obj.name} />
          </Suspense>
        ))}
      </group>
      {DEBUG_COLLISIONS && boxes.map((b) => <DebugBox key={b.id} box={b} />)}
    </>
  );
}
