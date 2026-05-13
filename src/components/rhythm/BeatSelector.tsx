/**
 * 🎮 LEGENDS: Beat Selector — Pantalla de selección profesional
 * Permite elegir beat Y modo de juego
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
  trap: '🎹',
  lofi: '🎧',
  hiphop: '🎤',
  drill: '⚡',
  boom_bap: '🥁',
};

const GAME_MODES: { id: MiniGameType; name: string; icon: string; description: string; color: string }[] = [
  { id: 'rhythm_drop', name: 'Rhythm Drop', icon: '🎹', description: 'Notas caen por 4 carriles — presiona A, S, D, F', color: 'from-red-500 to-purple-600' },
  { id: 'beat_catcher', name: 'Beat Catcher', icon: '🎯', description: 'Círculos aparecen en pantalla — haz clic a tiempo', color: 'from-cyan-500 to-blue-600' },
  { id: 'flow_mixer', name: 'Flow Mixer', icon: '🎛️', description: 'Secuencias de flechas — sigue el ritmo con ←↑↓→', color: 'from-green-500 to-emerald-600' },
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
    if (step === 'mode') {
      setStep('beat');
    } else {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-3xl mx-auto px-6"
    >
      {/* Contenedor principal con glassmorphism */}
      <div className="bg-gradient-to-b from-purple-900/60 to-black/80 backdrop-blur-2xl rounded-3xl border border-purple-500/20 p-8 shadow-2xl shadow-purple-900/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-xs font-medium uppercase tracking-widest">
              Estudio de Grabación
            </span>
          </motion.div>

          <h2 className="text-3xl font-black text-white">
            {step === 'beat' ? 'Elige tu Beat' : 'Modo de Juego'}
          </h2>
          <p className="text-purple-400/80 mt-2 text-sm">
            {step === 'beat' 
              ? `${beats.length} beats disponibles • Nivel ${currentLevel} • Costo: -30 energía`
              : `Beat: ${selectedBeat?.name} • Elige cómo quieres grabar`
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* PASO 1: Selección de Beat */}
          {step === 'beat' && (
            <motion.div
              key="beat-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
                {beats.map((beat, index) => (
                  <motion.button
                    key={beat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleBeatSelect(beat)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group overflow-hidden ${
                      selectedBeat?.id === beat.id
                        ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/40 scale-[1.02]'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/30'
                    }`}
                  >
                    {/* Glow de fondo al seleccionar */}
                    {selectedBeat?.id === beat.id && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                    )}

                    <div className="relative flex items-start gap-3">
                      <div className="text-3xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        {STYLE_ICONS[beat.style] || '🎵'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm truncate">
                          {beat.name}
                        </h3>
                        {beat.description && (
                          <p className="text-white/40 text-xs mt-1 line-clamp-2">
                            {beat.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-purple-300 font-semibold uppercase tracking-wider border border-white/5">
                            {beat.style.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono">
                            {beat.tempo} BPM
                          </span>
                          {beat.requiresSoftware && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                              ★ Premium
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Check indicator */}
                      {selectedBeat?.id === beat.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                        >
                          <span className="text-white text-xs">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* PASO 2: Selección de Modo de Juego */}
          {step === 'mode' && (
            <motion.div
              key="mode-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {GAME_MODES.map((mode, index) => (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative p-5 rounded-2xl border text-center transition-all duration-200 group overflow-hidden ${
                      selectedMode === mode.id
                        ? 'border-white/20 scale-[1.03] shadow-xl'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} transition-opacity duration-200 ${
                      selectedMode === mode.id ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
                    }`} />

                    <div className="relative">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        {mode.icon}
                      </div>
                      <h3 className="text-white font-bold text-sm mb-1">
                        {mode.name}
                      </h3>
                      <p className="text-white/40 text-xs leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    {selectedMode === mode.id && (
                      <motion.div
                        layoutId="mode-indicator"
                        className="absolute inset-0 rounded-2xl border-2 border-white/30 pointer-events-none"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Recomendación */}
              {selectedBeat && (
                <p className="text-center text-white/30 text-xs mt-4">
                  💡 Recomendado para {selectedBeat.style}: <span className="text-purple-400">{GAME_MODES.find(m => m.id === STYLE_TO_DEFAULT_GAME[selectedBeat.style])?.name}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer — Botones */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl text-white/60 font-medium hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            ← {step === 'mode' ? 'Cambiar Beat' : 'Cancelar'}
          </button>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'beat' ? 'bg-purple-400' : 'bg-white/20'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'mode' ? 'bg-purple-400' : 'bg-white/20'}`} />
          </div>

          <button
            onClick={handleConfirm}
            disabled={step === 'beat' ? !selectedBeat : !selectedMode}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              (step === 'beat' ? selectedBeat : selectedMode)
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {step === 'beat' ? 'Siguiente →' : '🎤 ¡Grabar!'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
