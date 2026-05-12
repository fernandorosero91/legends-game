/**
 * 🎮 LEGENDS: Recording Results
 * Pantalla de resultados después de grabar una canción
 * Muestra calidad, oyentes ganados, estadísticas detalladas
 */

import { motion } from 'framer-motion';
import type { SongQuality } from '../../types/game';

interface RecordingResultsProps {
  quality: SongQuality;
  rhythmScore: number;
  listenersGenerated: number;
  songTitle: string;
  combo: number;
  perfectHits: number;
  goodHits: number;
  okHits: number;
  misses: number;
  onClose: () => void;
}

const QUALITY_CONFIG: Record<SongQuality, { label: string; emoji: string; color: string; gradient: string; description: string }> = {
  masterpiece: {
    label: 'OBRA MAESTRA',
    emoji: '💎',
    color: 'text-yellow-300',
    gradient: 'from-yellow-400 via-amber-300 to-yellow-500',
    description: '¡Perfección absoluta! Esta canción será legendaria.',
  },
  high: {
    label: 'ALTA CALIDAD',
    emoji: '🔥',
    color: 'text-green-300',
    gradient: 'from-green-400 via-emerald-300 to-green-500',
    description: 'Excelente ejecución. Tu audiencia crecerá rápido.',
  },
  medium: {
    label: 'CALIDAD MEDIA',
    emoji: '👍',
    color: 'text-blue-300',
    gradient: 'from-blue-400 via-cyan-300 to-blue-500',
    description: 'Buen trabajo. Sigue practicando para mejorar.',
  },
  low: {
    label: 'BAJA CALIDAD',
    emoji: '😅',
    color: 'text-red-300',
    gradient: 'from-red-400 via-orange-300 to-red-500',
    description: 'Necesitas más práctica. ¡No te rindas!',
  },
};

export function RecordingResults({
  quality,
  rhythmScore,
  listenersGenerated,
  songTitle,
  combo,
  perfectHits,
  goodHits,
  okHits,
  misses,
  onClose,
}: RecordingResultsProps) {
  const config = QUALITY_CONFIG[quality];
  const totalNotes = perfectHits + goodHits + okHits + misses;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-lg mx-auto px-6"
    >
      <div className="bg-gradient-to-b from-purple-900/95 to-black/95 rounded-3xl border border-purple-500/30 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
        {/* Calidad — Header principal */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
            className="text-6xl mb-3"
          >
            {config.emoji}
          </motion.div>

          <h2 className={`text-2xl font-black ${config.color} tracking-wide`}>
            {config.label}
          </h2>

          <p className="text-purple-400/80 text-sm mt-2">
            {config.description}
          </p>
        </motion.div>

        {/* Título de la canción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6 py-3 px-4 rounded-xl bg-purple-800/30 border border-purple-600/20"
        >
          <span className="text-purple-500 text-xs font-medium uppercase tracking-wider">
            Canción grabada
          </span>
          <h3 className="text-white font-bold text-lg mt-1">
            🎵 "{songTitle}"
          </h3>
        </motion.div>

        {/* Estadísticas principales */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {/* Score */}
          <div className="text-center p-3 rounded-xl bg-purple-800/20 border border-purple-700/20">
            <div className="text-xs text-purple-500 font-medium">Precisión</div>
            <div className={`text-2xl font-black mt-1 ${
              rhythmScore >= 90 ? 'text-yellow-300' :
              rhythmScore >= 70 ? 'text-green-300' :
              rhythmScore >= 50 ? 'text-blue-300' :
              'text-red-300'
            }`}>
              {rhythmScore}%
            </div>
          </div>

          {/* Oyentes */}
          <div className="text-center p-3 rounded-xl bg-cyan-900/20 border border-cyan-700/20">
            <div className="text-xs text-cyan-500 font-medium">Oyentes</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              +{listenersGenerated.toLocaleString()}
            </div>
          </div>

          {/* Max Combo */}
          <div className="text-center p-3 rounded-xl bg-orange-900/20 border border-orange-700/20">
            <div className="text-xs text-orange-500 font-medium">Max Combo</div>
            <div className="text-2xl font-black text-orange-300 mt-1">
              {combo}x
            </div>
          </div>
        </motion.div>

        {/* Desglose de hits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h4 className="text-xs text-purple-500 font-medium uppercase tracking-wider mb-3">
            Desglose de notas
          </h4>

          <div className="space-y-2">
            {/* Perfect */}
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xs font-bold w-16">Perfect</span>
              <div className="flex-1 h-3 bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalNotes > 0 ? (perfectHits / totalNotes) * 100 : 0}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full"
                />
              </div>
              <span className="text-yellow-300 text-xs font-bold w-8 text-right">{perfectHits}</span>
            </div>

            {/* Good */}
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-xs font-bold w-16">Good</span>
              <div className="flex-1 h-3 bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalNotes > 0 ? (goodHits / totalNotes) * 100 : 0}%` }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full"
                />
              </div>
              <span className="text-green-300 text-xs font-bold w-8 text-right">{goodHits}</span>
            </div>

            {/* OK */}
            <div className="flex items-center gap-3">
              <span className="text-blue-400 text-xs font-bold w-16">OK</span>
              <div className="flex-1 h-3 bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalNotes > 0 ? (okHits / totalNotes) * 100 : 0}%` }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full"
                />
              </div>
              <span className="text-blue-300 text-xs font-bold w-8 text-right">{okHits}</span>
            </div>

            {/* Miss */}
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xs font-bold w-16">Miss</span>
              <div className="flex-1 h-3 bg-purple-900/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalNotes > 0 ? (misses / totalNotes) * 100 : 0}%` }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-red-400 to-rose-300 rounded-full"
                />
              </div>
              <span className="text-red-300 text-xs font-bold w-8 text-right">{misses}</span>
            </div>
          </div>
        </motion.div>

        {/* Botón de continuar */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-400/40 transition-all"
        >
          Continuar 🎶
        </motion.button>
      </div>
    </motion.div>
  );
}
