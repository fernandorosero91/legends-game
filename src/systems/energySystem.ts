/**
 * 🎮 LEGENDS: Energy System
 * Sistema de energía del jugador
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export class EnergySystem {
  static readonly MAX_ENERGY = 100;
  static readonly MIN_ENERGY = 0;
  static readonly SLEEP_RESTORE = 60;
  static readonly REST_RESTORE = 25;
  static readonly RECORDING_COST = 25;

  /**
   * Consume energía del jugador.
   * La penalización por hambre y el desgaste de hambre se manejan en playerStore.consumeEnergy().
   */
  static consume(amount: number, activity: string = 'Actividad'): boolean {
    const success = usePlayerStore.getState().consumeEnergy(amount);
    
    if (success) {
      const { energy, hunger } = usePlayerStore.getState();
      console.log(`[Energy] ${activity}: -${amount} energía (quedan ${energy}, hambre ${hunger})`);
      
      if (hunger === 0) {
        useUIStore.getState().addNotification('error', '🍽️ ¡Hambre crítica! Energía x2. ¡Come algo!');
      }
      if (energy <= 20) {
        useUIStore.getState().addNotification('warning', '⚠️ Energía baja. Descansa o duerme.');
      }
    } else {
      useUIStore.getState().addNotification('error', '❌ No tienes suficiente energía.');
    }
    
    return success;
  }

  /**
   * Restaura energía del jugador
   */
  static restore(amount: number, source: string = 'Descanso'): void {
    usePlayerStore.getState().addEnergy(amount);
    console.log(`[Energy] ${source}: +${amount} energía`);
    
    useUIStore.getState().addNotification(
      'success',
      `✅ ${source}: +${amount} energía`
    );
  }

  /**
   * Dormir (restaura 50 de energía)
   */
  static sleep(): void {
    this.restore(this.SLEEP_RESTORE, 'Dormir');
  }

  /**
   * Descansar (restaura 20 de energía)
   */
  static rest(): void {
    this.restore(this.REST_RESTORE, 'Descansar');
  }

  /**
   * Verifica si el jugador puede realizar una actividad
   */
  static canPerformActivity(energyCost: number): boolean {
    const currentEnergy = usePlayerStore.getState().energy;
    return currentEnergy >= energyCost;
  }

  /**
   * Obtiene el porcentaje de energía actual
   */
  static getEnergyPercentage(): number {
    const currentEnergy = usePlayerStore.getState().energy;
    return (currentEnergy / this.MAX_ENERGY) * 100;
  }

  /**
   * Obtiene el estado de energía
   */
  static getEnergyStatus(): 'critical' | 'low' | 'medium' | 'high' | 'full' {
    const percentage = this.getEnergyPercentage();
    
    if (percentage === 100) return 'full';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    if (percentage >= 20) return 'low';
    return 'critical';
  }

  /**
   * Aplica modificador de hambre a la energía
   * Si el hambre es 0, la energía se consume el doble de rápido
   */
  static applyHungerModifier(baseCost: number): number {
    const hunger = usePlayerStore.getState().hunger;
    return hunger === 0 ? baseCost * 2 : baseCost;
  }

  /**
   * Obtiene estadísticas de energía
   */
  static getEnergyStats(): {
    current: number;
    max: number;
    percentage: number;
    status: string;
    canWork: boolean;
    canRecord: boolean;
  } {
    const current = usePlayerStore.getState().energy;
    const percentage = this.getEnergyPercentage();
    const status = this.getEnergyStatus();
    
    return {
      current,
      max: this.MAX_ENERGY,
      percentage,
      status,
      canWork: current >= 15,
      canRecord: current >= this.RECORDING_COST,
    };
  }
}
