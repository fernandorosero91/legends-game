/**
 * 🎮 LEGENDS: Game Loop Hook
 * Hook principal del loop del juego
 * Autor: Felipe (Systems Developer)
 */

import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { DayCycleSystem } from '../systems/dayCycleSystem';
import { LevelSystem } from '../systems/levelSystem';
import { RentSystem } from '../systems/rentSystem';

export const useGameLoop = () => {
  const { gamePhase, currentDay, timeOfDay } = useGameStore();
  const { consecutiveDaysWithoutRent } = usePlayerStore();

  // Avanzar turno
  const advanceTurn = useCallback(() => {
    if (gamePhase !== 'playing') return;
    DayCycleSystem.advanceTurn();
  }, [gamePhase]);

  // Verificar game over por renta
  useEffect(() => {
    if (consecutiveDaysWithoutRent >= 3) {
      console.log('[GameLoop] Game Over - 3 days without rent');
    }
  }, [consecutiveDaysWithoutRent]);

  // Verificar progresión de nivel
  useEffect(() => {
    if (gamePhase === 'playing') {
      LevelSystem.processLevelProgression();
    }
  }, [currentDay, gamePhase]);

  return {
    advanceTurn,
    currentDay,
    timeOfDay,
    gamePhase,
  };
};
