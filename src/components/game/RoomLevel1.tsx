/**
 * LEGENDS: RoomLevel1 — Loads room_level1 GLB assets and generates collision boxes
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

const BASE_PATH = '/models/environments/room_level1/';

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

// Collision disabled — bounding boxes from room structure are too large and block movement
const COLLISION_OBJECTS = new Set<string>();function RoomAsset({ name }: { name: string }) {
  const path = `${BASE_PATH}${name}.glb`;
  const { scene } = useGLTF(path);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Recolor very dark floor materials
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.color) {
          const r = mat.color.r, g = mat.color.g, b = mat.color.b;
          // If material is very dark (near black), replace with a warm dark wood color
          if (r < 0.08 && g < 0.08 && b < 0.08) {
            mat.color.set('#5a4a6e'); // lighter purple-gray floor
            mat.roughness = 0.8;
          }
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={[0, 0, 0]} />;
}

export function RoomLevel1() {
  const [objects, setObjects] = useState<RoomObject[]>([]);
  const setWallBoxes = usePlayerStore((s) => s.setWallBoxes);

  useEffect(() => {
    fetch('/data/room_level1.json')
      .then((r) => r.json())
      .then((data: RoomObject[]) => setObjects(data))
      .catch((err) => console.error('[RoomLevel1] Config load error:', err));
  }, []);

  const uniqueObjects = useMemo(() => {
    const seen = new Set<string>();
    return objects.filter((obj) => {
      if (seen.has(obj.name)) return false;
      seen.add(obj.name);
      return true;
    });
  }, [objects]);

  // Set manual collision boxes based on room layout
  useEffect(() => {
    const boxes: Box[] = [
      // Room walls — keep player inside
      { id: 'wall-back',   min: { x: -11, y: 0, z: -7 },   max: { x: 11, y: 5, z: -6.5 } },
      { id: 'wall-front',  min: { x: -11, y: 0, z: 6.5 },  max: { x: 11, y: 5, z: 7 } },
      { id: 'wall-left',   min: { x: -11, y: 0, z: -7 },   max: { x: -10.5, y: 5, z: 7 } },
      { id: 'wall-right',  min: { x: 10.5, y: 0, z: -7 },  max: { x: 11, y: 5, z: 7 } },
      // Bed area (bottom-left)
      { id: 'bed',         min: { x: -9.5, y: 0, z: 3.5 },   max: { x: -5.5, y: 1, z: 5.5 } },
      // Speakers/stereo (left wall)
      { id: 'speakers',    min: { x: -9.5, y: 0, z: -1 },  max: { x: -8, y: 3, z: 1.5 } },
      // Desk (back-center)
      { id: 'desk',        min: { x: -2, y: 0, z: -5.5 },  max: { x: 1, y: 1.8, z: -3.5 } },
      // Bookshelf/cabinet (right side)
      { id: 'cabinet',     min: { x: 6, y: 0, z: -5.5 },   max: { x: 10, y: 3, z: -2 } },
      // Plant (right-front)
      { id: 'plant',       min: { x: 8, y: 0, z: -1.5 },   max: { x: 10, y: 2, z: 0.5 } },
    ];
    setWallBoxes(boxes);
  }, [setWallBoxes]);

  if (uniqueObjects.length === 0) return null;

  const boxes: Box[] = [
    { id: 'wall-back',   min: { x: -11, y: 0, z: -7 },   max: { x: 11, y: 5, z: -6.5 } },
    { id: 'wall-front',  min: { x: -11, y: 0, z: 6.5 },  max: { x: 11, y: 5, z: 7 } },
    { id: 'wall-left',   min: { x: -11, y: 0, z: -7 },   max: { x: -10.5, y: 5, z: 7 } },
    { id: 'wall-right',  min: { x: 10.5, y: 0, z: -7 },  max: { x: 11, y: 5, z: 7 } },
    { id: 'bed',         min: { x: -9.5, y: 0, z: 3.5 },   max: { x: -5.5, y: 1, z: 5.5 } },
    { id: 'speakers',    min: { x: -9.5, y: 0, z: -1 },  max: { x: -8, y: 3, z: 1.5 } },
    { id: 'desk',        min: { x: -2, y: 0, z: -5.5 },  max: { x: 1, y: 1.5, z: -3.5 } },
    { id: 'cabinet',     min: { x: 6, y: 0, z: -5.5 },   max: { x: 10, y: 3, z: -2 } },
    { id: 'plant',       min: { x: 8, y: 0, z: -1.5 },   max: { x: 10, y: 2, z: 0.5 } },
  ];

  return (
    <>
      <group name="room-level-1">
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <RoomAsset name={obj.name} />
          </Suspense>
        ))}
      </group>
      {DEBUG_COLLISIONS && boxes.map((b) => <DebugBox key={b.id} box={b} />)}
    </>
  );
}
