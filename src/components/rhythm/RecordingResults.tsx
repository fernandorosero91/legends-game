/**
 * 🎮 LEGENDS: Recording Results — Pantalla de resultados ultra-profesional
 * Muestra calidad, oyentes ganados, estadísticas con animaciones
 */

import { motion } from 'framer-motion';
import { Howl } from 'howler';
import { useEffect, useRef } from 'react';
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

const QUALITY_CONFIG: Record<SongQuality, { label: string; emoji: string; color: string; bg: string; glow: string }> = {
  masterpiece: {
    label: 'OBRA MAESTRA',
    emoji: '💎',
    color: 'text-yellow-300',
    bg: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    glow: '0 0 80px rgba(245,158,11,0.3)',
  },
  high: {
    label: 'ALTA CALIDAD',
    emoji: '🔥',
    color: 'text-green-300',
    bg: 'from-green-500/20 via-emerald-500/10 to-transparent',
    glow: '0 0 60px rgba(34,197,94,0.2)',
  },
  medium: {
    label: 'CALIDAD MEDIA',
    emoji: '👍',
    color: 'text-blue-300',
    bg: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    glow: '0 0 40px rgba(59,130,246,0.2)',
  },
  low: {
    label: 'NECESITA TRABAJO',
    emoji: '💪',
    color: 'text-orange-300',
    bg: 'from-orange-500/20 via-red-500/10 to-transparent',
    glow: '0 0 40px rgba(239,68,68,0.15)',
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
  const sfxRef = useRef<Howl | null>(null);

  // Play result sound
  useEffect(() => {
    const src = quality === 'masterpiece' || quality === 'high' 
      ? '/audio/level-complete.mp3' 
      : '/audio/button.mp3';
    sfxRef.current = new Howl({ src: [src], volume: 0.4 });
    sfxRef.current.play();
    return () => { sfxRef.current?.stop(); };
  }, [quality]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-md mx-auto px-4"
    >
      <div
        className="relative rounded-3xl border border-white/10 p-7 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, rgba(15,5,30,0.97), rgba(5,0,15,0.98))', boxShadow: config.glow }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${config.bg} pointer-events-none`} />

        {/* Content */}
        <div className="relative">
          {/* Quality badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-5"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="text-5xl mb-2"
            >
              {config.emoji}
            </motion.div>
            <h2 className={`text-xl font-black ${config.color} tracking-wider`}>
              {config.label}
            </h2>
          </motion.div>

          {/* Song title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-5 py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/5"
          >
            <span className="text-white/30 text-[10px] font-medium uppercase tracking-widest">
              Nueva canción
            </span>
            <h3 className="text-white font-bold mt-0.5">
              🎵 "{songTitle}"
            </h3>
          </motion.div>

          {/* Main stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-2.5 mb-5"
          >
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Precisión</div>
              <div className={`text-xl font-black mt-0.5 ${
                rhythmScore >= 90 ? 'text-yellow-300' : rhythmScore >= 70 ? 'text-green-300' : rhythmScore >= 50 ? 'text-blue-300' : 'text-orange-300'
              }`}>
                {rhythmScore}%
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-cyan-500/10">
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider">Oyentes</div>
              <div className="text-xl font-black text-cyan-300 mt-0.5">
                +{listenersGenerated.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Max Combo</div>
              <div className="text-xl font-black text-orange-300 mt-0.5">
                {combo}x
              </div>
            </div>
          </motion.div>

          {/* Hit breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-1.5 mb-6"
          >
            {[
              { label: 'Perfect', count: perfectHits, color: '#fbbf24', bg: 'bg-yellow-400' },
              { label: 'Good', count: goodHits, color: '#34d399', bg: 'bg-green-400' },
              { label: 'OK', count: okHits, color: '#60a5fa', bg: 'bg-blue-400' },
              { label: 'Miss', count: misses, color: '#f87171', bg: 'bg-red-400' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold w-12 text-right" style={{ color: item.color }}>{item.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalNotes > 0 ? (item.count / totalNotes) * 100 : 0}%` }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.bg}`}
                    style={{ opacity: 0.8 }}
                  />
                </div>
                <span className="text-[10px] font-bold w-6 text-white/60">{item.count}</span>
              </div>
            ))}
          </motion.div>

          {/* Continue button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-400/30 transition-all text-sm"
          >
            Continuar →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
