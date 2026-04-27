/**
 * 🎮 LEGENDS: Level System
 * Sistema de progresión de niveles
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import {
  LEVELS,
  getLevelById,
  getLevelByDay,
  isLevelComplete,
  getProgressInLevel,
  getLevelUpMessage,
  getAllUnlocks,
} from '../data/levels';

export class LevelSystem {
  /**
   * Verifica si el jugador ha completado el nivel actual
   */
  static checkLevelCompletion(): boolean {
    const { currentLevel } = useGameStore.getState();
    const { monthlyListeners } = usePlayerStore.getState();

    return isLevelComplete(currentLevel, monthlyListeners);
  }

  /**
   * Avanza al siguiente nivel
   */
  static advanceLevel(): boolean {
    const { currentLevel } = useGameStore.getState();
    const nextLevel = currentLevel + 1;

    if (nextLevel > 6) {
      console.log('[Level] Already at max level');
      return false;
    }

    const level = getLevelById(nextLevel);
    if (!level) {
      console.error('[Level] Level not found:', nextLevel);
      return false;
    }

    // Actualizar nivel
    useGameStore.getState().setLevel(nextLevel);

    // Desbloquear features del nuevo nivel
    level.unlocks.forEach((feature) => {
      useGameStore.getState().unlockFeature(feature);
    });

    // Notificación de level up
    const message = getLevelUpMessage(nextLevel);
    useUIStore.getState().addNotification('success', `🎉 ${message}`, 5000);

    // Mostrar pantalla de level up (opcional)
    console.log('[Level] Advanced to level:', nextLevel, level.name);
    console.log('[Level] Unlocked features:', level.unlocks);

    return true;
  }

  /**
   * Obtiene el progreso actual en el nivel
   */
  static getLevelProgress(): {
    currentLevel: number;
    levelName: string;
    currentListeners: number;
    targetListeners: number;
    progressPercentage: number;
    isComplete: boolean;
  } {
    const { currentLevel } = useGameStore.getState();
    const { monthlyListeners } = usePlayerStore.getState();
    const level = getLevelById(currentLevel);

    if (!level) {
      return {
        currentLevel: 1,
        levelName: 'Unknown',
        currentListeners: 0,
        targetListeners: 0,
        progressPercentage: 0,
        isComplete: false,
      };
    }

    const [minListeners, maxListeners] = level.listenerGoal;
    const progressPercentage = getProgressInLevel(currentLevel, monthlyListeners);
    const isComplete = isLevelComplete(currentLevel, monthlyListeners);

    return {
      currentLevel,
      levelName: level.name,
      currentListeners: monthlyListeners,
      targetListeners: maxListeners,
      progressPercentage,
      isComplete,
    };
  }

  /**
   * Obtiene información del nivel actual
   */
  static getCurrentLevelInfo(): {
    id: number;
    name: string;
    days: [number, number];
    listenerGoal: [number, number];
    description: string;
    challenge: string;
    unlocks: string[];
    narrativeMilestone: string;
    rhythmDifficulty: string;
    listenerMultiplier: number;
  } | null {
    const { currentLevel } = useGameStore.getState();
    const level = getLevelById(currentLevel);

    if (!level) return null;

    return {
      id: level.id,
      name: level.name,
      days: level.days,
      listenerGoal: level.listenerGoal,
      description: level.description,
      challenge: level.challenge,
      unlocks: level.unlocks,
      narrativeMilestone: level.narrativeMilestone,
      rhythmDifficulty: level.rhythmDifficulty,
      listenerMultiplier: level.listenerMultiplier,
    };
  }

  /**
   * Obtiene información del siguiente nivel
   */
  static getNextLevelInfo(): typeof LevelSystem.getCurrentLevelInfo {
    const { currentLevel } = useGameStore.getState();
    const nextLevel = getLevelById(currentLevel + 1);

    if (!nextLevel) return null;

    return {
      id: nextLevel.id,
      name: nextLevel.name,
      days: nextLevel.days,
      listenerGoal: nextLevel.listenerGoal,
      description: nextLevel.description,
      challenge: nextLevel.challenge,
      unlocks: nextLevel.unlocks,
      narrativeMilestone: nextLevel.narrativeMilestone,
      rhythmDifficulty: nextLevel.rhythmDifficulty,
      listenerMultiplier: nextLevel.listenerMultiplier,
    };
  }

  /**
   * Verifica si una feature está desbloqueada
   */
  static isFeatureUnlocked(feature: string): boolean {
    return useGameStore.getState().isFeatureUnlocked(feature);
  }

  /**
   * Obtiene todas las features desbloqueadas hasta el nivel actual
   */
  static getUnlockedFeatures(): string[] {
    const { currentLevel } = useGameStore.getState();
    return getAllUnlocks(currentLevel);
  }

  /**
   * Calcula el nivel basado en el día actual
   */
  static calculateLevelByDay(day: number): number {
    const level = getLevelByDay(day);
    return level?.id || 1;
  }

  /**
   * Sincroniza el nivel con el día actual
   */
  static syncLevelWithDay(): void {
    const { currentDay, currentLevel } = useGameStore.getState();
    const expectedLevel = this.calculateLevelByDay(currentDay);

    if (expectedLevel !== currentLevel) {
      console.log('[Level] Syncing level with day:', {
        day: currentDay,
        currentLevel,
        expectedLevel,
      });
      useGameStore.getState().setLevel(expectedLevel);
    }
  }

  /**
   * Obtiene todos los niveles
   */
  static getAllLevels(): typeof LEVELS {
    return LEVELS;
  }

  /**
   * Obtiene estadísticas de progresión
   */
  static getProgressionStats(): {
    currentLevel: number;
    maxLevel: number;
    levelsCompleted: number;
    totalListeners: number;
    listenersToNextLevel: number;
    overallProgress: number;
    unlockedFeatures: string[];
  } {
    const { currentLevel } = useGameStore.getState();
    const { monthlyListeners } = usePlayerStore.getState();
    const level = getLevelById(currentLevel);

    const levelsCompleted = currentLevel - 1;
    const maxLevel = 6;

    let listenersToNextLevel = 0;
    if (level) {
      const [, maxListeners] = level.listenerGoal;
      listenersToNextLevel = Math.max(0, maxListeners - monthlyListeners);
    }

    // Progreso general (basado en oyentes finales: 10,000)
    const overallProgress = Math.min(100, (monthlyListeners / 10000) * 100);

    return {
      currentLevel,
      maxLevel,
      levelsCompleted,
      totalListeners: monthlyListeners,
      listenersToNextLevel,
      overallProgress,
      unlockedFeatures: this.getUnlockedFeatures(),
    };
  }

  /**
   * Verifica y procesa el avance de nivel automático
   */
  static processLevelProgression(): void {
    // Sincronizar nivel con día
    this.syncLevelWithDay();

    // Verificar si completó el nivel actual
    if (this.checkLevelCompletion()) {
      const { currentLevel } = useGameStore.getState();
      const { monthlyListeners } = usePlayerStore.getState();

      console.log('[Level] Level completed!', {
        level: currentLevel,
        listeners: monthlyListeners,
      });

      // Avanzar al siguiente nivel
      this.advanceLevel();
    }
  }

  /**
   * Obtiene el multiplicador de oyentes del nivel actual
   */
  static getCurrentMultiplier(): number {
    const { currentLevel } = useGameStore.getState();
    const level = getLevelById(currentLevel);
    return level?.listenerMultiplier || 1.0;
  }

  /**
   * Obtiene la dificultad del minijuego rítmico del nivel actual
   */
  static getCurrentRhythmDifficulty(): string {
    const { currentLevel } = useGameStore.getState();
    const level = getLevelById(currentLevel);
    return level?.rhythmDifficulty || 'easy';
  }
}
