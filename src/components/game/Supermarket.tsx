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

// DEBUG: set to true to see collision walls as red boxes
const DEBUG_COLLISIONS = false;

function SupermarketAsset({ name }: { name: string }) {
  const path = `${BASE_PATH}${name}.glb`;
  const { scene } = useGLTF(path);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        child.frustumCulled = true;
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} position={[0, 0, 0]} />;
}

type WallBox = { id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };

function DebugWall({ box }: { box: WallBox }) {
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

  const walls: WallBox[] = useMemo(() => {
    const T = 0.6;
    const H = 6;
    return [
      // ── Paredes perimetrales ──────────────────────────────────────────────
      { id: 'wall-back',  min: { x: -40, y: 0, z:  18 },       max: { x: 40, y: H, z:  18 + T } },
      { id: 'wall-front', min: { x: -30, y: 0, z: -5 - T },    max: { x: 40, y: H, z: -20 } },
      { id: 'wall-left',  min: { x: -40 - T, y: 0, z: -20 },   max: { x: -31, y: H, z: 18 } },
      { id: 'wall-right', min: { x: 7, y: 0, z: -20 },         max: { x:  22 + T, y: H, z: 18 } },

      // ── Estanterías (dos filas horizontales) ─────────────────────────────
      { id: 'shelf-row-1', min: { x: -16, y: 0, z:  8.5 }, max: { x: 2, y: H, z:  11.5 } },
      { id: 'shelf-row-2', min: { x: -16, y: 0, z: 0 }, max: { x: 2, y: H, z: 3 } },

      // ── Caja registradora (posicion en StoreScene: [-25, 0, 11]) ─────────
      { id: 'cashier', min: { x: -26.2, y: 0, z: 9 }, max: { x: -24.8, y: H, z: 14 } },

      // ── Caja registradora (posicion en StoreScene: [-25, 0, 11]) ─────────
      { id: 'cashier', min: { x: -27.9, y: 0, z: 9 }, max: { x: -24.8, y: H, z: 10.2 } },
      
      // ── Carrito d compras
      { id: 'cashier', min: { x: -29.8, y: 0, z: 6 }, max: { x: -27.8, y: H, z: 4.5 } },
    ];
  }, []);

  useEffect(() => {
    setWallBoxes(walls);
  }, [walls, setWallBoxes]);

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
    <>
      <group name="supermarket" scale={[2, 2, 2]} position={[0, -0.2, 0]}>
        {uniqueObjects.map((obj, i) => (
          <Suspense key={`${obj.name}-${i}`} fallback={null}>
            <SupermarketAsset name={obj.name} />
          </Suspense>
        ))}
      </group>

      {/* Debug: paredes de colision visibles en rojo */}
      {DEBUG_COLLISIONS && walls.map((w) => <DebugWall key={w.id} box={w} />)}
    </>
  );
}
