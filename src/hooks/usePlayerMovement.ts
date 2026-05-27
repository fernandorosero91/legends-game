/**
 * 🎮 LEGENDS: Player Movement Hook
 * Hook para movimiento del jugador en escena 3D
 * Autor: Felipe (Systems Developer)
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Vector3 } from 'three';

interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
}

export const usePlayerMovement = () => {
  const { playerRef, position, setPosition } = usePlayerStore();
  const { gamePhase } = useGameStore();
  const movementState = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  // Velocidades
  const WALK_SPEED = 0.05;
  const RUN_SPEED = 0.1;

  // Manejar input de teclado
  useEffect(() => {
    if (gamePhase !== 'playing') {
      // Reset movement state when not playing (prevents stuck keys from minigames)
      movementState.current = { forward: false, backward: false, left: false, right: false, run: false };
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          movementState.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          movementState.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          movementState.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          movementState.current.right = true;
          break;
        case 'shift':
          movementState.current.run = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          movementState.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          movementState.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          movementState.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          movementState.current.right = false;
          break;
        case 'shift':
          movementState.current.run = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase]);

  // Actualizar posición del jugador
  const updatePosition = useCallback(() => {
    if (gamePhase !== 'playing') return;

    const speed = movementState.current.run ? RUN_SPEED : WALK_SPEED;
    let newX = position.x;
    let newZ = position.z;

    if (movementState.current.forward) newZ -= speed;
    if (movementState.current.backward) newZ += speed;
    if (movementState.current.left) newX -= speed;
    if (movementState.current.right) newX += speed;

    // Límites del apartamento (basado en room_level1 walls)
    const BOUNDS = { minX: -9.5, maxX: 9.5, minZ: -6, maxZ: 6 };
    newX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, newX));
    newZ = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, newZ));

    if (newX !== position.x || newZ !== position.z) {
      setPosition({ x: newX, y: position.y, z: newZ });
    }
  }, [gamePhase, position, setPosition]);

  // Loop de actualización
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const interval = setInterval(updatePosition, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [gamePhase, updatePosition]);

  // Mover a posición específica
  const moveTo = useCallback(
    (newPosition: { x: number; y: number; z: number }) => {
      setPosition(newPosition);
    },
    [setPosition]
  );

  // Verificar si está en movimiento
  const isMoving = useCallback(() => {
    return (
      movementState.current.forward ||
      movementState.current.backward ||
      movementState.current.left ||
      movementState.current.right
    );
  }, []);

  // Obtener animación actual
  const getCurrentAnimation = useCallback(() => {
    if (!isMoving()) return 'Idle_Neutral';
    if (movementState.current.run) return 'Run';
    return 'Walk';
  }, [isMoving]);

  return {
    position,
    playerRef,
    moveTo,
    isMoving: isMoving(),
    isRunning: movementState.current.run,
    currentAnimation: getCurrentAnimation(),
  };
};
