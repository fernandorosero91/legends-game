/**
 * 🎮 LEGENDS: Recording Results — Pantalla de resultados estilo DAW
 * Diseño limpio, profesional, colores basados en la calidad obtenida
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

const QUALITY_CONFIG: Record<SongQuality, { label: string; emoji: string; color: string; textColor: string; borderColor: string }> = {
  masterpiece: {
    label: 'OBRA MAESTRA',
    emoji: '💎',
    color: '#f59e0b',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
  },
  high: {
    label: 'ALTA CALIDAD',
    emoji: '🔥',
    color: '#10b981',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
  },
  medium: {
    label: 'CALIDAD MEDIA',
    emoji: '👍',
    color: '#3b82f6',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/30',
  },
  low: {
    label: 'NECESITA TRABAJO',
    emoji: '💪',
    color: '#ef4444',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/30',
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
    sfxRef.current = new Howl({ src: [src], volume: 0.4 });
    sfxRef.current.play();
    return () => { sfxRef.current?.stop(); };
  }, [quality]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative z-10 w-full max-w-md mx-auto px-4"
    >
      <div className={`bg-[#1a1a28]/85 backdrop-blur-md rounded-2xl border ${config.borderColor} overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]`}>
        
        {/* Header con badge de calidad */}
        <div className="relative px-6 pt-7 pb-5 text-center border-b border-white/[0.06]">
          {/* Glow sutil detrás del emoji */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 40%, ${config.color}, transparent 70%)` }}
          />
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="text-5xl mb-2 relative"
          >
            {config.emoji}
          </motion.div>
          <h2 className={`text-lg font-black ${config.textColor} tracking-widest`}>
            {config.label}
          </h2>
          <p className="text-purple-200/50 text-xs mt-1 font-mono">Sesión completada</p>
        </div>

        {/* Nombre de la canción */}
        <div className="px-6 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 py-2 px-3.5 rounded-lg bg-purple-500/10 border border-purple-400/15">
            <span className="text-lg">🎵</span>
            <div>
              <span className="text-purple-200/60 text-[10px] uppercase tracking-wider font-mono">Track</span>
              <h3 className="text-white font-semibold text-sm -mt-0.5">"{songTitle}"</h3>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Precisión</div>
              <div className={`text-2xl font-black mt-0.5 ${
                rhythmScore >= 90 ? 'text-amber-300' : rhythmScore >= 70 ? 'text-emerald-300' : rhythmScore >= 50 ? 'text-blue-300' : 'text-red-300'
              }`}>
                {rhythmScore}%
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-cyan-500/10">
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider font-mono">Oyentes</div>
              <div className="text-2xl font-black text-cyan-300 mt-0.5">
                +{listenersGenerated.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Combo</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">
                {combo}x
              </div>
            </div>
          </div>
        </div>

        {/* Desglose de hits */}
        <div className="px-6 pb-4">
          <div className="space-y-2">
            {[
              { label: 'Perfect', count: perfectHits, color: '#fbbf24', bg: 'bg-amber-400' },
              { label: 'Good', count: goodHits, color: '#34d399', bg: 'bg-emerald-400' },
              { label: 'OK', count: okHits, color: '#60a5fa', bg: 'bg-blue-400' },
              { label: 'Miss', count: misses, color: '#f87171', bg: 'bg-red-400' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold w-12 text-right" style={{ color: item.color }}>
                  {item.label}
                </span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalNotes > 0 ? (item.count / totalNotes) * 100 : 0}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.bg}`}
                    style={{ opacity: 0.85 }}
                  />
                </div>
                <span className="text-[11px] font-mono w-7 text-white/50 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón continuar */}
        <div className="px-6 pb-6 pt-2">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-400/30 transition-all text-sm"
          >
            Continuar →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
