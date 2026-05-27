/**
 * 🎮 LEGENDS: useNarrativeEngine
 * Hook que conecta el sistema de diálogos narrativos con el game loop.
 * Escucha cambios en el estado del juego y dispara eventos/diálogos automáticamente.
 *
 * Se monta en GameScene y reacciona a:
 * - Cambios de turno (timeOfDay)
 * - Cambios de día (currentDay)
 * - Cambios de nivel (currentLevel)
 * - Hitos de oyentes (monthlyListeners)
 * - Calidad de canciones (songs)
 * - Estado de renta (consecutiveDaysWithoutRent)
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { ALL_NARRATIVE_EVENTS } from '../data/events';
import { ALL_DIALOGUES } from '../data/dialogues';
import type { NarrativeEvent, TriggerCondition, Dialogue } from '../types/dialogue';

// Milestones de oyentes que disparan eventos
const LISTENER_MILESTONES = [500, 1000, 3000, 5000, 7000, 10000];

/**
 * Evalúa si una condición de trigger se cumple dado el estado actual
 */
function checkCondition(
  condition: TriggerCondition,
  state: {
    currentDay: number;
    currentLevel: number;
    timeOfDay: string;
    monthlyListeners: number;
    songs: any[];
    consecutiveDaysWithoutRent: number;
  }
): boolean {
  switch (condition) {
    case 'first_recording':
      return state.songs.length === 1;

    case 'evening_auto':
      return state.timeOfDay === 'evening';

    case 'listeners_gte_500':
      return state.monthlyListeners >= 500;

    case 'listeners_gte_1000':
      return state.monthlyListeners >= 1000;

    case 'listeners_gte_5000':
      return state.monthlyListeners >= 5000;

    case 'listeners_gte_10000':
      return state.monthlyListeners >= 10000;

    case 'level_2_start':
      return state.currentLevel === 2 && state.currentDay === 6;

    case 'level_3_complete':
      return state.currentLevel >= 3;

    case 'level_4_day_28':
      return state.currentLevel === 4 && state.currentDay === 28;

    case 'avg_quality_lt_40_x3': {
      const lastThree = state.songs.slice(-3);
      if (lastThree.length < 3) return false;
      const avg = lastThree.reduce((sum: number, s: any) => sum + (s.rhythmScore || 0), 0) / 3;
      return avg < 40;
    }

    case 'avg_quality_gte_70': {
      if (state.songs.length === 0) return false;
      const avg = state.songs.reduce((sum: number, s: any) => sum + (s.rhythmScore || 0), 0) / state.songs.length;
      return avg >= 70;
    }

    case 'cant_pay_rent':
      return state.consecutiveDaysWithoutRent > 0;

    case 'day_specific':
      return true;

    case 'interact_npc':
      return false; // Manual only

    default:
      return false;
  }
}

/**
 * Ejecuta un evento narrativo: muestra diálogo, desbloquea feature, o notifica
 */
function executeEvent(event: NarrativeEvent): void {
  switch (event.type) {
    case 'dialogue': {
      const dialogue = ALL_DIALOGUES.find((d) => d.id === event.payload);
      if (!dialogue) {
        console.warn('[Narrative] Dialogue not found:', event.payload);
        return;
      }

      const { dialogueActive } = useUIStore.getState();

      // Si ya hay un diálogo activo, encolar
      if (dialogueActive) {
        useUIStore.getState().queueDialogue(dialogue);
      } else {
        useUIStore.getState().showDialogue(dialogue);
      }

      // Encolar diálogos encadenados (nextDialogueId)
      let nextId = dialogue.nextDialogueId;
      while (nextId) {
        const next = ALL_DIALOGUES.find((d) => d.id === nextId);
        if (!next) break;
        useUIStore.getState().queueDialogue(next);
        nextId = next.nextDialogueId;
      }

      // Aplicar efectos del diálogo
      if (dialogue.effects) {
        for (const effect of dialogue.effects) {
          applyEffect(effect);
        }
      }
      break;
    }

    case 'unlock':
      useGameStore.getState().unlockFeature(event.payload);
      useUIStore.getState().addNotification('success', `🔓 Desbloqueado: ${event.payload}`);
      break;

    case 'notification':
      useUIStore.getState().addNotification('info', event.payload);
      break;

    case 'scene_change':
      // Future: could trigger scene transitions
      break;
  }

  // Marcar como ejecutado
  if (event.once) {
    usePlayerStore.getState().setDialogueFlag(event.id, true);
  }
}

/**
 * Aplica un efecto de diálogo al estado del jugador
 */
function applyEffect(effect: { type: string; value: number | string | boolean; target?: string }): void {
  const player = usePlayerStore.getState();

  switch (effect.type) {
    case 'reputation':
      if (typeof effect.value === 'number') player.addReputation(effect.value);
      break;
    case 'money':
      if (typeof effect.value === 'number') {
        if (effect.value > 0) player.addMoney(effect.value);
        else player.spendMoney(Math.abs(effect.value));
      }
      break;
    case 'energy':
      if (typeof effect.value === 'number') player.addEnergy(effect.value);
      break;
    case 'flag':
      if (effect.target && typeof effect.value === 'boolean') {
        player.setDialogueFlag(effect.target, effect.value);
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
 * Filtra y ejecuta eventos que cumplen sus condiciones
 */
function processEvents(
  events: NarrativeEvent[],
  state: {
    currentDay: number;
    currentLevel: number;
    timeOfDay: string;
    monthlyListeners: number;
    songs: any[];
    consecutiveDaysWithoutRent: number;
    dialogueFlags: Record<string, boolean>;
  }
): void {
  const eligible = events.filter((event) => {
    // Ya ejecutado (si es once)
    if (event.once && state.dialogueFlags[event.id]) return false;

    // Verificar día (si está definido)
    if (event.day !== undefined && event.day !== state.currentDay) return false;

    // Verificar nivel (si está definido)
    if (event.level !== undefined && event.level !== state.currentLevel) return false;

    // Verificar condición
    return checkCondition(event.triggerCondition, state);
  });

  // Ordenar por prioridad (mayor primero)
  eligible.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Ejecutar (máximo 3 por ciclo para no saturar al jugador)
  const toExecute = eligible.slice(0, 3);
  for (const event of toExecute) {
    console.log('[Narrative] Triggering event:', event.id, '→', event.type, event.payload);
    executeEvent(event);
  }
}

/**
 * Hook principal del motor narrativo.
 * Se monta en GameScene y reacciona a cambios de estado.
 */
export function useNarrativeEngine() {
  // Refs para detectar cambios
  const prevDay = useRef<number>(0);
  const prevTimeOfDay = useRef<string>('');
  const prevLevel = useRef<number>(0);
  const prevListeners = useRef<number>(0);
  const prevSongsCount = useRef<number>(0);
  const initialized = useRef(false);

  // Suscribirse a cambios relevantes del game store
  const currentDay = useGameStore((s) => s.currentDay);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const gamePhase = useGameStore((s) => s.gamePhase);

  // Suscribirse a cambios del player store
  const monthlyListeners = usePlayerStore((s) => s.monthlyListeners);
  const songs = usePlayerStore((s) => s.songs);
  const consecutiveDaysWithoutRent = usePlayerStore((s) => s.consecutiveDaysWithoutRent);
  const dialogueFlags = usePlayerStore((s) => s.dialogueFlags);

  useEffect(() => {
    // Solo procesar cuando el juego está activo
    if (gamePhase !== 'playing') return;

    // No procesar en el primer render (evitar spam al cargar partida)
    if (!initialized.current) {
      prevDay.current = currentDay;
      prevTimeOfDay.current = timeOfDay;
      prevLevel.current = currentLevel;
      prevListeners.current = monthlyListeners;
      prevSongsCount.current = songs.length;
      initialized.current = true;
      return;
    }

    // Detectar qué cambió
    const dayChanged = currentDay !== prevDay.current;
    const timeChanged = timeOfDay !== prevTimeOfDay.current;
    const levelChanged = currentLevel !== prevLevel.current;
    const listenersChanged = monthlyListeners !== prevListeners.current;
    const songsChanged = songs.length !== prevSongsCount.current;

    // Si nada cambió, no procesar
    if (!dayChanged && !timeChanged && !levelChanged && !listenersChanged && !songsChanged) {
      return;
    }

    // No disparar diálogos si ya hay uno activo (esperar a que termine)
    const { dialogueActive } = useUIStore.getState();

    // Construir estado actual para evaluación
    const state = {
      currentDay,
      currentLevel,
      timeOfDay,
      monthlyListeners,
      songs,
      consecutiveDaysWithoutRent,
      dialogueFlags,
    };

    // Pequeño delay para no interrumpir transiciones
    const timer = setTimeout(() => {
      // Filtrar eventos relevantes según lo que cambió
      let relevantEvents = ALL_NARRATIVE_EVENTS;

      // Si cambió el turno al atardecer, priorizar eventos de renta
      if (timeChanged && timeOfDay === 'evening') {
        const eveningEvents = relevantEvents.filter(
          (e) => e.triggerCondition === 'evening_auto' || e.triggerCondition === 'cant_pay_rent'
        );
        processEvents(eveningEvents, state);
        return;
      }

      // Si ganó oyentes, verificar milestones
      if (listenersChanged && monthlyListeners > prevListeners.current) {
        const crossedMilestone = LISTENER_MILESTONES.some(
          (m) => monthlyListeners >= m && prevListeners.current < m
        );
        if (crossedMilestone) {
          const listenerEvents = relevantEvents.filter((e) =>
            e.triggerCondition.startsWith('listeners_gte_')
          );
          processEvents(listenerEvents, state);
        }
      }

      // Si grabó una canción nueva, verificar calidad y primera grabación
      if (songsChanged && songs.length > prevSongsCount.current) {
        const songEvents = relevantEvents.filter(
          (e) =>
            e.triggerCondition === 'first_recording' ||
            e.triggerCondition === 'avg_quality_lt_40_x3' ||
            e.triggerCondition === 'avg_quality_gte_70'
        );
        processEvents(songEvents, state);
      }

      // Si cambió el nivel, verificar desbloqueos
      if (levelChanged) {
        const levelEvents = relevantEvents.filter(
          (e) =>
            e.triggerCondition === 'level_2_start' ||
            e.triggerCondition === 'level_3_complete' ||
            e.triggerCondition === 'level_4_day_28'
        );
        processEvents(levelEvents, state);
      }

      // Si cambió el día (nuevo día), verificar eventos del día
      if (dayChanged) {
        const dayEvents = relevantEvents.filter(
          (e) => e.triggerCondition === 'day_specific' && e.day === currentDay
        );
        processEvents(dayEvents, state);
      }

      // Actualizar refs
      prevDay.current = currentDay;
      prevTimeOfDay.current = timeOfDay;
      prevLevel.current = currentLevel;
      prevListeners.current = monthlyListeners;
      prevSongsCount.current = songs.length;
    }, 500); // 500ms delay para no interrumpir animaciones

    return () => clearTimeout(timer);
  }, [currentDay, currentLevel, timeOfDay, gamePhase, monthlyListeners, songs, consecutiveDaysWithoutRent, dialogueFlags]);
}
