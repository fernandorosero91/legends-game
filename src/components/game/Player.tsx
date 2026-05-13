import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';

// Animaciones por modelo - player1 (masculino) tiene nombres confirmados
// player2 (femenino) puede tener nombres diferentes, se usa fallback
const ANIMS_MALE = {
  idle: 'idle.001',
  walk: 'walking',
  sit: 'sitting',
};

// Para el modelo femenino: solo tiene 'walking' y 'tpose'
// Usamos 'walking' como idle (se pausará en frame 0)
const ANIMS_FEMALE = {
  idle: 'walking',
  walk: 'walking',
  sit: 'walking',
};

const PLAYER_RADIUS = 0.7;

interface PlayerProps {
  position?: [number, number, number];
}

export function Player({ position = [0, 0, 0] }: PlayerProps) {
  const characterGender = usePlayerStore((s) => s.characterGender);
  const gender = characterGender || 'male';
  const modelPath = gender === 'female' ? '/models/player2.glb' : '/models/player1.glb';
  const ANIMS = gender === 'female' ? ANIMS_FEMALE : ANIMS_MALE;

  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);

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
  const isMoving = useRef(false);
  const floorY = useRef(position[1]);
  const sameClip = ANIMS.idle === ANIMS.walk; // true for player2

  // Find the best matching animation name
  const findAnim = (desired: string): string | null => {
    if (actions[desired]) return desired;
    const lower = desired.toLowerCase();
    const match = Object.keys(actions).find((k) => k.toLowerCase() === lower);
    if (match) return match;
    const partial = Object.keys(actions).find((k) => k.toLowerCase().includes(lower.split('.')[0]));
    return partial || null;
  };

  const playAnim = (name: string) => {
    const resolved = findAnim(name);
    if (!resolved) return;
    const wantMove = name === ANIMS.walk;

    // player2: idle and walk share the same clip
    if (sameClip) {
      const action = actions[resolved];
      if (!action) return;

      // First time: start the clip
      if (currentAction.current !== resolved) {
        action.reset().play();
        currentAction.current = resolved;
      }

      // Toggle freeze based on movement
      if (wantMove && !isMoving.current) {
        action.timeScale = 1;
        isMoving.current = true;
      } else if (!wantMove && isMoving.current) {
        action.timeScale = 0;
        action.time = 0; // snap to frame 0 (standing pose)
        isMoving.current = false;
      }
      return;
    }

    // player1: different clips for idle and walk
    if (resolved === currentAction.current) return;
    const prev = actions[currentAction.current];
    const next = actions[resolved];
    if (prev) prev.fadeOut(0.15);
    if (next) next.reset().fadeIn(0.15).play();
    currentAction.current = resolved;
  };

  useEffect(() => {
    if (group.current) {
      setPlayerRef(group.current);
      floorY.current = position[1];
    }
    return () => setPlayerRef(null);
  }, [setPlayerRef, position]);

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Play idle animation
    const idleName = findAnim(ANIMS.idle);
    if (idleName && actions[idleName]) {
      actions[idleName]!.reset().play();
      currentAction.current = idleName;
      // For player2: freeze at frame 0 on start
      if (sameClip) {
        actions[idleName]!.timeScale = 0;
        actions[idleName]!.time = 0;
        isMoving.current = false;
      }
    } else {
      // Fallback: first available animation
      const firstKey = Object.keys(actions)[0];
      if (firstKey && actions[firstKey]) {
        console.warn(`[Player] Idle not found, falling back to '${firstKey}'`);
        actions[firstKey]!.reset().play();
        currentAction.current = firstKey;
      }
    }

    const setKey = (e: KeyboardEvent, val: boolean) => {
      // Don't move player during minigames or other non-playing phases
      const { gamePhase } = useGameStore.getState();
      if (gamePhase !== 'playing') {
        forward.current = false;
        back.current = false;
        left.current = false;
        right.current = false;
        return;
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, clone, animations, modelPath]);

  useFrame((_s, delta) => {
    if (!group.current) return;

    // Don't process movement during minigames
    const { gamePhase } = useGameStore.getState();
    if (gamePhase !== 'playing') {
      // Reset movement keys to prevent stuck movement
      forward.current = false;
      back.current = false;
      left.current = false;
      right.current = false;
      playAnim(ANIMS.idle);
      group.current.position.y = floorY.current;
      return;
    }

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

      const speed = 5 * delta;
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
      <primitive object={clone} scale={2.2} castShadow />
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

// Only preload player1 (male) by default — player2 loads on demand
useGLTF.preload('/models/player1.glb');
