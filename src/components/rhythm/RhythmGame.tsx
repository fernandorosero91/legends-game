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

      {/* Monitor frame */}
      <div className="absolute inset-2 sm:inset-3 lg:inset-4 rounded-xl overflow-hidden flex flex-col shadow-[0_0_60px_rgba(124,58,237,0.1),0_0_120px_rgba(0,0,0,0.8)] border border-purple-500/10">
        
        {/* Monitor bezel top — premium dark with subtle shine */}
        <div className="h-10 bg-gradient-to-b from-[#2d2d35] to-[#1e1e25] border-b border-white/[0.06] flex items-center px-5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_4px_rgba(255,95,87,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_4px_rgba(254,188,46,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_4px_rgba(40,200,64,0.4)]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-cyan-200 text-[11px] font-semibold tracking-[0.2em] uppercase">
              Legends Studio — Sesión de Grabación
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">REC</span>
          </div>
        </div>

        {/* Screen area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Wallpaper con notas musicales flotantes y luces */}
          {phase !== 'playing' && (
            <div className="absolute inset-0">
              {/* Base gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e0a4a 0%, #0f1a3d 30%, #0a1628 50%, #12082e 70%, #1a0a3e 100%)' }} />
              
              {/* Large glowing orbs — more vivid */}
              <div className="absolute top-[-15%] right-[5%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)' }} />
              <div className="absolute bottom-[-10%] left-[0%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.1) 40%, transparent 70%)' }} />
              <div className="absolute top-[20%] left-[30%] w-[45%] h-[45%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 60%)' }} />
              <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 60%)' }} />

              {/* Floating musical notes — bright white with cyan/amber glow */}
              <div className="absolute inset-0 overflow-hidden">
                {[
                  { symbol: '♪', x: 5, y: 12, size: 52, glow: '#22d3ee', rot: -15, opacity: 0.5 },
                  { symbol: '♫', x: 90, y: 18, size: 46, glow: '#fbbf24', rot: 12, opacity: 0.45 },
                  { symbol: '♬', x: 10, y: 68, size: 42, glow: '#06b6d4', rot: -8, opacity: 0.45 },
                  { symbol: '🎵', x: 84, y: 72, size: 40, glow: '#f59e0b', rot: 20, opacity: 0.4 },
                  { symbol: '♪', x: 93, y: 42, size: 56, glow: '#67e8f9', rot: -25, opacity: 0.4 },
                  { symbol: '♫', x: 2, y: 42, size: 48, glow: '#fcd34d', rot: 18, opacity: 0.45 },
                  { symbol: '🎶', x: 78, y: 6, size: 36, glow: '#22d3ee', rot: -5, opacity: 0.35 },
                  { symbol: '♬', x: 18, y: 86, size: 44, glow: '#fbbf24', rot: 10, opacity: 0.4 },
                  { symbol: '🎵', x: 52, y: 4, size: 34, glow: '#67e8f9', rot: -12, opacity: 0.3 },
                  { symbol: '♪', x: 62, y: 88, size: 40, glow: '#f59e0b', rot: 22, opacity: 0.4 },
                  { symbol: '🎧', x: 96, y: 86, size: 38, glow: '#22d3ee', rot: -8, opacity: 0.3 },
                  { symbol: '🎤', x: 6, y: 90, size: 34, glow: '#fcd34d', rot: 5, opacity: 0.3 },
                  { symbol: '♫', x: 44, y: 92, size: 32, glow: '#06b6d4', rot: -15, opacity: 0.28 },
                  { symbol: '🎹', x: 32, y: 6, size: 32, glow: '#fbbf24', rot: 8, opacity: 0.28 },
                  { symbol: '♪', x: 72, y: 50, size: 30, glow: '#67e8f9', rot: -20, opacity: 0.25 },
                  { symbol: '♬', x: 25, y: 35, size: 28, glow: '#f59e0b', rot: 14, opacity: 0.25 },
                ].map((note, i) => (
                  <div 
                    key={i} 
                    className="absolute select-none"
                    style={{ 
                      left: `${note.x}%`, 
                      top: `${note.y}%`, 
                      fontSize: `${note.size}px`,
                      color: '#ffffff',
                      opacity: note.opacity,
                      transform: `rotate(${note.rot}deg)`,
                      textShadow: `0 0 10px ${note.glow}, 0 0 25px ${note.glow}, 0 0 50px ${note.glow}, 0 0 80px ${note.glow}80`,
                    }}
                  >
                    {note.symbol}
                  </div>
                ))}
              </div>

              {/* Animated light rays */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-0 left-[20%] w-[2px] h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.4) 30%, rgba(34,211,238,0.3) 60%, transparent)', animation: 'rd-eq 3s ease-in-out infinite alternate' }} />
                <div className="absolute top-0 left-[50%] w-[2px] h-full" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(236,72,153,0.3) 40%, rgba(99,102,241,0.3) 70%, transparent)', animation: 'rd-eq 4s ease-in-out infinite alternate-reverse' }} />
                <div className="absolute top-0 left-[80%] w-[2px] h-full" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(34,211,238,0.4) 50%, rgba(124,58,237,0.2) 80%, transparent)', animation: 'rd-eq 3.5s ease-in-out infinite alternate' }} />
              </div>

              {/* Bokeh light circles */}
              <div className="absolute inset-0">
                {[
                  { x: 10, y: 25, s: 80, color: 'rgba(124,58,237,0.08)' },
                  { x: 75, y: 15, s: 60, color: 'rgba(34,211,238,0.06)' },
                  { x: 85, y: 70, s: 100, color: 'rgba(236,72,153,0.05)' },
                  { x: 25, y: 80, s: 70, color: 'rgba(99,102,241,0.07)' },
                  { x: 55, y: 50, s: 90, color: 'rgba(251,191,36,0.04)' },
                  { x: 40, y: 20, s: 50, color: 'rgba(52,211,153,0.05)' },
                ].map((bokeh, i) => (
                  <div key={i} className="absolute rounded-full" style={{
                    left: `${bokeh.x}%`, top: `${bokeh.y}%`,
                    width: `${bokeh.s}px`, height: `${bokeh.s}px`,
                    background: `radial-gradient(circle, ${bokeh.color}, transparent 70%)`,
                    border: `1px solid ${bokeh.color.replace(/[\d.]+\)$/, '0.15)')}`,
                  }} />
                ))}
              </div>

              {/* Sparkles */}
              <div className="absolute inset-0">
                {[
                  { x: 12, y: 18, s: 3, o: 0.7 }, { x: 78, y: 12, s: 2.5, o: 0.5 }, { x: 42, y: 82, s: 3, o: 0.6 },
                  { x: 88, y: 55, s: 2.5, o: 0.4 }, { x: 22, y: 62, s: 3, o: 0.6 }, { x: 65, y: 28, s: 2.5, o: 0.5 },
                  { x: 92, y: 82, s: 3, o: 0.5 }, { x: 8, y: 42, s: 2.5, o: 0.4 }, { x: 52, y: 8, s: 3, o: 0.6 },
                  { x: 32, y: 88, s: 2.5, o: 0.5 }, { x: 72, y: 42, s: 3, o: 0.6 }, { x: 5, y: 78, s: 2.5, o: 0.4 },
                  { x: 48, y: 48, s: 2, o: 0.4 }, { x: 18, y: 32, s: 2, o: 0.35 }, { x: 82, y: 72, s: 2, o: 0.4 },
                ].map((star, i) => (
                  <div key={i} className="absolute rounded-full bg-white" style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.s}px`, height: `${star.s}px`, opacity: star.o, boxShadow: `0 0 ${star.s * 3}px rgba(255,255,255,0.9), 0 0 ${star.s * 6}px rgba(200,200,255,0.4)` }} />
                ))}
              </div>

              {/* Bottom waveform */}
              <svg className="absolute bottom-2 left-0 right-0 h-14 opacity-[0.12]" preserveAspectRatio="none" viewBox="0 0 1000 40">
                <path d="M0,20 Q40,5 80,20 Q120,35 160,20 Q200,5 240,20 Q280,35 320,20 Q360,5 400,20 Q440,35 480,20 Q520,5 560,20 Q600,35 640,20 Q680,5 720,20 Q760,35 800,20 Q840,5 880,20 Q920,35 960,20 Q1000,10 1000,20" fill="none" stroke="url(#waveGradBg3)" strokeWidth="2.5"/>
                <defs><linearGradient id="waveGradBg3"><stop offset="0%" stopColor="#7c3aed"/><stop offset="33%" stopColor="#22d3ee"/><stop offset="66%" stopColor="#ec4899"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient></defs>
              </svg>
              
              {/* Top waveform */}
              <svg className="absolute top-6 left-0 right-0 h-10 opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 1000 30">
                <path d="M0,15 Q50,5 100,15 Q150,25 200,15 Q250,5 300,15 Q350,25 400,15 Q450,5 500,15 Q550,25 600,15 Q650,5 700,15 Q750,25 800,15 Q850,5 900,15 Q950,25 1000,15" fill="none" stroke="url(#waveGradBg4)" strokeWidth="1.5"/>
                <defs><linearGradient id="waveGradBg4"><stop offset="0%" stopColor="#22d3ee"/><stop offset="50%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#34d399"/></linearGradient></defs>
              </svg>
            </div>
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
