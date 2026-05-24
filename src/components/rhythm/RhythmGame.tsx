/**
 * 🎮 LEGENDS: Rhythm Game — DAW Screen Simulation
 * La pantalla simula un monitor con un DAW (Logic Pro / FL Studio)
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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

  const hasSoftware = inventory.some(
    (item) => item.itemId === 'production_software' && item.equipped
  );
  const availableBeats = getAvailableBeats(currentLevel, hasSoftware);

  const handleSelectBeat = useCallback((beat: Beat, selectedGameType?: MiniGameType) => {
    setSelectedBeat(beat);
    const type = selectedGameType || STYLE_TO_GAME[beat.style] || 'rhythm_drop';
    setGameType(type);
    setPhase('instructions');
  }, []);

  const handleStartGame = useCallback(() => {
    if (!selectedBeat) return;
    consumeEnergy(30);
    RhythmSystem.startRecording(selectedBeat.id);
    setPhase('playing');
  }, [selectedBeat, consumeEnergy]);

  const handleGameComplete = useCallback((score: number, maxCombo: number, stats: {
    perfectHits: number;
    goodHits: number;
    okHits: number;
    misses: number;
  }) => {
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
    setResults({ ...result, maxCombo, ...stats });
    setPhase('results');
  }, []);

  const handleCancel = useCallback(() => {
    RhythmSystem.cancelRecording();
    useGameStore.getState().setGamePhase('playing');
  }, []);

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
      {/* Fondo detrás del monitor — Purple City ambiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1450] via-[#1a0d35] to-[#0f0920]" />

      {/* Monitor frame — ocupa casi toda la pantalla */}
      <div className="absolute inset-2 sm:inset-3 lg:inset-4 rounded-lg overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        
        {/* Monitor bezel top — dark grey like iMac */}
        <div className="h-9 bg-gradient-to-b from-[#4a4a50] to-[#3a3a40] border-b border-[#2a2a2e] flex items-center px-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-white/50 text-[11px] font-medium tracking-wider">
              LEGENDS STUDIO — Sesión de Grabación
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            <span className="text-red-400 text-[10px] font-bold uppercase">REC</span>
          </div>
        </div>

        {/* Screen area */}
        <div className="flex-1 bg-[#1a1a20] relative overflow-hidden">
          {/* Imagen de DAW solo visible en select/instructions/results (NO durante gameplay) */}
          {phase !== 'playing' && (
            <>
              <img 
                src="/studio.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/30" />
            </>
          )}

          {/* Game content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {phase === 'select_beat' && (
              <BeatSelector key="selector" beats={availableBeats} onSelect={handleSelectBeat} onCancel={handleCancel} currentLevel={currentLevel} />
            )}
            {phase === 'instructions' && selectedBeat && (
              <InstructionsModal key="instructions" gameType={gameType} beatName={selectedBeat.name} onStart={handleStartGame} onBack={() => setPhase('select_beat')} />
            )}
            {phase === 'playing' && selectedBeat && gameType === 'rhythm_drop' && (
              <RhythmDrop beat={selectedBeat} level={currentLevel} onComplete={handleGameComplete} onCancel={handleCancel} />
            )}
            {phase === 'playing' && selectedBeat && gameType === 'beat_catcher' && (
              <BeatCatcher beat={selectedBeat} level={currentLevel} onComplete={handleGameComplete} onCancel={handleCancel} />
            )}
            {phase === 'playing' && selectedBeat && gameType === 'flow_mixer' && (
              <FlowMixer beat={selectedBeat} level={currentLevel} onComplete={handleGameComplete} onCancel={handleCancel} />
            )}
            {phase === 'results' && results && (
              <RecordingResults quality={results.quality} rhythmScore={results.rhythmScore} listenersGenerated={results.listenersGenerated} songTitle={selectedBeat?.name || 'Unknown'} combo={results.maxCombo || 0} perfectHits={results.perfectHits || 0} goodHits={results.goodHits || 0} okHits={results.okHits || 0} misses={results.misses || 0} onClose={handleCloseResults} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
