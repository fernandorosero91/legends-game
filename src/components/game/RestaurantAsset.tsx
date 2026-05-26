/**
 * LEGENDS: RestaurantAsset — Loads a single restaurant GLB asset
 */

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const BASE_PATH = '/models/environments/restaurant/';

export function RestaurantAsset({ name }: { name: string }) {
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
