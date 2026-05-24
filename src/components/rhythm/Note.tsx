/**
 * 🎮 LEGENDS: Note Component
 * Nota individual que cae por el carril
 * (Integrado directamente en BeatLane — este archivo se mantiene por compatibilidad)
 */

import { motion } from 'framer-motion';

interface NoteProps {
  color: string;
  topPercent: number;
  isHit?: boolean;
}

export function Note({ color, topPercent, isHit }: NoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isHit ? 0 : 1, scale: isHit ? 1.5 : 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute left-1/2 -translate-x-1/2 w-14 h-6 rounded-lg flex items-center justify-center"
      style={{
        top: `${topPercent}%`,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 0 12px ${color}60, 0 2px 8px rgba(0,0,0,0.3)`,
        border: `1px solid ${color}`,
      }}
    >
      <div
        className="w-3 h-3 rounded-full bg-white/80"
        style={{ boxShadow: `0 0 6px ${color}` }}
      />
    </motion.div>
  );
}
