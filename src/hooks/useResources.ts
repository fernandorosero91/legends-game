/**
 * 🎮 LEGENDS: Resources Hook
 * Hook para gestionar recursos del jugador
 * Autor: Felipe (Systems Developer)
 */

import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { EnergySystem } from '../systems/energySystem';
import { HungerSystem } from '../systems/hungerSystem';
import { EconomySystem } from '../systems/economySystem';

export const useResources = () => {
  const {
    money,
    energy,
    hunger,
    monthlyListeners,
    reputation,
  } = usePlayerStore();

  // Energía
  const consumeEnergy = useCallback((amount: number, activity: string) => {
    return EnergySystem.consume(amount, activity);
  }, []);

  const restoreEnergy = useCallback((amount: number, source: string) => {
    EnergySystem.restore(amount, source);
  }, []);

  const sleep = useCallback(() => {
    EnergySystem.sleep();
  }, []);

  const rest = useCallback(() => {
    EnergySystem.rest();
  }, []);

  // Hambre
  const eat = useCallback((itemId: string, hungerRestore: number) => {
    return HungerSystem.eat(itemId, hungerRestore);
  }, []);

  // Dinero
  const spendMoney = useCallback((amount: number, description: string) => {
    return EconomySystem.purchase(amount, description);
  }, []);

  const earnMoney = useCallback((amount: number, source: string) => {
    EconomySystem.earn(amount, source);
  }, []);

  // Stats
  const energyStats = EnergySystem.getEnergyStats();
  const hungerStats = HungerSystem.getHungerStats();
  const economyStats = EconomySystem.getEconomyStats();

  return {
    // Valores
    money,
    energy,
    hunger,
    monthlyListeners,
    reputation,

    // Acciones de energía
    consumeEnergy,
    restoreEnergy,
    sleep,
    rest,

    // Acciones de hambre
    eat,

    // Acciones de dinero
    spendMoney,
    earnMoney,

    // Stats
    energyStats,
    hungerStats,
    economyStats,
  };
};
