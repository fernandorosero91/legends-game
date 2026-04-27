/**
 * 🎮 LEGENDS: Level Progress Hook
 * Hook para progresión de niveles
 * Autor: Felipe (Systems Developer)
 */

import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { LevelSystem } from '../systems/levelSystem';
import { ListenerSystem } from '../systems/listenerSystem';

export const useLevelProgress = () => {
  const { currentLevel } = useGameStore();
  const { monthlyListeners } = usePlayerStore();

  // Información del nivel actual
  const currentLevelInfo = LevelSystem.getCurrentLevelInfo();
  const nextLevelInfo = LevelSystem.getNextLevelInfo();

  // Progreso en el nivel
  const levelProgress = LevelSystem.getLevelProgress();

  // Progreso hacia la meta final (10,000 oyentes)
  const progressToGoal = ListenerSystem.getProgressToGoal();

  // Verificar si puede alcanzar la meta
  const canReachGoal = ListenerSystem.canReachGoal();

  // Features desbloqueadas
  const unlockedFeatures = LevelSystem.getUnlockedFeatures();

  // Verificar si una feature está desbloqueada
  const isFeatureUnlocked = useCallback((feature: string) => {
    return LevelSystem.isFeatureUnlocked(feature);
  }, []);

  // Stats de progresión
  const progressionStats = LevelSystem.getProgressionStats();

  // Stats de oyentes
  const listenerStats = ListenerSystem.getListenerStats();

  // Top canciones
  const topSongs = ListenerSystem.getTopSongs(5);

  // Oyentes por calidad
  const listenersByQuality = ListenerSystem.getListenersByQuality();

  return {
    // Nivel actual
    currentLevel,
    currentLevelInfo,
    nextLevelInfo,

    // Progreso
    levelProgress,
    progressToGoal,
    canReachGoal,

    // Features
    unlockedFeatures,
    isFeatureUnlocked,

    // Oyentes
    monthlyListeners,
    topSongs,
    listenersByQuality,

    // Stats
    progressionStats,
    listenerStats,
  };
};
