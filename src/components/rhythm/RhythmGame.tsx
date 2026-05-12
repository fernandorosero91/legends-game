/**
 * 🎮 LEGENDS: Rhythm Game — Minijuego de Grabación
 * Componente principal del minijuego rítmico (4 carriles: A, S, D, F)
 * Diseño: Fullscreen overlay con estética Purple City
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRhythmGame } from '../../hooks/useRhythmGame';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { getAvailableBeats, type Beat } from '../../data/songs';
import { BeatLane } from './BeatLane';
import { ComboMeter } from './ComboMeter';
import { ScoreBoard } from './ScoreBoard';
import { BeatSelector } from './BeatSelector';
import { RecordingResults } from './RecordingResults';

type RhythmPhase = 'select_beat' | 'countdown' | 'playing' | 'results';

const LANE_KEYS = ['a', 's', 'd', 'f'];
const LANE_LABELS = ['A', 'S', 'D', 'F'];
const LANE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

// Duración del juego en ms (30 segundos para que sea dinámico)
const GAME_DURATION = 30000;

export function RhythmGame() {
  const [phase, setPhase] = useState<RhythmPhase>('select_beat');
  const [countdown, setCountdown] = useState(3);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [hitFeedback, setHitFeedback] = useState<{ lane: number; accuracy: string; points: number } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [results, setResults] = useState<any>(null);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { currentLevel } = useGameStore();
  const { energy, consumeEnergy, inventory } = usePlayerStore();
  const { addNotification } = useUIStore();

  const {
    gameState,
    startRecording,
    processInput,
    updateTime,
    finishRecording,
    cancelRecording,
  } = useRhythmGame();

  // Obtener beats disponibles
  const hasSoftware = inventory.some(
    (item) => item.itemId === 'production_software' && item.equipped
  );
  const availableBeats = getAvailableBeats(currentLevel, hasSoftware);

  // Seleccionar beat y empezar countdown
  const handleSelectBeat = useCallback((beat: Beat) => {
    setSelectedBeat(beat);
    setPhase('countdown');
    setCountdown(3);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown <= 0) {
      // Iniciar el juego
      if (selectedBeat) {
        startRecording(selectedBeat.id);
        consumeEnergy(30);
        startTimeRef.current = performance.now();
        setPhase('playing');
      }
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, selectedBeat, startRecording, consumeEnergy]);

  // Game loop — actualizar tiempo
  useEffect(() => {
    if (phase !== 'playing') return;

    const loop = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      setElapsedTime(elapsed);
      updateTime(elapsed);

      // Verificar si terminó el juego
      if (elapsed >= GAME_DURATION) {
        handleFinish();
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, updateTime]);

  // Keyboard input
  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const laneIndex = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (laneIndex === -1) return;

      const result = processInput(laneIndex);
      if (result) {
        setHitFeedback({ lane: laneIndex, accuracy: result.accuracy || 'miss', points: result.points });
        
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => setHitFeedback(null), 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, processInput]);

  // Finalizar grabación
  const handleFinish = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    const result = finishRecording();
    setResults(result);
    setPhase('results');
  }, [finishRecording]);

  // Cancelar y volver al juego
  const handleCancel = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    cancelRecording();
    useGameStore.getState().setGamePhase('playing');
  }, [cancelRecording]);

  // Cerrar resultados y volver al juego
  const handleCloseResults = useCallback(() => {
    useGameStore.getState().setGamePhase('playing');
  }, []);

  // Obtener notas visibles para cada carril
  const getNotesForLane = (lane: number) => {
    if (!gameState) return [];
    const windowSize = 3000; // 3 segundos de ventana visible
    return gameState.notes.filter(
      (note) =>
        note.lane === lane &&
        !note.hit &&
        note.time >= elapsedTime - 200 &&
        note.time <= elapsedTime + windowSize
    );
  };

  // Progreso del juego (0-1)
  const progress = Math.min(elapsedTime / GAME_DURATION, 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />

      {/* Contenido según fase */}
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

        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="relative z-10 text-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 drop-shadow-2xl"
            >
              {countdown === 0 ? '🎤' : countdown}
            </motion.div>
            <p className="mt-6 text-purple-300 text-xl font-medium animate-pulse">
              {selectedBeat?.name}
            </p>
            <p className="mt-2 text-purple-400/60 text-sm">
              Prepárate para grabar...
            </p>
          </motion.div>
        )}

        {phase === 'playing' && gameState && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-full flex flex-col"
          >
            {/* Header — Info del beat y progreso */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-4">
                <div className="text-white font-bold text-lg">
                  🎵 {selectedBeat?.name}
                </div>
                <div className="text-purple-400 text-sm">
                  {selectedBeat?.style.toUpperCase()} • {selectedBeat?.tempo} BPM
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-purple-900/60 rounded-full overflow-hidden border border-purple-700/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <span className="text-purple-300 text-xs font-mono w-12 text-right">
                  {Math.ceil((GAME_DURATION - elapsedTime) / 1000)}s
                </span>
              </div>

              {/* Botón cancelar */}
              <button
                onClick={handleCancel}
                className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>

            {/* Combo y Score */}
            <div className="flex items-center justify-between px-6 py-2">
              <ComboMeter combo={gameState.combo} maxCombo={gameState.maxCombo} />
              <ScoreBoard
                score={gameState.score}
                perfectHits={gameState.perfectHits}
                goodHits={gameState.goodHits}
                okHits={gameState.okHits}
                misses={gameState.misses}
              />
            </div>

            {/* Área de juego — 4 carriles */}
            <div className="flex-1 flex items-stretch justify-center gap-3 px-8 py-4 relative">
              {LANE_KEYS.map((_, laneIndex) => (
                <BeatLane
                  key={laneIndex}
                  laneIndex={laneIndex}
                  label={LANE_LABELS[laneIndex]}
                  color={LANE_COLORS[laneIndex]}
                  notes={getNotesForLane(laneIndex)}
                  currentTime={elapsedTime}
                  isHit={hitFeedback?.lane === laneIndex}
                  hitAccuracy={hitFeedback?.lane === laneIndex ? hitFeedback.accuracy : undefined}
                />
              ))}

              {/* Hit feedback overlay */}
              <AnimatePresence>
                {hitFeedback && (
                  <motion.div
                    key={`feedback-${Date.now()}`}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -40, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                  >
                    <span className={`text-2xl font-black ${
                      hitFeedback.accuracy === 'perfect' ? 'text-yellow-300' :
                      hitFeedback.accuracy === 'good' ? 'text-green-400' :
                      hitFeedback.accuracy === 'ok' ? 'text-blue-400' :
                      'text-red-400'
                    }`}>
                      {hitFeedback.accuracy === 'perfect' && '✨ PERFECT!'}
                      {hitFeedback.accuracy === 'good' && '🔥 GOOD!'}
                      {hitFeedback.accuracy === 'ok' && '👍 OK'}
                      {hitFeedback.accuracy === 'miss' && '💨 MISS'}
                      {hitFeedback.points > 0 && (
                        <span className="ml-2 text-lg text-purple-300">+{hitFeedback.points}</span>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer — Indicadores de teclas */}
            <div className="flex justify-center gap-3 px-8 pb-6">
              {LANE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className={`w-20 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all duration-100 ${
                    hitFeedback?.lane === i
                      ? 'border-white bg-white/20 scale-95 shadow-lg shadow-white/20'
                      : 'border-purple-600/50 bg-purple-900/40'
                  }`}
                  style={{
                    borderColor: hitFeedback?.lane === i ? LANE_COLORS[i] : undefined,
                    boxShadow: hitFeedback?.lane === i ? `0 0 20px ${LANE_COLORS[i]}40` : undefined,
                  }}
                >
                  <span className="text-white/90">{LANE_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'results' && results && (
          <RecordingResults
            key="results"
            quality={results.quality}
            rhythmScore={results.rhythmScore}
            listenersGenerated={results.listenersGenerated}
            songTitle={selectedBeat?.name || 'Unknown'}
            combo={gameState?.maxCombo || 0}
            perfectHits={gameState?.perfectHits || 0}
            goodHits={gameState?.goodHits || 0}
            okHits={gameState?.okHits || 0}
            misses={gameState?.misses || 0}
            onClose={handleCloseResults}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
