/**
 * 🎮 LEGENDS: Rhythm Game — Sistema de Grabación con Múltiples Minijuegos
 * 3 modos de juego distintos según el estilo del beat:
 * - Rhythm Drop (Guitar Hero style) — Trap/Drill
 * - Beat Catcher (Osu! style) — Lo-fi/Boom Bap
 * - Flow Mixer (Arrow sequence) — Hip-hop
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { getAvailableBeats, type Beat } from '../../data/songs';
import { BeatSelector } from './BeatSelector';
import { RhythmDrop } from './RhythmDrop';
import { BeatCatcher } from './BeatCatcher';
import { FlowMixer } from './FlowMixer';
import { RecordingResults } from './RecordingResults';
import { InstructionsModal } from './InstructionsModal';
import { RhythmSystem } from '../../systems/rhythmSystem';

type RhythmPhase = 'select_beat' | 'instructions' | 'playing' | 'results';
export type MiniGameType = 'rhythm_drop' | 'beat_catcher' | 'flow_mixer';

// Mapeo de estilo de beat a minijuego
const STYLE_TO_GAME: Record<string, MiniGameType> = {
  trap: 'rhythm_drop',
  drill: 'rhythm_drop',
  lofi: 'beat_catcher',
  boom_bap: 'beat_catcher',
  hiphop: 'flow_mixer',
};

export function RhythmGame() {
  const [phase, setPhase] = useState<RhythmPhase>('select_beat');
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [gameType, setGameType] = useState<MiniGameType>('rhythm_drop');
  const [results, setResults] = useState<any>(null);

  const { currentLevel } = useGameStore();
  const { consumeEnergy, inventory } = usePlayerStore();
  const { addNotification } = useUIStore();

  // Obtener beats disponibles
  const hasSoftware = inventory.some(
    (item) => item.itemId === 'production_software' && item.equipped
  );
  const availableBeats = getAvailableBeats(currentLevel, hasSoftware);

  // Seleccionar beat y determinar minijuego
  const handleSelectBeat = useCallback((beat: Beat, selectedGameType?: MiniGameType) => {
    setSelectedBeat(beat);
    const type = selectedGameType || STYLE_TO_GAME[beat.style] || 'rhythm_drop';
    setGameType(type);
    setPhase('instructions');
  }, []);

  // Iniciar juego después de instrucciones
  const handleStartGame = useCallback(() => {
    if (!selectedBeat) return;
    consumeEnergy(30);
    RhythmSystem.startRecording(selectedBeat.id);
    setPhase('playing');
  }, [selectedBeat, consumeEnergy]);

  // Cuando el minijuego termina, recibe el score
  const handleGameComplete = useCallback((score: number, maxCombo: number, stats: {
    perfectHits: number;
    goodHits: number;
    okHits: number;
    misses: number;
  }) => {
    // Inyectar stats en el RhythmSystem antes de finalizar
    const gameState = RhythmSystem.getGameState();
    if (gameState) {
      gameState.perfectHits = stats.perfectHits;
      gameState.goodHits = stats.goodHits;
      gameState.okHits = stats.okHits;
      gameState.misses = stats.misses;
      gameState.maxCombo = maxCombo;
      gameState.score = score;
    }

    const result = RhythmSystem.finishRecording();
    setResults({
      ...result,
      maxCombo,
      perfectHits: stats.perfectHits,
      goodHits: stats.goodHits,
      okHits: stats.okHits,
      misses: stats.misses,
    });
    setPhase('results');
  }, []);

  // Cancelar
  const handleCancel = useCallback(() => {
    RhythmSystem.cancelRecording();
    useGameStore.getState().setGamePhase('playing');
  }, []);

  // Cerrar resultados
  const handleCloseResults = useCallback(() => {
    useGameStore.getState().setGamePhase('playing');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] via-[#120025] to-[#0a0015]" />

      {/* Partículas de fondo decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-500/30"
            animate={{
              y: [0, -window.innerHeight],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'select_beat' && (
          <BeatSelector
            key="selector"
            beats={availableBeats}
            onSelect={handleSelectBeat}
            onCancel={handleCancel}
            currentLevel={currentLevel}
          />
        )}

        {phase === 'instructions' && selectedBeat && (
          <InstructionsModal
            key="instructions"
            gameType={gameType}
            beatName={selectedBeat.name}
            onStart={handleStartGame}
            onBack={() => setPhase('select_beat')}
          />
        )}

        {phase === 'playing' && selectedBeat && gameType === 'rhythm_drop' && (
          <RhythmDrop
            key="rhythm-drop"
            beat={selectedBeat}
            level={currentLevel}
            onComplete={handleGameComplete}
            onCancel={handleCancel}
          />
        )}

        {phase === 'playing' && selectedBeat && gameType === 'beat_catcher' && (
          <BeatCatcher
            key="beat-catcher"
            beat={selectedBeat}
            level={currentLevel}
            onComplete={handleGameComplete}
            onCancel={handleCancel}
          />
        )}

        {phase === 'playing' && selectedBeat && gameType === 'flow_mixer' && (
          <FlowMixer
            key="flow-mixer"
            beat={selectedBeat}
            level={currentLevel}
            onComplete={handleGameComplete}
            onCancel={handleCancel}
          />
        )}

        {phase === 'results' && results && (
          <RecordingResults
            key="results"
            quality={results.quality}
            rhythmScore={results.rhythmScore}
            listenersGenerated={results.listenersGenerated}
            songTitle={selectedBeat?.name || 'Unknown'}
            combo={results.maxCombo || 0}
            perfectHits={results.perfectHits || 0}
            goodHits={results.goodHits || 0}
            okHits={results.okHits || 0}
            misses={results.misses || 0}
            onClose={handleCloseResults}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
