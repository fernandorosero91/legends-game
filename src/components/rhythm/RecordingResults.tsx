/**
 * 🎮 LEGENDS: Recording Results — Pantalla celebratoria
 * "¡Grabaste un nuevo beat!" con oyentes ganados grande y claro
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

const QUALITY_CONFIG: Record<SongQuality, { label: string; emoji: string; color: string; message: string }> = {
  masterpiece: {
    label: 'OBRA MAESTRA',
    emoji: '💎',
    color: '#f59e0b',
    message: '¡Increíble! Has creado una obra maestra',
  },
  high: {
    label: 'ALTA CALIDAD',
    emoji: '🔥',
    color: '#10b981',
    message: '¡Excelente grabación! Tu talento brilla',
  },
  medium: {
    label: 'BUENA CANCIÓN',
    emoji: '👍',
    color: '#3b82f6',
    message: 'Buen trabajo, sigue mejorando',
  },
  low: {
    label: 'SIGUE PRACTICANDO',
    emoji: '💪',
    color: '#ef4444',
    message: 'No te rindas, la práctica hace al maestro',
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

  useEffect(() => {
    const src = quality === 'masterpiece' || quality === 'high' 
      ? '/audio/level-complete.mp3' 
      : '/audio/button.mp3';
    sfxRef.current = new Howl({ src: [src], volume: 0.5 });
    sfxRef.current.play();
    return () => { sfxRef.current?.stop(); };
  }, [quality]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-lg mx-auto px-4"
    >
      <div className="bg-gradient-to-b from-[#1e1e38]/95 to-[#141428]/95 rounded-2xl border border-purple-400/20 overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)]">
        
        {/* Hero section — big celebration */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 30%, ${config.color}25, transparent 70%)` }} />
          
          {/* Emoji + quality */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="text-6xl mb-3"
          >
            {config.emoji}
          </motion.div>

          {/* Main message */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-black text-white mb-1">🎤 ¡Grabaste un nuevo Beat!</h2>
            <p className="text-lg font-bold" style={{ color: config.color }}>{config.label}</p>
            <p className="text-purple-200/60 text-sm mt-1">{config.message}</p>
          </motion.div>

          {/* Song title */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]"
          >
            <span className="text-lg">🎵</span>
            <span className="text-white font-semibold">"{songTitle}"</span>
          </motion.div>
        </div>

        {/* BIG listeners gained */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5, type: 'spring' }}
          className="mx-6 mb-5 p-5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 text-center"
        >
          <p className="text-cyan-300/70 text-xs uppercase tracking-wider font-semibold mb-1">Nuevos oyentes ganados</p>
          <p className="text-5xl font-black text-cyan-300" style={{ textShadow: '0 0 20px rgba(34,211,238,0.4)' }}>
            +{listenersGenerated.toLocaleString()}
          </p>
          <p className="text-cyan-200/50 text-xs mt-1">🎧 personas escuchando tu música</p>
        </motion.div>

        {/* Stats grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className="px-6 pb-4"
        >
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-purple-200/50 uppercase tracking-wider">Precisión</div>
              <div className={`text-xl font-black mt-0.5 ${
                rhythmScore >= 90 ? 'text-amber-300' : rhythmScore >= 70 ? 'text-emerald-300' : rhythmScore >= 50 ? 'text-blue-300' : 'text-red-300'
              }`}>
                {rhythmScore}%
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-purple-200/50 uppercase tracking-wider">Combo Max</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{combo}x</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-purple-200/50 uppercase tracking-wider">Notas</div>
              <div className="text-xl font-black text-white mt-0.5">{totalNotes}</div>
            </div>
          </div>

          {/* Hit breakdown */}
          <div className="space-y-1.5">
            {[
              { label: 'Perfect', count: perfectHits, color: '#fbbf24', bg: 'bg-amber-400' },
              { label: 'Great', count: goodHits, color: '#34d399', bg: 'bg-emerald-400' },
              { label: 'OK', count: okHits, color: '#60a5fa', bg: 'bg-blue-400' },
              { label: 'Miss', count: misses, color: '#f87171', bg: 'bg-red-400' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] font-bold w-12 text-right" style={{ color: item.color }}>{item.label}</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalNotes > 0 ? (item.count / totalNotes) * 100 : 0}%` }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.bg}`}
                    style={{ opacity: 0.85 }}
                  />
                </div>
                <span className="text-[11px] font-mono w-6 text-white/50 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Continue button */}
        <div className="px-6 pb-6 pt-2">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] font-bold shadow-[0_4px_20px_rgba(34,211,238,0.3)] hover:from-cyan-300 hover:to-cyan-400 transition-all text-sm"
          >
            Continuar →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
