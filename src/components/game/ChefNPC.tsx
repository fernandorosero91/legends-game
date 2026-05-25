/**
 * LEGENDS: ChefNPC — Chef del restaurante con animación idle
 * Modelo: /public/models/chef_animation (1).glb
 *
 * Mantiene el mismo patrón de interacción que NPCPlaceholder:
 * label flotante con tecla E al hover + nombre siempre visible.
 */

import { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/chef_animation (1).glb';

interface ChefNPCProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /**
   * Rotación Y simple (radianes) — atajo cómodo para "girar" al chef sin
   * tener que escribir el array completo de rotación.
   * Si se pasa, sobreescribe la componente Y de `rotation`.
   */
  rotationY?: number;
  scale?: number;
  name?: string;
  onInteract?: () => void;
  /** Offset 3D donde aparece el label "E - Hablar con ..." al hover */
  labelOffset?: [number, number, number];
  /** Offset 3D donde aparece el nombre flotante del NPC */
  nameOffset?: [number, number, number];
}

export function ChefNPC({
  position = [100, 0, 0],
  rotation = [0, 0, 0],
  rotationY,
  scale = 0.4,
  name = 'Chef Carlos',
  onInteract,
  labelOffset = [0, 1.0, 0],
  nameOffset = [0, 1.15, 0],
}: ChefNPCProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, group);
  const [hovered, setHovered] = useState(false);

  // Sombras
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Idle animation
  useEffect(() => {
    if (names.length === 0) return;
    const action = actions[names[0]];
    if (!action) return;
    action.reset().fadeIn(0.3).play();
    action.setLoop(THREE.LoopRepeat, Infinity);
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names]);

  return (
    <group
      ref={group}
      position={position}
      rotation={
        rotationY !== undefined
          ? [rotation[0], rotationY, rotation[2]]
          : rotation
      }
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onInteract?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={scene} />

      {/* Indicador de interacción al hover */}
      {hovered && (
        <Html position={labelOffset} center distanceFactor={6}>
          <div className="bg-purple-900/95 text-white px-4 py-2 rounded-lg border-2 border-purple-400 shadow-lg whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-700 px-3 py-1 rounded font-bold text-sm">E</kbd>
              <span className="font-medium">Hablar con {name}</span>
            </div>
          </div>
        </Html>
      )}

      {/* Nombre siempre visible */}
      <Html position={nameOffset} center distanceFactor={6}>
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap pointer-events-none">
          {name}
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
