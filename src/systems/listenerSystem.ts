/**
 * 🎮 LEGENDS: Listener System
 * Sistema de cálculo y gestión de oyentes
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { LevelSystem } from './levelSystem';
import type { SongQuality } from '../types/game';

export class ListenerSystem {
  /**
   * Calcula oyentes generados por una canción
   */
  static calculateListeners(
    baseListeners: number,
    quality: SongQuality,
    reputation: number,
    level: number
  ): number {
    // Multiplicador de nivel
    const levelMultiplier = LevelSystem.getCurrentMultiplier();

    // Multiplicador de reputación (1 + reputación/100)
    const reputationMultiplier = 1 + reputation / 100;

    // Calcular oyentes finales
    const listeners = Math.floor(baseListeners * levelMultiplier * reputationMultiplier);

    console.log('[Listeners] Calculated:', {
      baseListeners,
      quality,
      levelMultiplier,
      reputationMultiplier,
      finalListeners: listeners,
    });

    return listeners;
  }

  /**
   * Agrega oyentes al jugador
   */
  static addListeners(amount: number, source: string = 'Canción'): void {
    usePlayerStore.getState().addListeners(amount);

    useUIStore.getState().addNotification(
      'success',
      `🎧 ${source}: +${amount} oyentes`
    );

    console.log('[Listeners] Added:', amount, 'from', source);

    // Verificar hitos de oyentes
    this.checkListenerMilestones();
  }

  /**
   * Verifica hitos de oyentes y dispara eventos
   */
  private static checkListenerMilestones(): void {
    const { monthlyListeners } = usePlayerStore.getState();
    const { currentLevel } = useGameStore.getState();

    // Hitos importantes
    const milestones = [
      { listeners: 500, level: 1, message: '🎉 ¡500 oyentes! Luna te dejó un comentario.' },
      { listeners: 1000, level: 2, message: '🎉 ¡1,000 oyentes! Estás creciendo.' },
      { listeners: 3000, level: 3, message: '🎉 ¡3,000 oyentes! Momentum creciente.' },
      { listeners: 5000, level: 4, message: '🎉 ¡5,000 oyentes! Eres una promesa.' },
      { listeners: 7000, level: 5, message: '🎉 ¡7,000 oyentes! Casi lo logras.' },
      { listeners: 10000, level: 6, message: '🎉 ¡10,000 oyentes! ¡VICTORIA!' },
    ];

    milestones.forEach((milestone) => {
      // Verificar si acabamos de alcanzar este hito
      const previousListeners = monthlyListeners - 100; // Aproximación
      if (previousListeners < milestone.listeners && monthlyListeners >= milestone.listeners) {
        useUIStore.getState().addNotification('success', milestone.message, 5000);

        // Si alcanzó 10,000 oyentes, victoria
        if (milestone.listeners === 10000) {
          this.triggerVictory();
        }
      }
    });
  }

  /**
   * Trigger de victoria (10,000 oyentes)
   */
  private static triggerVictory(): void {
    console.log('[Listeners] VICTORY - 10,000 listeners reached!');

    // Cambiar a fase de victoria
    useGameStore.getState().setGamePhase('victory');

    // Mostrar pantalla de victoria
    setTimeout(() => {
      useUIStore.getState().setScreen('victory');
    }, 2000);
  }

  /**
   * Obtiene el progreso hacia la meta final (10,000 oyentes)
   */
  static getProgressToGoal(): {
    current: number;
    goal: number;
    percentage: number;
    remaining: number;
  } {
    const { monthlyListeners } = usePlayerStore.getState();
    const goal = 10000;

    return {
      current: monthlyListeners,
      goal,
      percentage: Math.min(100, (monthlyListeners / goal) * 100),
      remaining: Math.max(0, goal - monthlyListeners),
    };
  }

  /**
   * Calcula el crecimiento de oyentes
   */
  static calculateGrowthRate(): {
    totalListeners: number;
    averagePerSong: number;
    averagePerDay: number;
    growthRate: number;
  } {
    const { monthlyListeners, songs } = usePlayerStore.getState();
    const { currentDay } = useGameStore.getState();

    const totalSongs = songs.length;
    const daysPlayed = currentDay - 1;

    return {
      totalListeners: monthlyListeners,
      averagePerSong: totalSongs > 0 ? Math.floor(monthlyListeners / totalSongs) : 0,
      averagePerDay: daysPlayed > 0 ? Math.floor(monthlyListeners / daysPlayed) : 0,
      growthRate:
        daysPlayed > 1
          ? ((monthlyListeners / daysPlayed - monthlyListeners / (daysPlayed - 1)) /
              (monthlyListeners / (daysPlayed - 1))) *
            100
          : 0,
    };
  }

  /**
   * Proyecta oyentes futuros basado en el ritmo actual
   */
  static projectFutureListeners(daysAhead: number): number {
    const { averagePerDay } = this.calculateGrowthRate();
    const { monthlyListeners } = usePlayerStore.getState();

    return monthlyListeners + averagePerDay * daysAhead;
  }

  /**
   * Verifica si puede alcanzar la meta a tiempo
   */
  static canReachGoal(): {
    canReach: boolean;
    daysRemaining: number;
    listenersNeeded: number;
    averageNeededPerDay: number;
    currentAveragePerDay: number;
  } {
    const { currentDay } = useGameStore.getState();
    const { monthlyListeners } = usePlayerStore.getState();
    const { averagePerDay } = this.calculateGrowthRate();

    const daysRemaining = 45 - currentDay;
    const listenersNeeded = 10000 - monthlyListeners;
    const averageNeededPerDay = daysRemaining > 0 ? listenersNeeded / daysRemaining : Infinity;

    return {
      canReach: averagePerDay >= averageNeededPerDay,
      daysRemaining,
      listenersNeeded,
      averageNeededPerDay,
      currentAveragePerDay: averagePerDay,
    };
  }

  /**
   * Obtiene estadísticas de oyentes por calidad de canciones
   */
  static getListenersByQuality(): {
    masterpiece: number;
    high: number;
    medium: number;
    low: number;
  } {
    const { songs } = usePlayerStore.getState();

    return {
      masterpiece: songs
        .filter((s) => s.quality === 'masterpiece')
        .reduce((sum, s) => sum + s.listenersGenerated, 0),
      high: songs
        .filter((s) => s.quality === 'high')
        .reduce((sum, s) => sum + s.listenersGenerated, 0),
      medium: songs
        .filter((s) => s.quality === 'medium')
        .reduce((sum, s) => sum + s.listenersGenerated, 0),
      low: songs
        .filter((s) => s.quality === 'low')
        .reduce((sum, s) => sum + s.listenersGenerated, 0),
    };
  }

  /**
   * Obtiene las mejores canciones por oyentes
   */
  static getTopSongs(limit: number = 5): Array<{
    title: string;
    quality: SongQuality;
    listeners: number;
    day: number;
  }> {
    const { songs } = usePlayerStore.getState();

    return songs
      .sort((a, b) => b.listenersGenerated - a.listenersGenerated)
      .slice(0, limit)
      .map((song) => ({
        title: song.title,
        quality: song.quality,
        listeners: song.listenersGenerated,
        day: song.dayRecorded,
      }));
  }

  /**
   * Obtiene estadísticas completas de oyentes
   */
  static getListenerStats(): {
    total: number;
    progressToGoal: number;
    averagePerSong: number;
    averagePerDay: number;
    topSongs: ReturnType<typeof ListenerSystem.getTopSongs>;
    byQuality: ReturnType<typeof ListenerSystem.getListenersByQuality>;
    canReachGoal: boolean;
  } {
    const { monthlyListeners } = usePlayerStore.getState();
    const { percentage } = this.getProgressToGoal();
    const { averagePerSong, averagePerDay } = this.calculateGrowthRate();
    const { canReach } = this.canReachGoal();

    return {
      total: monthlyListeners,
      progressToGoal: percentage,
      averagePerSong,
      averagePerDay,
      topSongs: this.getTopSongs(),
      byQuality: this.getListenersByQuality(),
      canReachGoal: canReach,
    };
  }
}
