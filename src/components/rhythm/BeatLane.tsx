/**
 * 🎮 LEGENDS: Beat Lane
 * Un carril individual del minijuego rítmico
 * Las notas caen de arriba hacia abajo
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { Note as NoteType } from '../../systems/rhythmSystem';

interface BeatLaneProps {
  laneIndex: number;
  label: string;
  color: string;
  notes: NoteType[];
  currentTime: number;
  isHit?: boolean;
  hitAccuracy?: string;
}

// Ventana visible: las notas aparecen 3 segundos antes de llegar a la zona de hit
const VISIBLE_WINDOW = 3000;

export function BeatLane({
  laneIndex,
  label,
  color,
  notes,
  currentTime,
  isHit,
  hitAccuracy,
}: BeatLaneProps) {
  return (
    <div className="relative flex-1 max-w-28 flex flex-col items-center">
      {/* Carril — fondo con gradiente */}
      <div
        className="relative w-full flex-1 rounded-2xl overflow-hidden border border-white/5"
        style={{
          background: `linear-gradient(to bottom, ${color}08, ${color}03, ${color}15)`,
        }}
      >
        {/* Líneas guía decorativas */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
          {[20, 40, 60, 80].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 h-px bg-white/10"
              style={{ top: `${pct}%` }}
            />
          ))}
        </div>

        {/* Zona de hit (parte inferior) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 border-t-2 transition-all duration-100"
          style={{
            borderColor: isHit ? color : `${color}40`,
            background: isHit
              ? `linear-gradient(to top, ${color}30, transparent)`
              : `linear-gradient(to top, ${color}10, transparent)`,
            boxShadow: isHit ? `0 0 30px ${color}40` : 'none',
          }}
        >
          {/* Efecto de pulso al golpear */}
          <AnimatePresence>
            {isHit && (
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${color}60, transparent)` }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Notas cayendo */}
        <AnimatePresence>
          {notes.map((note) => {
            // Calcular posición Y basada en el tiempo restante
            const timeUntilHit = note.time - currentTime;
            const progress = 1 - timeUntilHit / VISIBLE_WINDOW; // 0 = arriba, 1 = zona de hit
            const topPercent = progress * 85; // 85% para dejar espacio a la zona de hit

            if (topPercent < -10 || topPercent > 100) return null;

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
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
          })}
        </AnimatePresence>

        {/* Feedback de accuracy */}
        <AnimatePresence>
          {isHit && hitAccuracy && (
            <motion.div
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.5, y: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <span
                className={`text-sm font-black ${
                  hitAccuracy === 'perfect'
                    ? 'text-yellow-300'
                    : hitAccuracy === 'good'
                    ? 'text-green-400'
                    : hitAccuracy === 'ok'
                    ? 'text-blue-400'
                    : 'text-red-400'
                }`}
              >
                {hitAccuracy === 'perfect' && '★'}
                {hitAccuracy === 'good' && '●'}
                {hitAccuracy === 'ok' && '○'}
                {hitAccuracy === 'miss' && '✕'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
