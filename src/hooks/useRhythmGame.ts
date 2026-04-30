/**
 * 🎮 LEGENDS: Rhythm Game Hook
 * Hook para el minijuego rítmico
 * Autor: Felipe (Systems Developer)
 */

import { useState, useCallback, useEffect } from 'react';
import { RhythmSystem } from '../systems/rhythmSystem';
import { useGameStore } from '../store/gameStore';
import type { Note, RhythmGameState } from '../systems/rhythmSystem';

export const useRhythmGame = () => {
  const [gameState, setGameState] = useState<RhythmGameState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Iniciar grabación
  const startRecording = useCallback((beatId: string) => {
    const state = RhythmSystem.startRecording(beatId);
    setGameState(state);
    setCurrentTime(0);
  }, []);

  // Procesar input
  const processInput = useCallback((lane: number) => {
    if (!gameState) return null;
    
    const result = RhythmSystem.processInput(lane, currentTime);
    setGameState(RhythmSystem.getGameState());
    return result;
  }, [gameState, currentTime]);

  // Actualizar tiempo
  const updateTime = useCallback((time: number) => {
    setCurrentTime(time);
    RhythmSystem.updateTime(time);
    setGameState(RhythmSystem.getGameState());
  }, []);

  // Finalizar grabación
  const finishRecording = useCallback(() => {
    const result = RhythmSystem.finishRecording();
    setGameState(null);
    setCurrentTime(0);
    useGameStore.getState().setGamePhase('playing');
    return result;
  }, []);

  // Cancelar grabación
  const cancelRecording = useCallback(() => {
    RhythmSystem.cancelRecording();
    setGameState(null);
    setCurrentTime(0);
  }, []);

  // Obtener notas visibles
  const getVisibleNotes = useCallback((): Note[] => {
    if (!gameState) return [];
    
    const windowStart = currentTime - 1000;
    const windowEnd = currentTime + 2000;
    
    return gameState.notes.filter(
      note => note.time >= windowStart && note.time <= windowEnd
    );
  }, [gameState, currentTime]);

  // Stats
  const stats = RhythmSystem.getStats();

  return {
    gameState,
    currentTime,
    startRecording,
    processInput,
    updateTime,
    finishRecording,
    cancelRecording,
    getVisibleNotes,
    stats,
  };
};
