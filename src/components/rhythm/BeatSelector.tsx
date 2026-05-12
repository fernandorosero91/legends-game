/**
 * 🎮 LEGENDS: Beat Selector
 * Pantalla de selección de beat antes de grabar
 * Muestra los beats disponibles según el nivel actual
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Beat } from '../../data/songs';

interface BeatSelectorProps {
  beats: Beat[];
  onSelect: (beat: Beat) => void;
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

const STYLE_COLORS: Record<string, string> = {
  trap: 'from-red-500/20 to-purple-500/20 border-red-500/30',
  lofi: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
  hiphop: 'from-orange-500/20 to-purple-500/20 border-orange-500/30',
  drill: 'from-yellow-500/20 to-purple-500/20 border-yellow-500/30',
  boom_bap: 'from-green-500/20 to-purple-500/20 border-green-500/30',
};

export function BeatSelector({ beats, onSelect, onCancel, currentLevel }: BeatSelectorProps) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-2xl mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300"
        >
          🎵 Selecciona un Beat
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-purple-400 mt-2"
        >
          Elige el beat para tu próxima canción • Nivel {currentLevel}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-purple-500/70 text-sm mt-1"
        >
          Costo: -30 energía • Usa A, S, D, F al ritmo
        </motion.p>
      </div>

      {/* Grid de beats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {beats.map((beat, index) => (
          <motion.button
            key={beat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => setSelectedBeat(beat)}
            className={`relative p-4 rounded-xl border text-left transition-all duration-200 group ${
              selectedBeat?.id === beat.id
                ? 'border-purple-400 bg-purple-500/20 ring-2 ring-purple-400/30 scale-[1.02]'
                : `bg-gradient-to-br ${STYLE_COLORS[beat.style] || 'from-purple-500/10 to-purple-900/20 border-purple-700/30'} hover:border-purple-500/50 hover:scale-[1.01]`
            }`}
          >
            {/* Indicador de selección */}
            {selectedBeat?.id === beat.id && (
              <motion.div
                layoutId="beat-selected"
                className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white shadow-lg"
              >
                ✓
              </motion.div>
            )}

            <div className="flex items-start gap-3">
              {/* Icono del estilo */}
              <div className="text-3xl mt-0.5 group-hover:scale-110 transition-transform">
                {STYLE_ICONS[beat.style] || '🎵'}
              </div>

              <div className="flex-1 min-w-0">
                {/* Nombre del beat */}
                <h3 className="text-white font-bold text-sm truncate">
                  {beat.name}
                </h3>

                {/* Descripción */}
                {beat.description && (
                  <p className="text-purple-400/80 text-xs mt-1 line-clamp-2">
                    {beat.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-700/40 text-purple-300 font-medium">
                    {beat.style.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-purple-500">
                    {beat.tempo} BPM
                  </span>
                  {beat.requiresSoftware && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Botones de acción */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 mt-8"
      >
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-purple-600/40 text-purple-300 font-medium hover:bg-purple-800/30 hover:border-purple-500/50 transition-all"
        >
          Cancelar
        </button>

        <button
          onClick={() => selectedBeat && onSelect(selectedBeat)}
          disabled={!selectedBeat}
          className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
            selectedBeat
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-400/40 hover:scale-105'
              : 'bg-purple-800/40 text-purple-500 cursor-not-allowed'
          }`}
        >
          🎤 Grabar
        </button>
      </motion.div>
    </motion.div>
  );
}
