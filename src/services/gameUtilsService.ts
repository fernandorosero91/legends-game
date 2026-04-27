/**
 * 🎮 LEGENDS: Game Utils Service
 * Servicio de utilidades y helpers para el juego
 * Autor: Felipe (Systems Developer)
 */

import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export class GameUtilsService {
  /**
   * Inicializa una nueva partida
   */
  static startNewGame(): void {
    console.log('[GameUtils] Starting new game...');
    
    // Resetear todos los stores
    useGameStore.getState().resetGame();
    usePlayerStore.getState().resetPlayer();
    useUIStore.getState().clearNotifications();
    
    // Configurar estado inicial
    useGameStore.getState().setGamePhase('playing');
    useUIStore.getState().setScreen('game');
    
    // Mostrar mensaje de bienvenida
    useUIStore.getState().addNotification(
      'success',
      '🎵 ¡Bienvenido a Purple City! Tu carrera musical comienza ahora.'
    );
    
    console.log('[GameUtils] New game started successfully');
  }

  /**
   * Termina el juego con victoria
   */
  static triggerVictory(): void {
    console.log('[GameUtils] Victory triggered!');
    
    const { currentDay, currentLevel } = useGameStore.getState();
    const { monthlyListeners, songs, money, reputation } = usePlayerStore.getState();
    
    // Cambiar a pantalla de victoria
    useGameStore.getState().setGamePhase('victory');
    useUIStore.getState().setScreen('victory');
    
    // Mostrar notificación de victoria
    useUIStore.getState().addNotification(
      'success',
      '🏆 ¡VICTORIA! Alcanzaste 10,000 oyentes mensuales. ¡Eres una leyenda!'
    );
    
    // Log de estadísticas finales
    console.log('[GameUtils] Victory stats:', {
      day: currentDay,
      level: currentLevel,
      listeners: monthlyListeners,
      songs: songs.length,
      money,
      reputation,
    });
  }

  /**
   * Termina el juego con derrota
   */
  static triggerGameOver(reason: string): void {
    console.log('[GameUtils] Game Over triggered:', reason);
    
    // Cambiar a pantalla de game over
    useGameStore.getState().setGamePhase('game_over');
    useUIStore.getState().setScreen('game_over');
    
    // Mostrar notificación de derrota
    useUIStore.getState().addNotification(
      'error',
      `💀 Game Over: ${reason}`
    );
  }

  /**
   * Pausa el juego
   */
  static pauseGame(): void {
    const gameStore = useGameStore.getState();
    
    if (gameStore.gamePhase === 'playing') {
      gameStore.setGamePhase('paused');
      console.log('[GameUtils] Game paused');
    }
  }

  /**
   * Reanuda el juego
   */
  static resumeGame(): void {
    const gameStore = useGameStore.getState();
    
    if (gameStore.gamePhase === 'paused') {
      gameStore.setGamePhase('playing');
      console.log('[GameUtils] Game resumed');
    }
  }

  /**
   * Verifica el estado del juego y ejecuta acciones automáticas
   */
  static checkGameState(): void {
    const { currentDay, currentLevel } = useGameStore.getState();
    const { monthlyListeners, consecutiveDaysWithoutRent } = usePlayerStore.getState();
    
    // Verificar victoria (Nivel 6 + 10,000 oyentes)
    if (currentLevel >= 6 && monthlyListeners >= 10000) {
      this.triggerVictory();
      return;
    }
    
    // Verificar game over por renta
    if (consecutiveDaysWithoutRent >= 3) {
      this.triggerGameOver('No pagaste la renta 3 días consecutivos');
      return;
    }
    
    // Verificar game over por tiempo (día 45 sin victoria)
    if (currentDay > 45 && monthlyListeners < 10000) {
      this.triggerGameOver('Se acabó el tiempo. No alcanzaste 10,000 oyentes en 45 días');
      return;
    }
  }

  /**
   * Obtiene un resumen completo del estado del juego
   */
  static getGameSummary() {
    const gameState = useGameStore.getState();
    const playerState = usePlayerStore.getState();
    
    return {
      // Estado del juego
      day: gameState.currentDay,
      level: gameState.currentLevel,
      timeOfDay: gameState.timeOfDay,
      phase: gameState.gamePhase,
      
      // Estado del jugador
      money: playerState.money,
      energy: playerState.energy,
      hunger: playerState.hunger,
      listeners: playerState.monthlyListeners,
      reputation: playerState.reputation,
      
      // Progreso
      songsRecorded: playerState.songs.length,
      inventoryItems: playerState.inventory.length,
      jobsCompleted: playerState.jobHistory.length,
      
      // Riesgo
      consecutiveMissedRents: playerState.consecutiveDaysWithoutRent,
      isAtRisk: playerState.consecutiveDaysWithoutRent > 0,
      
      // Metas
      listenersToVictory: Math.max(0, 10000 - playerState.monthlyListeners),
      daysRemaining: Math.max(0, 45 - gameState.currentDay),
    };
  }

  /**
   * Calcula estadísticas de rendimiento
   */
  static getPerformanceStats() {
    const { songs, jobHistory, statistics } = usePlayerStore.getState();
    const { currentDay } = useGameStore.getState();
    
    // Calidad promedio de canciones
    const avgQuality = songs.length > 0 
      ? songs.reduce((sum, song) => sum + (song.rhythmScore || 0), 0) / songs.length
      : 0;
    
    // Ingresos por trabajos
    const totalJobEarnings = jobHistory.reduce((sum, job) => sum + job.moneyEarned, 0);
    
    // Canciones por día
    const songsPerDay = songs.length / Math.max(1, currentDay);
    
    // Trabajos por día
    const jobsPerDay = jobHistory.length / Math.max(1, currentDay);
    
    return {
      avgSongQuality: Math.round(avgQuality),
      totalJobEarnings,
      songsPerDay: Math.round(songsPerDay * 100) / 100,
      jobsPerDay: Math.round(jobsPerDay * 100) / 100,
      perfectSongs: statistics.perfectSongs,
      collaborations: statistics.collaborationsCompleted,
      rentsPaid: statistics.rentPaidTotal / 1000, // Convertir a número de rentas
    };
  }

  /**
   * Obtiene recomendaciones para el jugador
   */
  static getRecommendations(): string[] {
    const { money, energy, hunger, monthlyListeners } = usePlayerStore.getState();
    const { currentDay, currentLevel } = useGameStore.getState();
    const recommendations: string[] = [];
    
    // Recomendaciones de recursos
    if (energy < 30) {
      recommendations.push('⚡ Tu energía está baja. Considera descansar o dormir.');
    }
    
    if (hunger < 30) {
      recommendations.push('🍕 Tu hambre está alta. Compra comida en la tienda.');
    }
    
    if (money < 2000) {
      recommendations.push('💰 Tu dinero está bajo. Considera hacer trabajos.');
    }
    
    // Recomendaciones de progreso
    const daysRemaining = 45 - currentDay;
    const listenersNeeded = 10000 - monthlyListeners;
    const listenersPerDay = listenersNeeded / Math.max(1, daysRemaining);
    
    if (listenersPerDay > 200) {
      recommendations.push(`🎵 Necesitas ${Math.ceil(listenersPerDay)} oyentes por día. ¡Graba más canciones!`);
    }
    
    // Recomendaciones de equipamiento
    if (currentLevel >= 3 && money > 1000) {
      recommendations.push('🎤 Considera comprar equipamiento musical para mejorar la calidad.');
    }
    
    // Recomendaciones de nivel
    if (currentLevel >= 3 && monthlyListeners < 1000) {
      recommendations.push('📈 Tu reputación afecta los oyentes. Graba canciones de alta calidad.');
    }
    
    return recommendations;
  }

  /**
   * Formatea números para mostrar en UI
   */
  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Formatea dinero para mostrar en UI
   */
  static formatMoney(amount: number): string {
    return '$' + this.formatNumber(amount);
  }

  /**
   * Formatea tiempo para mostrar en UI
   */
  static formatTime(timeOfDay: string): string {
    const timeEmojis = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙',
    };
    
    const timeNames = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Atardecer',
      night: 'Noche',
    };
    
    return `${timeEmojis[timeOfDay as keyof typeof timeEmojis]} ${timeNames[timeOfDay as keyof typeof timeNames]}`;
  }

  /**
   * Obtiene el color apropiado para un valor de recurso
   */
  static getResourceColor(value: number, max: number = 100): string {
    const percentage = (value / max) * 100;
    
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    if (percentage >= 20) return 'text-orange-500';
    return 'text-red-500';
  }

  /**
   * Verifica si el jugador puede realizar una acción
   */
  static canPerformAction(action: 'record' | 'work' | 'shop' | 'sleep'): {
    canDo: boolean;
    reason?: string;
  } {
    const { energy, money } = usePlayerStore.getState();
    const { timeOfDay, gamePhase } = useGameStore.getState();
    
    if (gamePhase !== 'playing') {
      return { canDo: false, reason: 'El juego no está en modo de juego' };
    }
    
    switch (action) {
      case 'record':
        if (energy < 30) {
          return { canDo: false, reason: 'Necesitas al menos 30 de energía para grabar' };
        }
        break;
        
      case 'work':
        if (energy < 10) {
          return { canDo: false, reason: 'Necesitas al menos 10 de energía para trabajar' };
        }
        break;
        
      case 'shop':
        if (money < 50) {
          return { canDo: false, reason: 'Necesitas al menos $50 para comprar algo' };
        }
        break;
        
      case 'sleep':
        if (timeOfDay !== 'night') {
          return { canDo: false, reason: 'Solo puedes dormir por la noche' };
        }
        break;
    }
    
    return { canDo: true };
  }
}