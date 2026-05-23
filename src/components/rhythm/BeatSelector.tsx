/**
 * 🎮 LEGENDS: Beat Selector
 * Paleta: purple-navy + cyan/turquesa acentos + texto blanco/cyan
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Beat } from '../../data/songs';
import type { MiniGameType } from './RhythmGame';

interface BeatSelectorProps {
  beats: Beat[];
  onSelect: (beat: Beat, gameType?: MiniGameType) => void;
  onCancel: () => void;
  currentLevel: number;
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

export function BeatSelector({ beats, onSelect, onCancel, currentLevel }: BeatSelectorProps) {
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
      <div className="bg-[#1a1a28]/85 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-cyan-400 text-sm">🎵</span>
            </div>
            <div>
              <span className="text-cyan-300/70 text-[10px] font-semibold uppercase tracking-[0.15em]">
                Estudio de Grabación
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight -mt-0.5">
                {step === 'beat' ? 'Elige tu Beat' : 'Modo de Grabación'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] ml-11">
            <span className="text-cyan-200/60">{beats.length} beats</span>
            <span className="text-cyan-500/30">•</span>
            <span className="text-cyan-200/60">Nivel {currentLevel}</span>
            <span className="text-cyan-500/30">•</span>
            <span className="text-orange-300/80">⚡ -30 energía</span>
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
                            ? 'bg-cyan-400/10 border border-cyan-400/30 shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)]'
                            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-cyan-400/5 hover:border-cyan-400/15'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
                          >
                            {STYLE_ICONS[beat.style] || '🎵'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {beat.name}
                            </h3>
                            {beat.description && (
                              <p className="text-cyan-100/40 text-[11px] mt-0.5 line-clamp-2">
                                {beat.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span 
                                className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider"
                                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                              >
                                {beat.style.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-cyan-200/40 font-mono">
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
                            ? 'bg-cyan-400/10 border border-cyan-400/30 shadow-[0_0_25px_-5px_rgba(34,211,238,0.2)]'
                            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-cyan-400/5 hover:border-cyan-400/15'
                        }`}
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {mode.icon}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-cyan-200' : 'text-white/80'}`}>
                          {mode.name}
                        </h3>
                        <p className="text-cyan-100/35 text-[10px] leading-relaxed">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#222230]/80">
          <button
            onClick={handleBack}
            className="text-cyan-200/50 font-medium hover:text-cyan-200 transition text-[13px]"
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
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] hover:from-cyan-300 hover:to-cyan-400 active:scale-95 shadow-[0_4px_15px_rgba(34,211,238,0.35)]'
                : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }`}
          >
            {step === 'beat' ? 'Siguiente →' : '🎤 ¡GRABAR!'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
