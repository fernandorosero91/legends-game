/**
 * 🎮 LEGENDS: Beat Selector
 * Paleta: purple-navy + cyan/turquesa acentos + texto blanco/cyan
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Beat } from '../../data/songs';
import type { MiniGameType, GameDifficulty } from './RhythmGame';
import { DIFFICULTY_CONFIG } from './RhythmGame';

interface BeatSelectorProps {
  beats: Beat[];
  onSelect: (beat: Beat, gameType?: MiniGameType) => void;
  onCancel: () => void;
  currentLevel: number;
  difficulty: GameDifficulty;
  onDifficultyChange: (d: GameDifficulty) => void;
}

const STYLE_ICONS: Record<string, string> = {
  trap: '⚡',
  lofi: '🎧',
  hiphop: '🎤',
  drill: '🔥',
  boom_bap: '🥁',
};

const STYLE_COLORS: Record<string, string> = {
  trap: '#ff4d6a',
  lofi: '#22d3ee',
  hiphop: '#fbbf24',
  drill: '#a78bfa',
  boom_bap: '#34d399',
};

const GAME_MODES: { id: MiniGameType; name: string; icon: string; description: string; color: string }[] = [
  { id: 'rhythm_drop', name: 'Rhythm Drop', icon: '🎹', description: 'Notas caen por 4 carriles — A, S, D, F', color: '#ff4d6a' },
  { id: 'beat_catcher', name: 'Beat Catcher', icon: '🎯', description: 'Círculos en pantalla — clic cuando el anillo se cierre', color: '#22d3ee' },
  { id: 'flow_mixer', name: 'Flow Mixer', icon: '🎛️', description: 'Secuencias de flechas — ←↑↓→', color: '#fbbf24' },
];

const STYLE_TO_DEFAULT_GAME: Record<string, MiniGameType> = {
  trap: 'rhythm_drop',
  drill: 'rhythm_drop',
  lofi: 'beat_catcher',
  boom_bap: 'beat_catcher',
  hiphop: 'flow_mixer',
};

export function BeatSelector({ beats, onSelect, onCancel, currentLevel, difficulty, onDifficultyChange }: BeatSelectorProps) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [selectedMode, setSelectedMode] = useState<MiniGameType | null>(null);
  const [step, setStep] = useState<'beat' | 'mode'>('beat');

  const handleBeatSelect = (beat: Beat) => {
    setSelectedBeat(beat);
    setSelectedMode(STYLE_TO_DEFAULT_GAME[beat.style] || 'rhythm_drop');
  };

  const handleConfirm = () => {
    if (step === 'beat' && selectedBeat) {
      setStep('mode');
    } else if (step === 'mode' && selectedBeat && selectedMode) {
      onSelect(selectedBeat, selectedMode);
    }
  };

  const handleBack = () => {
    if (step === 'mode') setStep('beat');
    else onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-[640px] mx-auto px-4"
    >
      <div className="bg-gradient-to-b from-[#252545]/95 to-[#1c1c3a]/95 rounded-2xl border border-purple-400/20 overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(139,92,246,0.08)]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-purple-400/15 bg-gradient-to-r from-purple-500/[0.05] to-cyan-500/[0.05]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/15 to-purple-400/15 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.1)]">
              <span className="text-cyan-300 text-base">🎵</span>
            </div>
            <div>
              <span className="text-cyan-300 text-[10px] font-semibold uppercase tracking-[0.15em]">
                Estudio de Grabación
              </span>
              <h2 className="text-[22px] font-bold text-white tracking-tight -mt-0.5">
                {step === 'beat' ? 'Elige tu Beat' : 'Modo de Grabación'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] ml-12">
            <span className="text-purple-200/80">{beats.length} beats</span>
            <span className="text-purple-400/40">•</span>
            <span className="text-purple-200/80">Nivel {currentLevel}</span>
            <span className="text-purple-400/40">•</span>
            <span className="text-amber-300/90">⚡ -30 energía</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: Beats */}
            {step === 'beat' && (
              <motion.div
                key="beat-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                  {beats.map((beat, index) => {
                    const accentColor = STYLE_COLORS[beat.style] || '#22d3ee';
                    const isSelected = selectedBeat?.id === beat.id;

                    return (
                      <motion.button
                        key={beat.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => handleBeatSelect(beat)}
                        className={`relative p-4 rounded-xl text-left transition-all duration-150 group ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-400/[0.15] to-purple-500/[0.1] border border-cyan-400/35 shadow-[0_0_20px_-5px_rgba(34,211,238,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'bg-gradient-to-br from-white/[0.06] to-white/[0.03] border border-purple-300/15 hover:from-purple-400/[0.08] hover:to-cyan-400/[0.04] hover:border-purple-300/25'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110 shadow-sm"
                            style={{ backgroundColor: `${accentColor}20`, border: `1.5px solid ${accentColor}40`, boxShadow: `0 0 10px ${accentColor}15` }}
                          >
                            {STYLE_ICONS[beat.style] || '🎵'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-[14px] truncate">
                              {beat.name}
                            </h3>
                            {beat.description && (
                              <p className="text-purple-200/60 text-[11px] mt-0.5 line-clamp-2">
                                {beat.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span 
                                className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm"
                                style={{ backgroundColor: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}40`, textShadow: `0 0 6px ${accentColor}40` }}
                              >
                                {beat.style.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-purple-300/70 font-mono">
                                {beat.tempo} BPM
                              </span>
                              {beat.requiresSoftware && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-bold">
                                  PRO
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            >
                              <span className="text-[10px] text-[#0a0318] font-black">✓</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Mode */}
            {step === 'mode' && (
              <motion.div
                key="mode-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-3 gap-3">
                  {GAME_MODES.map((mode, index) => {
                    const isSelected = selectedMode === mode.id;
                    return (
                      <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.07 }}
                        onClick={() => setSelectedMode(mode.id)}
                        className={`relative p-5 rounded-xl text-center transition-all duration-150 group ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-400/[0.15] to-purple-500/[0.1] border border-cyan-400/35 shadow-[0_0_25px_-5px_rgba(34,211,238,0.2)]'
                            : 'bg-gradient-to-br from-white/[0.06] to-white/[0.03] border border-purple-300/15 hover:from-purple-400/[0.08] hover:to-cyan-400/[0.04] hover:border-purple-300/25'
                        }`}
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {mode.icon}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-cyan-200' : 'text-white/80'}`}>
                          {mode.name}
                        </h3>
                        <p className="text-purple-200/50 text-[10px] leading-relaxed">
                          {mode.description}
                        </p>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {selectedMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 px-4 py-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10"
                  >
                    <p className="text-cyan-100/60 text-[11px] leading-relaxed">
                      <span className="text-cyan-300 mr-1.5">💡</span>
                      {GAME_MODES.find(m => m.id === selectedMode)?.description}
                    </p>
                  </motion.div>
                )}

                {/* Difficulty selector */}
                <div className="mt-4">
                  <p className="text-purple-200/60 text-[10px] uppercase tracking-wider font-semibold mb-2">Dificultad</p>
                  <div className="flex gap-2">
                    {(Object.entries(DIFFICULTY_CONFIG) as [GameDifficulty, typeof DIFFICULTY_CONFIG['easy']][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => onDifficultyChange(key)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-center transition-all text-sm font-semibold ${
                          difficulty === key
                            ? 'border-2 shadow-[0_0_12px_-2px] scale-[1.02]'
                            : 'border border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.04]'
                        }`}
                        style={difficulty === key ? { borderColor: cfg.color, color: cfg.color, backgroundColor: `${cfg.color}12`, boxShadow: `0 0 12px -2px ${cfg.color}40` } : {}}
                      >
                        <span className="text-base mr-1">{cfg.icon}</span>
                        {cfg.label}
                        <div className="text-[9px] mt-0.5 opacity-60 font-normal">
                          {key === 'easy' ? '×0.6 oyentes' : key === 'hard' ? '×1.5 oyentes' : '×1 oyentes'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-400/15 bg-[#1e1e3a]/60">
          <button
            onClick={handleBack}
            className="text-purple-200/70 font-medium hover:text-cyan-200 transition text-[13px]"
          >
            ← {step === 'mode' ? 'Cambiar Beat' : 'Cancelar'}
          </button>

          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 rounded-full transition-all ${step === 'beat' ? 'w-5 bg-cyan-400' : 'w-2 bg-cyan-400/20'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'mode' ? 'w-5 bg-cyan-400' : 'w-2 bg-cyan-400/20'}`} />
          </div>

          <button
            onClick={handleConfirm}
            disabled={step === 'beat' ? !selectedBeat : !selectedMode}
            className={`px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all ${
              (step === 'beat' ? selectedBeat : selectedMode)
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] hover:from-cyan-300 hover:to-cyan-400 active:scale-95 shadow-[0_4px_20px_rgba(34,211,238,0.4)] hover:shadow-[0_6px_25px_rgba(34,211,238,0.5)]'
                : 'bg-purple-500/10 text-purple-300/40 cursor-not-allowed border border-purple-500/10'
            }`}
          >
            {step === 'beat' ? 'Siguiente →' : '🎤 ¡GRABAR!'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
