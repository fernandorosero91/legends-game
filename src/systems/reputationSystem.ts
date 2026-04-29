/**
 * 🎮 LEGENDS: Reputation System
 * Sistema de reputación del jugador
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import type { SongQuality } from '../types/game';

export class ReputationSystem {
  static readonly MAX_REPUTATION = 100;
  static readonly MIN_REPUTATION = 0;
  static readonly INITIAL_REPUTATION = 50;

  /**
   * Calcula el cambio de reputación por una canción
   */
  static calculateReputationChange(quality: SongQuality): number {
    const changes: Record<SongQuality, number> = {
      masterpiece: 15,
      high: 8,
      medium: 3,
      low: -5,
    };

    return changes[quality];
  }

  /**
   * Aplica cambio de reputación por una canción
   */
  static applyReputationFromSong(quality: SongQuality): void {
    const change = this.calculateReputationChange(quality);
    
    if (change > 0) {
      usePlayerStore.getState().addReputation(change);
      useUIStore.getState().addNotification(
        'success',
        `⭐ +${change} reputación`
      );
    } else if (change < 0) {
      usePlayerStore.getState().addReputation(change);
      useUIStore.getState().addNotification(
        'warning',
        `⚠️ ${change} reputación`
      );
    }

    console.log('[Reputation] Changed by:', change, 'from song quality:', quality);
  }

  /**
   * Aplica penalización por no pagar renta
   */
  static applyRentPenalty(): void {
    const penalty = -10;
    usePlayerStore.getState().addReputation(penalty);
    
    useUIStore.getState().addNotification(
      'error',
      `❌ ${penalty} reputación (no pagaste renta)`
    );

    console.log('[Reputation] Rent penalty applied:', penalty);
  }

  /**
   * Aplica bonus por colaboración
   */
  static applyCollaborationBonus(): void {
    const bonus = 10;
    usePlayerStore.getState().addReputation(bonus);
    
    useUIStore.getState().addNotification(
      'success',
      `✅ +${bonus} reputación (colaboración)`
    );

    console.log('[Reputation] Collaboration bonus applied:', bonus);
  }

  /**
   * Calcula el bonus de reputación por items equipados
   */
  static calculateItemBonus(): number {
    const { inventory } = usePlayerStore.getState();
    
    const reputationItems = [
      'motivational_poster',
      'studio_decor',
      'urban_tshirt',
      'brand_sneakers',
      'gold_chain',
      'complete_outfit',
      'premium_sunglasses',
    ];

    const bonuses: Record<string, number> = {
      motivational_poster: 2,
      studio_decor: 3,
      urban_tshirt: 2,
      brand_sneakers: 3,
      gold_chain: 5,
      complete_outfit: 8,
      premium_sunglasses: 4,
    };

    let totalBonus = 0;
    inventory.forEach((item) => {
      if (reputationItems.includes(item.itemId) && item.equipped) {
        totalBonus += bonuses[item.itemId] || 0;
      }
    });

    return totalBonus;
  }

  /**
   * Obtiene la reputación efectiva (base + bonus de items)
   */
  static getEffectiveReputation(): number {
    const baseReputation = usePlayerStore.getState().reputation;
    const itemBonus = this.calculateItemBonus();
    
    return Math.min(this.MAX_REPUTATION, baseReputation + itemBonus);
  }

  /**
   * Obtiene el nivel de reputación
   */
  static getReputationLevel(): 'terrible' | 'bad' | 'average' | 'good' | 'excellent' | 'legendary' {
    const reputation = this.getEffectiveReputation();

    if (reputation >= 90) return 'legendary';
    if (reputation >= 70) return 'excellent';
    if (reputation >= 50) return 'good';
    if (reputation >= 30) return 'average';
    if (reputation >= 10) return 'bad';
    return 'terrible';
  }

  /**
   * Obtiene el nombre del nivel de reputación
   */
  static getReputationLevelName(): string {
    const level = this.getReputationLevel();
    const names = {
      legendary: 'Legendario',
      excellent: 'Excelente',
      good: 'Bueno',
      average: 'Promedio',
      bad: 'Malo',
      terrible: 'Terrible',
    };
    return names[level];
  }

  /**
   * Calcula el multiplicador de oyentes por reputación
   */
  static getListenerMultiplier(): number {
    const reputation = this.getEffectiveReputation();
    return 1 + reputation / 100;
  }

  /**
   * Verifica si la reputación afecta a un personaje
   */
  static affectsCharacter(characterId: string): boolean {
    const reputation = this.getEffectiveReputation();

    switch (characterId) {
      case 'the_critic':
        // El Crítico aparece si la reputación es baja
        return reputation < 40;
      
      case 'rent_collector':
        // El de la Renta cambia de tono si la reputación es alta
        return reputation >= 70;
      
      case 'luna':
        // Luna aparece más seguido si la reputación es alta
        return reputation >= 60;
      
      default:
        return false;
    }
  }

  /**
   * Obtiene el estado de reputación con El Crítico
   */
  static getCriticStatus(): {
    isActive: boolean;
    phase: 'destructive' | 'challenging' | 'respectful';
    message: string;
  } {
    const { songs } = usePlayerStore.getState();
    
    if (songs.length < 3) {
      return {
        isActive: false,
        phase: 'destructive',
        message: 'El Crítico aún no ha aparecido.',
      };
    }

    // Calcular calidad promedio de las últimas 3 canciones
    const lastThree = songs.slice(-3);
    const qualityMap: Record<SongQuality, number> = {
      low: 25,
      medium: 60,
      high: 80,
      masterpiece: 95,
    };

    const avgQuality = lastThree.reduce((sum, song) => sum + qualityMap[song.quality], 0) / 3;

    let phase: 'destructive' | 'challenging' | 'respectful';
    let message: string;

    if (avgQuality < 40) {
      phase = 'destructive';
      message = 'El Crítico está siendo muy duro contigo.';
    } else if (avgQuality < 70) {
      phase = 'challenging';
      message = 'El Crítico te está desafiando a mejorar.';
    } else {
      phase = 'respectful';
      message = 'El Crítico reconoce tu talento.';
    }

    return {
      isActive: avgQuality < 70,
      phase,
      message,
    };
  }

  /**
   * Obtiene estadísticas de reputación
   */
  static getReputationStats(): {
    current: number;
    effective: number;
    level: string;
    itemBonus: number;
    listenerMultiplier: number;
    criticStatus: ReturnType<typeof ReputationSystem.getCriticStatus>;
    affectedCharacters: string[];
  } {
    const current = usePlayerStore.getState().reputation;
    const effective = this.getEffectiveReputation();
    const level = this.getReputationLevelName();
    const itemBonus = this.calculateItemBonus();
    const listenerMultiplier = this.getListenerMultiplier();
    const criticStatus = this.getCriticStatus();

    const characters = ['the_critic', 'rent_collector', 'luna'];
    const affectedCharacters = characters.filter((char) => this.affectsCharacter(char));

    return {
      current,
      effective,
      level,
      itemBonus,
      listenerMultiplier,
      criticStatus,
      affectedCharacters,
    };
  }

  /**
   * Obtiene el progreso de reputación
   */
  static getReputationProgress(): {
    current: number;
    max: number;
    percentage: number;
    nextLevel: string | null;
    pointsToNextLevel: number;
  } {
    const current = this.getEffectiveReputation();
    const max = this.MAX_REPUTATION;
    const percentage = (current / max) * 100;

    const thresholds = [
      { level: 'legendary', min: 90 },
      { level: 'excellent', min: 70 },
      { level: 'good', min: 50 },
      { level: 'average', min: 30 },
      { level: 'bad', min: 10 },
    ];

    let nextLevel: string | null = null;
    let pointsToNextLevel = 0;

    for (const threshold of thresholds) {
      if (current < threshold.min) {
        nextLevel = threshold.level;
        pointsToNextLevel = threshold.min - current;
        break;
      }
    }

    return {
      current,
      max,
      percentage,
      nextLevel,
      pointsToNextLevel,
    };
  }
}
