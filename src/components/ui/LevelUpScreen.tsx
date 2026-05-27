/**
 * LEGENDS: LevelUpScreen — Pantalla épica de subida de nivel
 * Se muestra cuando el jugador sube de nivel. Incluye:
 * - Animación de letrero grande
 * - Ondas musicales animadas
 * - Sonido winner-game.mp3
 * - Información del nuevo nivel
 * - Sirve como "loading screen" mientras la nueva escena carga en background
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelUpMessage } from '../../data/levels';

interface LevelUpScreenProps {
  level: number;
  levelName: string;
  onComplete: () => void;
}

export function LevelUpScreen({ level, levelName, onComplete }: LevelUpScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Play winner sound
    try {
      const audio = new Audio('/audio/winner-game.mp3');
      audio.volume = 0.7;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {}

    // Phase transitions
    const t1 = setTimeout(() => setPhase('showing'), 400);
    const t2 = setTimeout(() => setPhase('exiting'), 4500);
    const t3 = setTimeout(() => onComplete(), 5200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onComplete]);

  const message = getLevelUpMessage(level);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0326 0%, #1a0a3e 30%, #0d1b3e 60%, #0f0326 100%)' }}
    >
      {/* Ondas musicales de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos de onda expandiéndose */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `rgba(124,58,237,${0.4 - i * 0.06})` }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 600 + i * 200, height: 600 + i * 200, opacity: 0 }}
            transition={{ duration: 3, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Barras de ecualizador */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-32 px-8 opacity-40">
          {[...Array(32)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 max-w-3 rounded-t-sm"
              style={{
                background: `linear-gradient(to top, #7c3aed, #22d3ee)`,
              }}
              animate={{
                height: [
                  `${20 + Math.random() * 60}%`,
                  `${10 + Math.random() * 80}%`,
                  `${20 + Math.random() * 60}%`,
                ],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.03,
              }}
            />
          ))}
        </div>

        {/* Partículas de notas musicales */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`note-${i}`}
            className="absolute text-2xl select-none"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
              color: '#a78bfa',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 0.7, 0], y: -40, x: Math.random() * 40 - 20 }}
            transition={{ duration: 2, delay: 0.5 + i * 0.3, repeat: Infinity }}
          >
            {['♪', '♫', '♬', '🎵', '🎶'][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-6">
        {/* Número de nivel grande */}
        <motion.div
          initial={{ scale: 0, rotateZ: -10 }}
          animate={{ scale: 1, rotateZ: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-4"
        >
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-purple-400 shadow-[0_0_40px_rgba(124,58,237,0.5),0_0_80px_rgba(124,58,237,0.2)]"
            style={{ background: 'linear-gradient(145deg, #7c3aed, #4f46e5)' }}
          >
            <span className="text-5xl font-black text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {level}
            </span>
          </div>
        </motion.div>

        {/* Texto "SUBISTE DE NIVEL" */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-4xl md:text-5xl font-black text-transparent bg-clip-text uppercase tracking-wider"
          style={{
            backgroundImage: 'linear-gradient(135deg, #c4b5fd, #22d3ee, #a78bfa)',
            textShadow: '0 0 30px rgba(167,139,250,0.5)',
          }}
        >
          ¡Subiste de Nivel!
        </motion.h1>

        {/* Nombre del nivel */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-3 text-xl font-bold text-purple-200"
        >
          {levelName}
        </motion.p>

        {/* Mensaje descriptivo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-sm text-purple-300/80 max-w-md mx-auto leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Barra de progreso (simula carga) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 w-64 mx-auto"
        >
          <div className="h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3.5, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-[10px] text-purple-400/60 mt-1.5 uppercase tracking-widest">
            Preparando nuevo escenario...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
