/**
 * LEGENDS: SandraOwner
 * Dueña del Purple Market. Aparece detrás de la caja registradora.
 * Dispara el diálogo de contratación via uiStore al montar (primera vez).
 */

import { useRef, useMemo, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

const MODEL_PATH = '/models/npcs/fan1.glb';
const STORAGE_KEY = 'legends-sandra-intro-seen';

// Diálogo de contratación — 4 líneas, avanza con click/espacio
export const SANDRA_HIRE_DIALOGUE = [
  { id: 'sandra_1', speaker: 'Sandra',  text: 'Oye, tú. Sí, tú. ¿Buscas trabajo?' },
  { id: 'sandra_2', speaker: 'Jugador', text: '...depende.' },
  { id: 'sandra_3', speaker: 'Sandra',  text: 'Necesito a alguien en caja. No pago mal, y si eres rápido con los números, te va bien. ¿Qué dices?' },
  { id: 'sandra_4', speaker: 'Jugador', text: 'Está bien. Lo intento.' },
  { id: 'sandra_5', speaker: 'Sandra',  text: 'Bien. La caja es tuya. No me hagas quedar mal.' },
];

export function hasSeenSandraIntro(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markSandraIntroSeen(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

interface SandraOwnerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function SandraOwner({
  position = [-28, 0.1, 10],
  rotation = [0, Math.PI * 0.5, 0],
}: SandraOwnerProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, group);

  // Sombras
  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clone]);

  // Reproducir idle con respiración
  useEffect(() => {
    const idle = actions['idle'];
    if (idle) {
      idle.reset().play();
      idle.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      const first = Object.values(actions)[0];
      if (first) first.reset().play();
    }
  }, [actions]);

  // Leve balanceo de cabeza
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = rotation[1] + Math.sin(t * 0.4) * 0.04;
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <primitive object={clone} scale={2.2} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
