import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { usePlayerStore } from '../../store/playerStore';

const ANIMS = {
  idle: 'idle.001',
  walk: 'walking',
};

const PLAYER_RADIUS = 0.08;

export function Player({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/player1.glb');

  // Clone the scene so the skeleton is properly owned by this group
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { actions } = useAnimations(animations, group);
  const setPlayerRef = usePlayerStore((s) => s.setPlayerRef);
  const wallBoxes = usePlayerStore((s) => s.wallBoxes);

  const forward = useRef(false);
  const back = useRef(false);
  const left = useRef(false);
  const right = useRef(false);
  const currentAction = useRef('');
  const floorY = useRef(position[1]);

  const playAnim = (name: string) => {
    if (name === currentAction.current) return;
    const prev = actions[currentAction.current];
    const next = actions[name];
    if (prev) prev.fadeOut(0.15);
    if (next) next.reset().fadeIn(0.15).play();
    currentAction.current = name;
  };

  useEffect(() => {
    if (group.current) {
      setPlayerRef(group.current);
      floorY.current = position[1];
    }
    return () => setPlayerRef(null);
  }, [setPlayerRef, position]);

  useEffect(() => {
    // Debug: log available animation names so we can verify they match
    console.log('[Player] Available animations:', animations.map((a) => a.name));
    console.log('[Player] Actions keys:', Object.keys(actions));

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Try to play the idle animation
    const idleAction = actions[ANIMS.idle];
    if (idleAction) {
      idleAction.reset().play();
      currentAction.current = ANIMS.idle;
    } else {
      // Fallback: play the first available animation
      const firstKey = Object.keys(actions)[0];
      if (firstKey && actions[firstKey]) {
        console.warn(`[Player] '${ANIMS.idle}' not found, falling back to '${firstKey}'`);
        actions[firstKey]!.reset().play();
        currentAction.current = firstKey;
      }
    }

    const setKey = (e: KeyboardEvent, val: boolean) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': forward.current = val; break;
        case 'KeyS': case 'ArrowDown': back.current = val; break;
        case 'KeyA': case 'ArrowLeft': left.current = val; break;
        case 'KeyD': case 'ArrowRight': right.current = val; break;
        default: return;
      }
      e.preventDefault();
    };

    const onDown = (e: KeyboardEvent) => setKey(e, true);
    const onUp = (e: KeyboardEvent) => setKey(e, false);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [actions, clone, animations]);

  useFrame((_s, delta) => {
    if (!group.current) return;

    let mx = 0, mz = 0;
    if (forward.current) mz = -1;
    if (back.current) mz = 1;
    if (left.current) mx = -1;
    if (right.current) mx = 1;

    const moving = mx !== 0 || mz !== 0;

    if (mx !== 0 && mz !== 0) {
      const l = Math.sqrt(mx * mx + mz * mz);
      mx /= l; mz /= l;
    }

    playAnim(moving ? ANIMS.walk : ANIMS.idle);

    if (moving) {
      const angle = Math.atan2(mx, mz);
      group.current.rotation.y = angle;

      const speed = 0.8 * delta;
      const oldX = group.current.position.x;
      const oldZ = group.current.position.z;
      const newX = oldX + Math.sin(angle) * speed;
      const newZ = oldZ + Math.cos(angle) * speed;

      if (wallBoxes.length === 0 || !hitWall(newX, newZ, wallBoxes)) {
        group.current.position.x = newX;
        group.current.position.z = newZ;
      } else if (!hitWall(newX, oldZ, wallBoxes)) {
        group.current.position.x = newX;
      } else if (!hitWall(oldX, newZ, wallBoxes)) {
        group.current.position.z = newZ;
      }
    }

    group.current.position.y = floorY.current;
  });

  return (
    <group ref={group} position={position}>
      <primitive object={clone} scale={0.3} castShadow />
    </group>
  );
}

function hitWall(x: number, z: number, walls: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }>): boolean {
  for (const box of walls) {
    const cx = Math.max(box.min.x, Math.min(x, box.max.x));
    const cz = Math.max(box.min.z, Math.min(z, box.max.z));
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

useGLTF.preload('/models/player1.glb');
