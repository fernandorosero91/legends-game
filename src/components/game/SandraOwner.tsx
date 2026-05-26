/**
 * LEGENDS: SandraOwner — Dueña del Purple Market.
 * Primera visita: idle en la caja + diálogo.
 * Visitas siguientes: patrulla alrededor de las estanterías.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

const MODEL_PATH = '/models/npcs/fan1.glb';
const STORAGE_KEY = 'legends-sandra-intro-seen';

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

// ── Ruta: rectángulo alrededor de las dos estanterías ────────────────────────
//
// Obstáculos (NO tocar):
//   shelf-row-1: X[-16, 2]      Z[8.5,  11.5]
//   shelf-row-2: X[-16, 2]      Z[0,    3]
//   caja:        X[-27.9,-24.8] Z[9,    14]   ← nunca ir a X < -17
//   carrito:     X[-29.8,-27.8] Z[4.5,  6]    ← nunca ir a X < -17
//   wall-left:   X < -30
//   wall-right:  X > 6
//   wall-back:   Z > 17
//   wall-front:  Z < -5
//
// Ruta en sentido horario, margen de 1.5u respecto a cada obstáculo:
//   Lado superior (Z=13):  X de -17 a 4   (sobre shelf-row-1, lejos de caja)
//   Lado derecho  (X=4):   Z de 13  a -2  (a la derecha de ambos estantes)
//   Lado inferior (Z=-2):  X de 4   a -17 (bajo shelf-row-2)
//   Lado izquierdo(X=-17): Z de -2  a 13  (lejos de caja y carrito)
//
const PATROL_ROUTE: [number, number, number][] = [
  // Lado superior — Z=13 (sobre shelf-row-1 que termina en Z=11.5)
  [-17, 0.1, 6],
  [ -8, 0.1, 6],
  [  4, 0.1, 6],

  // Lado derecho — X=4 (a la derecha de shelf que termina en X=2)
  [  4, 0.1,  9],
  [  4, 0.1,  5],
  [  4, 0.1, -2],

  // Lado inferior — Z=-2 (bajo shelf-row-2 que empieza en Z=0)
  [ -5, 0.1, -2],
  [-17, 0.1, -2],

  // Lado izquierdo — X=-17 (lejos de caja X=-24.8 y carrito X=-27.8)
  [-20, 0.1,  4],
  [-20, 0.1,  8],
  [-20, 0.1, 13],
];

// Colisiones para que Sandra las respete al moverse
type Box = { min: { x: number; z: number }; max: { x: number; z: number } };
const STORE_BOXES: Box[] = [
  { min: { x: -40.6, z: -20  }, max: { x: -31,   z: 18   } }, // wall-left
  { min: { x:  7,    z: -20  }, max: { x:  22.6,  z: 18   } }, // wall-right
  { min: { x: -40,   z: 18   }, max: { x:  40,    z: 18.6 } }, // wall-back
  { min: { x: -30,   z: -5.6 }, max: { x:  40,    z: -20  } }, // wall-front
  { min: { x: -16,   z:  8.5 }, max: { x:   2,    z: 11.5 } }, // shelf-row-1
  { min: { x: -16,   z:  0   }, max: { x:   2,    z:  3   } }, // shelf-row-2
  { min: { x: -27.9, z:  9   }, max: { x: -24.8,  z: 14   } }, // caja
  { min: { x: -29.8, z:  4.5 }, max: { x: -27.8,  z:  6   } }, // carrito
];

const NPC_RADIUS = 1.0;
const WALK_SPEED = 2.5;
const WAYPOINT_THRESHOLD = 0.5;

function collidesWithStore(x: number, z: number): boolean {
  for (const box of STORE_BOXES) {
    const cx = Math.max(box.min.x, Math.min(x, box.max.x));
    const cz = Math.max(box.min.z, Math.min(z, box.max.z));
    const dx = x - cx, dz = z - cz;
    if (dx * dx + dz * dz < NPC_RADIUS * NPC_RADIUS) return true;
  }
  return false;
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

  const [isPatrolling] = useState(() => hasSeenSandraIntro());
  const waypointIdxRef = useRef(0);
  const currentAnim    = useRef('');

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clone]);

  useEffect(() => {
    const animName = isPatrolling ? 'walking' : 'idle';
    const anim = actions[animName] || Object.values(actions)[0];
    if (anim) {
      anim.reset().play();
      anim.setLoop(THREE.LoopRepeat, Infinity);
      currentAnim.current = animName;
    }
  }, [actions, isPatrolling]);

  const playAnim = (name: string) => {
    if (currentAnim.current === name) return;
    const prev = actions[currentAnim.current];
    const next = actions[name];
    if (prev) prev.fadeOut(0.2);
    if (next) next.reset().fadeIn(0.2).play();
    currentAnim.current = name;
  };

  useFrame((_s, delta) => {
    if (!group.current) return;

    if (!isPatrolling) {
      const t = _s.clock.getElapsedTime();
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.4) * 0.04;
      return;
    }

    const target    = PATROL_ROUTE[waypointIdxRef.current];
    const targetVec = new THREE.Vector3(target[0], target[1], target[2]);
    const pos       = group.current.position;
    const dist      = pos.distanceTo(targetVec);

    if (dist < WAYPOINT_THRESHOLD) {
      waypointIdxRef.current = (waypointIdxRef.current + 1) % PATROL_ROUTE.length;
    } else {
      const dir  = targetVec.clone().sub(pos).normalize();
      const step = WALK_SPEED * delta;
      const newX = pos.x + dir.x * step;
      const newZ = pos.z + dir.z * step;

      if (!collidesWithStore(newX, newZ)) {
        group.current.position.x = newX;
        group.current.position.z = newZ;
      } else if (!collidesWithStore(newX, pos.z)) {
        group.current.position.x = newX;
      } else if (!collidesWithStore(pos.x, newZ)) {
        group.current.position.z = newZ;
      } else {
        // Bloqueada — saltar al siguiente waypoint
        waypointIdxRef.current = (waypointIdxRef.current + 1) % PATROL_ROUTE.length;
      }

      const angle = Math.atan2(dir.x, dir.z);
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y, angle, 0.12
      );
      playAnim('walking');
    }
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={isPatrolling ? [0, 0, 0] : rotation}
    >
      <primitive object={clone} scale={2.2} />
    </group>
  );
}

// Sandra loads on-demand when store scene renders
