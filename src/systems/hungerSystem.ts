/**
 * 🎮 LEGENDS: Hunger System
 * Sistema de hambre del jugador
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export class HungerSystem {
  static readonly MAX_HUNGER = 100;
  static readonly MIN_HUNGER = 0;
  static readonly HUNGER_DECAY_PER_TURN = 10;

  /**
   * Reduce el hambre automáticamente por turno
   */
  static applyHungerDecay(): void {
    usePlayerStore.getState().consumeHunger(this.HUNGER_DECAY_PER_TURN);
    
    const currentHunger = usePlayerStore.getState().hunger;
    
    // Advertencias según el nivel de hambre
    if (currentHunger === 0) {
      useUIStore.getState().addNotification(
        'error',
        '🍽️ ¡Hambre crítica! La energía se consume el doble de rápido.'
      );
    } else if (currentHunger <= 20) {
      useUIStore.getState().addNotification(
        'warning',
        '⚠️ Hambre baja. Deberías comer algo pronto.'
      );
    }
    
    console.log(`[Hunger] Decay: -${this.HUNGER_DECAY_PER_TURN} hambre`);
  }

  /**
   * Consume comida para restaurar hambre
   */
  static eat(itemId: string, hungerRestore: number): boolean {
    const hasItem = usePlayerStore.getState().hasItem(itemId);
    
    if (!hasItem) {
      useUIStore.getState().addNotification(
        'error',
        '❌ No tienes este item en tu inventario.'
      );
      return false;
    }
    
    // Consumir el item
    const success = usePlayerStore.getState().removeItem(itemId, 1);
    
    if (success) {
      usePlayerStore.getState().addHunger(hungerRestore);
      useUIStore.getState().addNotification(
        'success',
        `✅ Comiste. +${hungerRestore} hambre`
      );
      console.log(`[Hunger] Ate ${itemId}: +${hungerRestore} hambre`);
    }
    
    return success;
  }

  /**
   * Obtiene el porcentaje de hambre actual
   */
  static getHungerPercentage(): number {
    const currentHunger = usePlayerStore.getState().hunger;
    return (currentHunger / this.MAX_HUNGER) * 100;
  }

  /**
   * Obtiene el estado de hambre
   */
  static getHungerStatus(): 'starving' | 'hungry' | 'satisfied' | 'full' {
    const percentage = this.getHungerPercentage();
    
    if (percentage === 0) return 'starving';
    if (percentage < 30) return 'hungry';
    if (percentage < 80) return 'satisfied';
    return 'full';
  }

  /**
   * Verifica si el hambre afecta la energía
   */
  static isAffectingEnergy(): boolean {
    return usePlayerStore.getState().hunger === 0;
  }

  /**
   * Obtiene el modificador de energía por hambre
   */
  static getEnergyModifier(): number {
    return this.isAffectingEnergy() ? 2 : 1;
  }

  /**
   * Obtiene estadísticas de hambre
   */
  static getHungerStats(): {
    current: number;
    max: number;
    percentage: number;
    status: string;
    affectingEnergy: boolean;
    energyModifier: number;
  } {
    const current = usePlayerStore.getState().hunger;
    const percentage = this.getHungerPercentage();
    const status = this.getHungerStatus();
    const affectingEnergy = this.isAffectingEnergy();
    const energyModifier = this.getEnergyModifier();
    
    return {
      current,
      max: this.MAX_HUNGER,
      percentage,
      status,
      affectingEnergy,
      energyModifier,
    };
  }

  /**
   * Procesa el ciclo de hambre al avanzar el tiempo
   */
  static processTurnCycle(): void {
    this.applyHungerDecay();
  }
}
