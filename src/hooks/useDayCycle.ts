/**
 * 🌅 Hook de Ciclo Día/Noche
 * 
 * Hook personalizado para gestionar el ciclo de día/noche del juego.
 * Proporciona funciones para avanzar turnos, obtener información del turno actual,
 * y manejar el auto-avance de días.
 */

import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { 
  advanceTurn, 
  forceSleep, 
  shouldForceSleep,
  getTurnName,
  getTurnEmoji,
  getTurnsRemainingInDay,
  canPerformAction,
  type TurnResult
} from '../systems/dayCycleSystem';
import { processRent } from '../systems/rentSystem';
import { applyPassiveIncome } from '../systems/economySystem';
import { applyDailyMomentum } from '../systems/listenerSystem';

export interface UseDayCycleReturn {
  // Estado actual
  currentDay: number;
  currentLevel: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  turnName: string;
  turnEmoji: string;
  turnsRemaining: number;
  
  // Acciones
  nextTurn: () => TurnResult;
  sleep: () => TurnResult;
  canDoAction: (turnsCost: number) => boolean;
  
  // Información
  isEvening: boolean;
  isNight: boolean;
  shouldSleep: boolean;
}

/**
 * Hook para gestionar el ciclo día/noche
 */
export const useDayCycle = (): UseDayCycleReturn => {
  const currentDay = useGameStore(state => state.currentDay);
  const currentLevel = useGameStore(state => state.currentLevel);
  const timeOfDay = useGameStore(state => state.timeOfDay);
  
  // Información del turno actual
  const turnName = getTurnName(timeOfDay);
  const turnEmoji = getTurnEmoji(timeOfDay);
  const turnsRemaining = getTurnsRemainingInDay();
  
  // Estados derivados
  const isEvening = timeOfDay === 'evening';
  const isNight = timeOfDay === 'night';
  const shouldSleep = shouldForceSleep();
  
  /**
   * Avanza al siguiente turno
   */
  const nextTurn = useCallback((): TurnResult => {
    console.log('[useDayCycle] Avanzando turno...');
    
    const result = advanceTurn();
    
    // Si es atardecer, procesar renta
    if (result.newTurn === 'evening') {
      console.log('[useDayCycle] Es atardecer - procesando renta...');
      const rentResult = processRent();
      
      if (rentResult.shouldTriggerGameOver) {
        result.events.push('GAME OVER: 3 rentas perdidas consecutivas');
      } else if (!rentResult.paid) {
        result.warnings.push(rentResult.message);
      }
    }
    
    // Si avanzó el día, aplicar efectos diarios
    if (result.dayAdvanced) {
      console.log('[useDayCycle] Nuevo día - aplicando efectos diarios...');
      
      // Aplicar ingresos pasivos
      const passiveIncome = applyPassiveIncome();
      if (passiveIncome.totalIncome > 0) {
        result.events.push(`Ingresos pasivos: +$${passiveIncome.totalIncome}`);
      }
      
      // Aplicar momentum de canciones
      const momentum = applyDailyMomentum();
      if (momentum > 0) {
        result.events.push(`Momentum de canciones: +${momentum} oyentes`);
      }
    }
    
    console.log('[useDayCycle] ✅ Turno avanzado:', result);
    return result;
    
  }, []);
  
  /**
   * Fuerza dormir (avanza al siguiente día)
   */
  const sleep = useCallback((): TurnResult => {
    console.log('[useDayCycle] 😴 Durmiendo...');
    
    const result = forceSleep();
    
    // Aplicar efectos del nuevo día
    const passiveIncome = applyPassiveIncome();
    if (passiveIncome.totalIncome > 0) {
      result.events.push(`Ingresos pasivos: +$${passiveIncome.totalIncome}`);
    }
    
    const momentum = applyDailyMomentum();
    if (momentum > 0) {
      result.events.push(`Momentum de canciones: +${momentum} oyentes`);
    }
    
    console.log('[useDayCycle] ✅ Despertaste en el día', result);
    return result;
    
  }, []);
  
  /**
   * Verifica si puede realizar una acción que consume turnos
   */
  const canDoAction = useCallback((turnsCost: number): boolean => {
    return canPerformAction(turnsCost);
  }, []);
  
  // Auto-avance de turno en la noche (opcional)
  useEffect(() => {
    if (shouldSleep) {
      console.log('[useDayCycle] ⚠️ Es de noche - deberías dormir');
    }
  }, [shouldSleep]);
  
  return {
    // Estado
    currentDay,
    currentLevel,
    timeOfDay,
    turnName,
    turnEmoji,
    turnsRemaining,
    
    // Acciones
    nextTurn,
    sleep,
    canDoAction,
    
    // Información
    isEvening,
    isNight,
    shouldSleep
  };
};

/**
 * Hook para auto-avanzar el turno después de un tiempo
 */
export const useAutoAdvanceTurn = (enabled: boolean = false, delayMs: number = 60000) => {
  const { nextTurn, isNight } = useDayCycle();
  
  useEffect(() => {
    if (!enabled || isNight) return;
    
    console.log('[useAutoAdvanceTurn] Configurando auto-avance en', delayMs, 'ms');
    
    const timer = setTimeout(() => {
      console.log('[useAutoAdvanceTurn] ⏰ Auto-avanzando turno...');
      nextTurn();
    }, delayMs);
    
    return () => clearTimeout(timer);
  }, [enabled, delayMs, nextTurn, isNight]);
};

/**
 * Hook para obtener el progreso del día (0-100%)
 */
export const useDayProgress = (): number => {
  const timeOfDay = useGameStore(state => state.timeOfDay);
  
  const progress: Record<typeof timeOfDay, number> = {
    morning: 25,
    afternoon: 50,
    evening: 75,
    night: 100
  };
  
  return progress[timeOfDay];
};

export default useDayCycle;
