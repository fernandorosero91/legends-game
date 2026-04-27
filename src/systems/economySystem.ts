/**
 * 🎮 LEGENDS: Economy System
 * Sistema de economía (dinero, ingresos pasivos, gastos)
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';

export class EconomySystem {
  /**
   * Calcula ingresos pasivos diarios basados en oyentes
   * Fórmula: 5 oyentes = $1 de ingreso pasivo por día
   */
  static calculatePassiveIncome(listeners: number): number {
    return Math.floor(listeners / 5);
  }

  /**
   * Aplica ingresos pasivos al jugador
   */
  static applyPassiveIncome(): number {
    const listeners = usePlayerStore.getState().monthlyListeners;
    const income = this.calculatePassiveIncome(listeners);
    
    if (income > 0) {
      usePlayerStore.getState().addMoney(income);
    }
    
    return income;
  }

  /**
   * Verifica si el jugador puede pagar una cantidad
   */
  static canAfford(amount: number): boolean {
    const money = usePlayerStore.getState().money;
    return money >= amount;
  }

  /**
   * Procesa una compra
   */
  static purchase(amount: number, description: string = 'Compra'): boolean {
    const success = usePlayerStore.getState().spendMoney(amount);
    
    if (success) {
      console.log(`[Economy] ${description}: -$${amount}`);
    } else {
      console.warn(`[Economy] No hay suficiente dinero para: ${description}`);
    }
    
    return success;
  }

  /**
   * Procesa un ingreso
   */
  static earn(amount: number, source: string = 'Ingreso'): void {
    usePlayerStore.getState().addMoney(amount);
    console.log(`[Economy] ${source}: +$${amount}`);
  }

  /**
   * Calcula el balance económico del jugador
   */
  static getBalance(): {
    money: number;
    totalEarned: number;
    totalSpent: number;
    netBalance: number;
  } {
    const { money, totalMoneyEarned, totalMoneySpent } = usePlayerStore.getState();
    
    return {
      money,
      totalEarned: totalMoneyEarned,
      totalSpent: totalMoneySpent,
      netBalance: totalMoneyEarned - totalMoneySpent,
    };
  }

  /**
   * Proyecta ingresos futuros basados en oyentes actuales
   */
  static projectIncome(days: number): number {
    const listeners = usePlayerStore.getState().monthlyListeners;
    const dailyIncome = this.calculatePassiveIncome(listeners);
    return dailyIncome * days;
  }

  /**
   * Calcula el costo total de la renta hasta el final del juego
   */
  static calculateRemainingRentCost(rentPerDay: number = 600): number {
    const currentDay = useGameStore.getState().currentDay;
    const remainingDays = 45 - currentDay;
    return rentPerDay * remainingDays;
  }

  /**
   * Verifica si el jugador puede sobrevivir económicamente
   */
  static canSurvive(daysToCheck: number = 7, rentPerDay: number = 600): boolean {
    const { money } = usePlayerStore.getState();
    const projectedIncome = this.projectIncome(daysToCheck);
    const projectedRent = rentPerDay * daysToCheck;
    
    return money + projectedIncome >= projectedRent;
  }

  /**
   * Obtiene estadísticas económicas
   */
  static getEconomyStats(): {
    currentMoney: number;
    dailyPassiveIncome: number;
    totalEarned: number;
    totalSpent: number;
    rentPaid: number;
    averageDailySpending: number;
    projectedWeeklyIncome: number;
  } {
    const {
      money,
      totalMoneyEarned,
      totalMoneySpent,
      rentPaidTotal,
      monthlyListeners,
    } = usePlayerStore.getState();
    
    const { totalDaysPlayed } = useGameStore.getState();
    const dailyPassiveIncome = this.calculatePassiveIncome(monthlyListeners);
    
    return {
      currentMoney: money,
      dailyPassiveIncome,
      totalEarned: totalMoneyEarned,
      totalSpent: totalMoneySpent,
      rentPaid: rentPaidTotal,
      averageDailySpending: totalDaysPlayed > 0 ? totalMoneySpent / totalDaysPlayed : 0,
      projectedWeeklyIncome: dailyPassiveIncome * 7,
    };
  }
}
