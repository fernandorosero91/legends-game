/**
 * LEGENDS: DishModel — Renders a single dish GLB model at a given position.
 * Used on the chef's counter for the player to pick up orders.
 */

import { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const BASE_PATH = '/models/dishes/';

interface DishModelProps {
  /** File name without path, e.g. "pizza.glb" */
  fileName: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onClick?: () => void;
}

export function DishModel({
  fileName,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  visible = true,
  onClick,
}: DishModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`${BASE_PATH}${fileName}`);

  if (!visible) return null;

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      dispose={null}
    >
      <primitive object={scene.clone()} />
    </group>
  );
}

// Pre-load all dish models
useGLTF.preload('/models/dishes/pizza.glb');
useGLTF.preload('/models/dishes/hamburguesa.glb');
useGLTF.preload('/models/dishes/bandeja_paisa.glb');
useGLTF.preload('/models/dishes/perro caliente.glb');
