import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore, type CharacterModel } from '../../store/playerStore';

// ── Animation name maps per character ───────────────────
// player1.glb uses "CharacterArmature|AnimName" convention
// player2.glb uses plain names: "idle", "walking", "running", "sitting", "t_pose"
const ANIM_MAPS: Record<CharacterModel, Record<string, string>> = {
  player1: {
    idle: 'CharacterArmature|Idle_Neutral',
    walk: 'CharacterArmature|Walk',
    run: 'CharacterArmature|Run',
    sit: 'CharacterArmature|Idle_Neutral', // fallback — player1 has no sitting anim
  },
  player2: {
    idle: 'idle',
    walk: 'walking',
    run: 'running',
    sit: 'sitting',
  },
};

const MODEL_PATHS: Record<CharacterModel, string> = {
  player1: '/models/player1.glb',
  player2: '/models/player2.glb',
};

const MODEL_SCALES: Record<CharacterModel, number> = {
  player1: 0.3,
  player2: 0.85,
};

const CROSSFADE_DURATION = 0.3;
const PLAYER_RADIUS = 0.08;

export function Player({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const selectedCharacter = usePlayerStore((s) => s.selectedCharacter);
  const modelPath = MODEL_PATHS[selectedCharacter];
  const animMap = ANIM_MAPS[selectedCharacter];
  const modelScale = MODEL_SCALES[selectedCharacter];

  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);
  const setPlayerRef = usePlayerStore((s) => s.setPlayerRef);
  const wallBoxes = usePlayerStore((s) => s.wallBoxes);

  const forward = useRef(false);
  const back = useRef(false);
  const left = useRef(false);
  const right = useRef(false);
  const shift = useRef(false);
  const currentAction = useRef('');
  const floorY = useRef(position[1]);

  // Clone scene so multiple instances don't share geometry state
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // ── Animation helper ──────────────────────────────────
  const playAnim = (key: string) => {
    const name = animMap[key];
    if (!name || name === currentAction.current) return;

    const prev = actions[currentAction.current];
    const next = actions[name];

    if (prev) prev.fadeOut(CROSSFADE_DURATION);
    if (next) {
      next.reset().fadeIn(CROSSFADE_DURATION).play();
    }
    currentAction.current = name;
  };

  // ── Setup: ref, shadows, initial anim, keyboard ──────
  useEffect(() => {
    if (group.current) {
      setPlayerRef(group.current);
      floorY.current = position[1];
    }
    return () => setPlayerRef(null);
  }, [setPlayerRef, position]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Start with idle animation
    const idleName = animMap.idle;
    if (idleName && actions[idleName]) {
      actions[idleName]!.reset().play();
      currentAction.current = idleName;
    } else {
      // Fallback: try the first available animation
      const firstKey = Object.keys(actions)[0];
      if (firstKey && actions[firstKey]) {
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
        case 'ShiftLeft': case 'ShiftRight': shift.current = val; break;
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
  }, [actions, clonedScene, animMap]);

  // ── Frame loop: movement + animation ──────────────────
  useFrame((_s, delta) => {
    if (!group.current) return;

    let mx = 0, mz = 0;
    if (forward.current) mz = -1;
    if (back.current) mz = 1;
    if (left.current) mx = -1;
    if (right.current) mx = 1;

    const moving = mx !== 0 || mz !== 0;
    const running = moving && shift.current;

    // Normalize diagonal movement
    if (mx !== 0 && mz !== 0) {
      const l = Math.sqrt(mx * mx + mz * mz);
      mx /= l;
      mz /= l;
    }

    // Pick animation
    if (running) {
      playAnim('run');
    } else if (moving) {
      playAnim('walk');
    } else {
      playAnim('idle');
    }

    // Move
    if (moving) {
      const angle = Math.atan2(mx, mz);
      group.current.rotation.y = angle;

      const speed = (running ? 1.6 : 0.8) * delta;
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
      <primitive object={clonedScene} scale={modelScale} castShadow />
    </group>
  );
}

// ── Collision helper ────────────────────────────────────
function hitWall(
  x: number,
  z: number,
  walls: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }>
): boolean {
  for (const box of walls) {
    const cx = Math.max(box.min.x, Math.min(x, box.max.x));
    const cz = Math.max(box.min.z, Math.min(z, box.max.z));
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

// Preload both models
useGLTF.preload('/models/player1.glb');
useGLTF.preload('/models/player2.glb');
