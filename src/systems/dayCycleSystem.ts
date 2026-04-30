/**
 * 🎮 LEGENDS: Day Cycle System
 * Sistema de ciclo día/noche y avance de turnos
 * Autor: Felipe (Systems Developer)
 */

import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { HungerSystem } from './hungerSystem';
import { EconomySystem } from './economySystem';
import { RentSystem } from './rentSystem';
import { LevelSystem } from './levelSystem';
import type { TimeOfDay } from '../store/gameStore';

export class DayCycleSystem {
  /**
   * Avanza al siguiente turno del día
   */
  static advanceTurn(): void {
    const { timeOfDay, currentDay } = useGameStore.getState();

    console.log('[DayCycle] Advancing turn:', { day: currentDay, time: timeOfDay });

    // Aplicar efectos del turno actual antes de avanzar
    this.processTurnEffects();

    // Avanzar el tiempo
    useGameStore.getState().advanceTime();

    // Obtener el nuevo turno
    const newTimeOfDay = useGameStore.getState().timeOfDay;
    const newDay = useGameStore.getState().currentDay;

    // Si cambió el día, procesar efectos de nuevo día
    if (newDay !== currentDay) {
      this.processNewDay();
    }

    // Procesar efectos específicos del turno
    this.processTimeOfDayEffects(newTimeOfDay);

    console.log('[DayCycle] Turn advanced:', { day: newDay, time: newTimeOfDay });
  }

  /**
   * Procesa efectos del turno actual
   */
  private static processTurnEffects(): void {
    // Reducir hambre automáticamente
    HungerSystem.processTurnCycle();
  }

  /**
   * Procesa efectos de un nuevo día
   */
  private static processNewDay(): void {
    const { currentDay } = useGameStore.getState();

    console.log('[DayCycle] New day started:', currentDay);

    // Aplicar ingresos pasivos
    const passiveIncome = EconomySystem.applyPassiveIncome();
    if (passiveIncome > 0) {
      useUIStore.getState().addNotification(
        'info',
        `💰 Ingresos pasivos: +$${passiveIncome}`
      );
    }

    // Verificar progresión de nivel
    LevelSystem.processLevelProgression();

    // Notificación de nuevo día
    useUIStore.getState().addNotification('info', `🌅 Día ${currentDay}`, 3000);
  }

  /**
   * Procesa efectos específicos del turno del día
   */
  private static processTimeOfDayEffects(timeOfDay: TimeOfDay): void {
    switch (timeOfDay) {
      case 'morning':
        // Mañana - nuevo día
        useUIStore.getState().addNotification('info', '☀️ Buenos días', 2000);
        break;

      case 'afternoon':
        // Tarde
        useUIStore.getState().addNotification('info', '🌤️ Buenas tardes', 2000);
        break;

      case 'evening':
        // Atardecer - cobro de renta
        useUIStore.getState().addNotification('info', '🌆 Atardecer', 2000);
        RentSystem.processEveningEvent();
        break;

      case 'night':
        // Noche
        useUIStore.getState().addNotification('info', '🌙 Buenas noches', 2000);
        break;
    }
  }

  /**
   * Obtiene el turno actual
   */
  static getCurrentTimeOfDay(): TimeOfDay {
    return useGameStore.getState().timeOfDay;
  }

  /**
   * Obtiene el día actual
   */
  static getCurrentDay(): number {
    return useGameStore.getState().currentDay;
  }

  /**
   * Obtiene información del ciclo actual
   */
  static getCycleInfo(): {
    day: number;
    timeOfDay: TimeOfDay;
    turnNumber: number;
    daysRemaining: number;
    turnsRemainingToday: number;
  } {
    const { currentDay, timeOfDay } = useGameStore.getState();

    const turnMap: Record<TimeOfDay, number> = {
      morning: 1,
      afternoon: 2,
      evening: 3,
      night: 4,
    };

    const turnNumber = turnMap[timeOfDay];
    const turnsRemainingToday = 4 - turnNumber;
    const daysRemaining = 45 - currentDay;

    return {
      day: currentDay,
      timeOfDay,
      turnNumber,
      daysRemaining,
      turnsRemainingToday,
    };
  }

  /**
   * Verifica si es de día (morning o afternoon)
   */
  static isDaytime(): boolean {
    const timeOfDay = this.getCurrentTimeOfDay();
    return timeOfDay === 'morning' || timeOfDay === 'afternoon';
  }

  /**
   * Verifica si es de noche (evening o night)
   */
  static isNighttime(): boolean {
    return !this.isDaytime();
  }

  /**
   * Obtiene el nombre legible del turno
   */
  static getTimeOfDayName(timeOfDay?: TimeOfDay): string {
    const time = timeOfDay || this.getCurrentTimeOfDay();
    const names: Record<TimeOfDay, string> = {
      morning: 'Mañana',
      afternoon: 'Tarde',
      evening: 'Atardecer',
      night: 'Noche',
    };
    return names[time];
  }

  /**
   * Obtiene el emoji del turno
   */
  static getTimeOfDayEmoji(timeOfDay?: TimeOfDay): string {
    const time = timeOfDay || this.getCurrentTimeOfDay();
    const emojis: Record<TimeOfDay, string> = {
      morning: '☀️',
      afternoon: '🌤️',
      evening: '🌆',
      night: '🌙',
    };
    return emojis[time];
  }

  /**
   * Calcula el progreso del día (0-100%)
   */
  static getDayProgress(): number {
    const { timeOfDay } = useGameStore.getState();
    const progressMap: Record<TimeOfDay, number> = {
      morning: 25,
      afternoon: 50,
      evening: 75,
      night: 100,
    };
    return progressMap[timeOfDay];
  }

  /**
   * Obtiene estadísticas del ciclo
   */
  static getCycleStats(): {
    currentDay: number;
    totalDays: number;
    daysRemaining: number;
    progressPercentage: number;
    currentTurn: string;
    turnsToday: number;
    totalTurnsPlayed: number;
  } {
    const { currentDay, totalDaysPlayed } = useGameStore.getState();
    const { turnNumber } = this.getCycleInfo();

    return {
      currentDay,
      totalDays: 45,
      daysRemaining: 45 - currentDay,
      progressPercentage: (currentDay / 45) * 100,
      currentTurn: this.getTimeOfDayName(),
      turnsToday: turnNumber,
      totalTurnsPlayed: totalDaysPlayed * 4 + turnNumber,
    };
  }

  /**
   * Fuerza el avance a un turno específico (para testing)
   */
  static forceTimeOfDay(timeOfDay: TimeOfDay): void {
    const { currentDay } = useGameStore.getState();
    useGameStore.setState({ timeOfDay });
    console.log('[DayCycle] Forced time to:', timeOfDay);
  }

  /**
   * Fuerza el avance a un día específico (para testing)
   */
  static forceDay(day: number): void {
    if (day < 1 || day > 45) {
      console.error('[DayCycle] Invalid day:', day);
      return;
    }
    useGameStore.setState({ currentDay: day });
    LevelSystem.syncLevelWithDay();
    console.log('[DayCycle] Forced day to:', day);
  }
}
