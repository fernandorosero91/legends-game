/**
 * 🎮 LEGENDS: Rent System
 * Sistema de cobro de renta diario
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { getDialogueById } from '../data/dialogues';

export class RentSystem {
  static readonly RENT_AMOUNT = 1000;
  static readonly MAX_DAYS_WITHOUT_RENT = 3;

  /**
   * Intenta cobrar la renta al jugador
   */
  static collectRent(): {
    success: boolean;
    amount: number;
    consecutiveDaysWithoutRent: number;
    gameOver: boolean;
  } {
    const { money, consecutiveDaysWithoutRent } = usePlayerStore.getState();
    const { currentDay, currentLevel } = useGameStore.getState();

    console.log('[Rent] Attempting to collect rent:', {
      day: currentDay,
      money,
      rentAmount: this.RENT_AMOUNT,
    });

    // Intentar pagar la renta
    const success = usePlayerStore.getState().payRent(this.RENT_AMOUNT);

    if (success) {
      // Pago exitoso
      useUIStore.getState().addNotification(
        'info',
        `💰 Renta pagada: -$${this.RENT_AMOUNT}`
      );

      // Mostrar diálogo del cobrador según el día/nivel
      this.showRentCollectorDialogue(currentDay, currentLevel, true);

      return {
        success: true,
        amount: this.RENT_AMOUNT,
        consecutiveDaysWithoutRent: 0,
        gameOver: false,
      };
    } else {
      // No pudo pagar
      usePlayerStore.getState().missRent();
      const newStreak = consecutiveDaysWithoutRent + 1;

      useUIStore.getState().addNotification(
        'error',
        `❌ No pudiste pagar la renta. Días sin pagar: ${newStreak}/${this.MAX_DAYS_WITHOUT_RENT}`
      );

      // Mostrar diálogo del cobrador (amenazante)
      this.showRentCollectorDialogue(currentDay, currentLevel, false);

      // Verificar game over
      const gameOver = newStreak >= this.MAX_DAYS_WITHOUT_RENT;

      if (gameOver) {
        this.triggerGameOver();
      }

      return {
        success: false,
        amount: this.RENT_AMOUNT,
        consecutiveDaysWithoutRent: newStreak,
        gameOver,
      };
    }
  }

  /**
   * Muestra el diálogo del cobrador de renta
   */
  private static showRentCollectorDialogue(
    day: number,
    level: number,
    paid: boolean
  ): void {
    let dialogueId: string;

    if (!paid) {
      // No pagó - diálogo de crisis
      if (day === 13) {
        dialogueId = 'day13_rent_crisis';
      } else {
        dialogueId = 'rent_generic'; // Diálogo genérico amenazante
      }
    } else {
      // Pagó - diálogo según el día
      if (day === 1) {
        dialogueId = 'day1_rent_arrive';
      } else if (day === 30) {
        dialogueId = 'day30_rent_change';
      } else if (day === 45) {
        dialogueId = 'victory_rent_final';
      } else {
        dialogueId = 'rent_generic';
      }
    }

    const dialogue = getDialogueById(dialogueId);
    if (dialogue) {
      useUIStore.getState().showDialogue(dialogue);
    }
  }

  /**
   * Trigger de game over por no pagar renta
   */
  private static triggerGameOver(): void {
    console.log('[Rent] GAME OVER - 3 days without paying rent');

    // Mostrar diálogo de game over
    const gameOverDialogue = getDialogueById('gameover_rent');
    if (gameOverDialogue) {
      useUIStore.getState().showDialogue(gameOverDialogue);
    }

    // Cambiar a pantalla de game over
    setTimeout(() => {
      useGameStore.getState().setGamePhase('game_over');
      useUIStore.getState().setScreen('game_over');
    }, 3000);
  }

  /**
   * Verifica si es hora de cobrar la renta (atardecer)
   */
  static shouldCollectRent(): boolean {
    const { timeOfDay } = useGameStore.getState();
    return timeOfDay === 'evening';
  }

  /**
   * Procesa el evento de atardecer (cobro automático)
   */
  static processEveningEvent(): void {
    if (this.shouldCollectRent()) {
      console.log('[Rent] Evening - collecting rent');
      this.collectRent();
    }
  }

  /**
   * Obtiene el estado de la renta
   */
  static getRentStatus(): {
    rentAmount: number;
    canPay: boolean;
    consecutiveDaysWithoutRent: number;
    daysUntilGameOver: number;
    isInDanger: boolean;
  } {
    const { money, consecutiveDaysWithoutRent } = usePlayerStore.getState();

    return {
      rentAmount: this.RENT_AMOUNT,
      canPay: money >= this.RENT_AMOUNT,
      consecutiveDaysWithoutRent,
      daysUntilGameOver: this.MAX_DAYS_WITHOUT_RENT - consecutiveDaysWithoutRent,
      isInDanger: consecutiveDaysWithoutRent >= 2,
    };
  }

  /**
   * Calcula cuántos días puede sobrevivir con el dinero actual
   */
  static calculateSurvivalDays(): number {
    const { money, monthlyListeners } = usePlayerStore.getState();
    const dailyIncome = Math.floor(monthlyListeners / 10);
    const netDaily = dailyIncome - this.RENT_AMOUNT;

    if (netDaily >= 0) {
      return Infinity; // Puede sobrevivir indefinidamente
    }

    // Calcular cuántos días puede pagar con el dinero actual
    return Math.floor(money / this.RENT_AMOUNT);
  }

  /**
   * Obtiene advertencias sobre la situación de renta
   */
  static getWarnings(): string[] {
    const warnings: string[] = [];
    const { money, consecutiveDaysWithoutRent } = usePlayerStore.getState();
    const survivalDays = this.calculateSurvivalDays();

    if (consecutiveDaysWithoutRent > 0) {
      warnings.push(
        `⚠️ Llevas ${consecutiveDaysWithoutRent} día(s) sin pagar renta. Game Over en ${
          this.MAX_DAYS_WITHOUT_RENT - consecutiveDaysWithoutRent
        } día(s) más.`
      );
    }

    if (money < this.RENT_AMOUNT) {
      warnings.push('❌ No tienes suficiente dinero para pagar la renta de hoy.');
    } else if (money < this.RENT_AMOUNT * 2) {
      warnings.push('⚠️ Solo tienes dinero para pagar la renta de hoy.');
    }

    if (survivalDays < 3 && survivalDays !== Infinity) {
      warnings.push(
        `⚠️ Solo puedes sobrevivir ${survivalDays} día(s) más con tu dinero actual.`
      );
    }

    return warnings;
  }

  /**
   * Obtiene estadísticas de renta
   */
  static getRentStats(): {
    totalRentPaid: number;
    daysWithoutRent: number;
    averageRentPerDay: number;
    totalDays: number;
    rentPaidPercentage: number;
  } {
    const { rentPaidTotal, consecutiveDaysWithoutRent } = usePlayerStore.getState();
    const { currentDay } = useGameStore.getState();

    const totalDays = currentDay - 1; // Días completados
    const daysPaid = totalDays - consecutiveDaysWithoutRent;

    return {
      totalRentPaid: rentPaidTotal,
      daysWithoutRent: consecutiveDaysWithoutRent,
      averageRentPerDay: totalDays > 0 ? rentPaidTotal / totalDays : 0,
      totalDays,
      rentPaidPercentage: totalDays > 0 ? (daysPaid / totalDays) * 100 : 0,
    };
  }
}
