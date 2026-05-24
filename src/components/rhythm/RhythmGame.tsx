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
            <span className="text-purple-200/60 text-[11px] font-semibold tracking-[0.2em] uppercase">
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
          {/* Wallpaper estilo macOS — Purple City con más color y vida */}
          {phase !== 'playing' && (
            <div className="absolute inset-0">
              {/* Base gradient — rich purple-blue */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e0a4a 0%, #0f1a3d 30%, #0a1628 50%, #12082e 70%, #1a0a3e 100%)' }} />
              
              {/* Large ambient orbs — more vivid */}
              <div className="absolute top-[-15%] right-[5%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)' }} />
              <div className="absolute bottom-[-10%] left-[0%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(34,211,238,0.1) 40%, transparent 70%)' }} />
              <div className="absolute top-[20%] left-[30%] w-[45%] h-[45%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 60%)' }} />
              <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 60%)' }} />
              <div className="absolute top-[50%] left-[5%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 60%)' }} />
              
              {/* Mesh gradient overlay for depth */}
              <div className="absolute inset-0 opacity-40" style={{ background: 'conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.1) 0deg, rgba(34,211,238,0.05) 90deg, rgba(236,72,153,0.1) 180deg, rgba(99,102,241,0.05) 270deg, rgba(124,58,237,0.1) 360deg)' }} />
              
              {/* Stars / sparkles — more of them, varied sizes */}
              <div className="absolute inset-0">
                {[
                  { x: 12, y: 18, s: 2.5, o: 0.6 }, { x: 78, y: 12, s: 2, o: 0.4 }, { x: 42, y: 82, s: 3, o: 0.5 },
                  { x: 88, y: 55, s: 2, o: 0.3 }, { x: 22, y: 62, s: 2.5, o: 0.5 }, { x: 65, y: 28, s: 2, o: 0.4 },
                  { x: 92, y: 82, s: 2.5, o: 0.4 }, { x: 8, y: 42, s: 2, o: 0.3 }, { x: 52, y: 8, s: 2.5, o: 0.5 },
                  { x: 32, y: 88, s: 2, o: 0.4 }, { x: 72, y: 42, s: 2.5, o: 0.5 }, { x: 5, y: 78, s: 2, o: 0.3 },
                  { x: 48, y: 48, s: 1.5, o: 0.3 }, { x: 18, y: 32, s: 1.5, o: 0.25 }, { x: 82, y: 72, s: 1.5, o: 0.3 },
                  { x: 58, y: 65, s: 1.5, o: 0.25 }, { x: 35, y: 15, s: 2, o: 0.4 }, { x: 68, y: 88, s: 2, o: 0.35 },
                ].map((star, i) => (
                  <div key={i} className="absolute rounded-full bg-white" style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.s}px`, height: `${star.s}px`, opacity: star.o, boxShadow: `0 0 ${star.s * 2}px rgba(255,255,255,0.8)` }} />
                ))}
              </div>
              
              {/* Waveform decorations — top and bottom */}
              <svg className="absolute top-8 left-0 right-0 h-10 opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 1000 40">
                <path d="M0,20 Q40,5 80,20 Q120,35 160,20 Q200,5 240,20 Q280,35 320,20 Q360,5 400,20 Q440,35 480,20 Q520,5 560,20 Q600,35 640,20 Q680,5 720,20 Q760,35 800,20 Q840,5 880,20 Q920,35 960,20 Q1000,10 1000,20" fill="none" stroke="#a78bfa" strokeWidth="2"/>
              </svg>
              <svg className="absolute bottom-4 left-0 right-0 h-12 opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 1000 40">
                <path d="M0,20 Q50,8 100,20 Q150,32 200,20 Q250,8 300,20 Q350,32 400,20 Q450,8 500,20 Q550,32 600,20 Q650,8 700,20 Q750,32 800,20 Q850,8 900,20 Q950,32 1000,20" fill="none" stroke="url(#waveGradBg2)" strokeWidth="2.5"/>
                <defs><linearGradient id="waveGradBg2"><stop offset="0%" stopColor="#22d3ee"/><stop offset="50%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#ec4899"/></linearGradient></defs>
              </svg>

              {/* Noise texture for premium feel */}
              <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
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
