/**
 * 🎮 LEGENDS: Dialogue System
 * Sistema de diálogos y eventos narrativos
 * Autor: Felipe (Systems Developer)
 */

import { useUIStore } from '../store/uiStore';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { ALL_DIALOGUES, ACT1_DIALOGUES, ACT2_DIALOGUES, ACT3_DIALOGUES, SPECIAL_DIALOGUES } from '../data/dialogues';
import { ALL_NARRATIVE_EVENTS } from '../data/events';
import type { Dialogue, TriggerCondition, NarrativeEvent } from '../types/dialogue';

/** All dialogues grouped by act for stats */
const DIALOGUES_BY_ACT = {
  act1: ACT1_DIALOGUES,
  act2: ACT2_DIALOGUES,
  act3: ACT3_DIALOGUES,
  special: SPECIAL_DIALOGUES,
};

export class DialogueSystem {
  /**
   * Muestra un diálogo
   */
  static showDialogue(dialogueId: string): boolean {
    const dialogue = this.getDialogueById(dialogueId);
    if (!dialogue) {
      console.error('[Dialogue] Dialogue not found:', dialogueId);
      return false;
    }

    // Verificar si ya fue visto (si es once)
    const { dialogueFlags } = usePlayerStore.getState();
    if (dialogueFlags[dialogueId]) {
      console.log('[Dialogue] Already seen:', dialogueId);
      return false;
    }

    // Mostrar diálogo
    useUIStore.getState().showDialogue(dialogue);

    // Marcar como visto
    usePlayerStore.getState().setDialogueFlag(dialogueId, true);

    return true;
  }

  /**
   * Encola un diálogo
   */
  static queueDialogue(dialogueId: string): void {
    const dialogue = this.getDialogueById(dialogueId);
    if (!dialogue) {
      console.error('[Dialogue] Dialogue not found:', dialogueId);
      return;
    }

    useUIStore.getState().queueDialogue(dialogue);
  }

  /**
   * Obtiene un diálogo por ID
   */
  static getDialogueById(dialogueId: string): Dialogue | null {
    return ALL_DIALOGUES.find((d) => d.id === dialogueId) || null;
  }

  /**
   * Procesa triggers de diálogos según condiciones
   */
  static processTriggers(): void {
    const { currentDay, currentLevel } = useGameStore.getState();
    const { monthlyListeners, dialogueFlags } = usePlayerStore.getState();

    // Obtener eventos del día actual
    const todayEvents = ALL_NARRATIVE_EVENTS.filter((event) => {
      // Verificar si ya fue ejecutado
      if (event.once && dialogueFlags[event.id]) return false;

      // Verificar día
      if (event.day && event.day !== currentDay) return false;

      // Verificar nivel
      if (event.level && event.level !== currentLevel) return false;

      // Verificar condición
      return this.checkTriggerCondition(event.triggerCondition);
    });

    // Ordenar por prioridad
    todayEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Ejecutar eventos
    for (const event of todayEvents) {
      this.executeEvent(event);
    }
  }

  /**
   * Verifica si una condición de trigger se cumple
   */
  static checkTriggerCondition(condition: TriggerCondition): boolean {
    const { monthlyListeners, songs, consecutiveDaysWithoutRent } =
      usePlayerStore.getState();
    const { currentDay, currentLevel } = useGameStore.getState();

    switch (condition) {
      case 'first_recording':
        return songs.length === 1;

      case 'evening_auto':
        return useGameStore.getState().timeOfDay === 'evening';

      case 'listeners_gte_500':
        return monthlyListeners >= 500;

      case 'listeners_gte_1000':
        return monthlyListeners >= 1000;

      case 'listeners_gte_5000':
        return monthlyListeners >= 5000;

      case 'listeners_gte_10000':
        return monthlyListeners >= 10000;

      case 'level_2_start':
        return currentLevel === 2 && currentDay === 6;

      case 'level_3_complete':
        return currentLevel === 4 && currentDay === 21;

      case 'level_4_day_28':
        return currentLevel === 4 && currentDay === 28;

      case 'avg_quality_lt_40_x3': {
        const lastThree = songs.slice(-3);
        if (lastThree.length < 3) return false;
        const avgQuality =
          lastThree.reduce((sum, s) => sum + (s.rhythmScore || 0), 0) / 3;
        return avgQuality < 40;
      }

      case 'avg_quality_gte_70': {
        if (songs.length === 0) return false;
        const avgQuality =
          songs.reduce((sum, s) => sum + (s.rhythmScore || 0), 0) / songs.length;
        return avgQuality >= 70;
      }

      case 'cant_pay_rent':
        return consecutiveDaysWithoutRent > 0;

      case 'day_specific':
        return true; // Se verifica en el filtro de eventos

      case 'interact_npc':
        return false; // Se activa manualmente

      default:
        return false;
    }
  }

  /**
   * Ejecuta un evento narrativo
   */
  static executeEvent(event: NarrativeEvent): void {
    console.log('[Dialogue] Executing event:', event.id);

    switch (event.type) {
      case 'dialogue':
        this.showDialogue(event.payload);
        break;

      case 'unlock':
        useGameStore.getState().unlockFeature(event.payload);
        useUIStore
          .getState()
          .addNotification('success', `🔓 Desbloqueado: ${event.payload}`);
        break;

      case 'notification':
        useUIStore.getState().addNotification('info', event.payload);
        break;

      case 'scene_change':
        // TODO: Implementar cambio de escena
        console.log('[Dialogue] Scene change:', event.payload);
        break;
    }

    // Marcar evento como ejecutado
    if (event.once) {
      usePlayerStore.getState().setDialogueFlag(event.id, true);
    }
  }

  /**
   * Procesa el siguiente diálogo en la cola
   */
  static nextDialogue(): void {
    useUIStore.getState().nextDialogue();
  }

  /**
   * Cierra el diálogo actual
   */
  static closeDialogue(): void {
    useUIStore.getState().closeDialogue();
  }

  /**
   * Procesa la selección de una opción de diálogo
   */
  static selectOption(optionId: string): void {
    const { currentDialogue } = useUIStore.getState();
    if (!currentDialogue || !currentDialogue.options) return;

    const option = currentDialogue.options.find((o) => o.id === optionId);
    if (!option) return;

    // Aplicar efectos de la opción
    if (option.effects) {
      for (const effect of option.effects) {
        this.applyDialogueEffect(effect);
      }
    }

    // Si hay siguiente diálogo, mostrarlo
    if (option.nextDialogueId) {
      this.showDialogue(option.nextDialogueId);
    } else {
      this.closeDialogue();
    }
  }

  /**
   * Aplica un efecto de diálogo
   */
  static applyDialogueEffect(effect: {
    type: string;
    value: number | string | boolean;
    target?: string;
  }): void {
    const playerStore = usePlayerStore.getState();

    switch (effect.type) {
      case 'reputation':
        if (typeof effect.value === 'number') {
          playerStore.addReputation(effect.value);
        }
        break;

      case 'money':
        if (typeof effect.value === 'number') {
          if (effect.value > 0) {
            playerStore.addMoney(effect.value);
          } else {
            playerStore.spendMoney(Math.abs(effect.value));
          }
        }
        break;

      case 'energy':
        if (typeof effect.value === 'number') {
          playerStore.addEnergy(effect.value);
        }
        break;

      case 'flag':
        if (effect.target && typeof effect.value === 'boolean') {
          playerStore.setDialogueFlag(effect.target, effect.value);
        }
        break;

      case 'unlock':
        if (typeof effect.value === 'string') {
          useGameStore.getState().unlockFeature(effect.value);
        }
        break;
    }
  }

  /**
   * Obtiene estadísticas de diálogos
   */
  static getDialogueStats() {
    const { dialogueFlags } = usePlayerStore.getState();
    const totalDialogues = Object.values(DIALOGUES_BY_ACT).reduce(
      (sum, act) => sum + act.length,
      0
    );
    const seenDialogues = Object.values(dialogueFlags).filter(Boolean).length;

    return {
      totalDialogues,
      seenDialogues,
      percentage: (seenDialogues / totalDialogues) * 100,
      flags: dialogueFlags,
    };
  }
}
