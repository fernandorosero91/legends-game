/**
 * LEGENDS: SceneTransition — Pantalla de carga premium entre escenas
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const LOCATION_NAMES: Record<string, string> = {
  apartment: 'Tu Apartamento',
  store: 'Purple Market',
  restaurant: 'Restaurante La Esquina',
  cafe: 'Café Purple Beans',
  shop: 'Purple Sound Shop',
  bar: 'Bar Neon Nights',
  academy: 'Academia SoundWave',
  delivery: 'Delivery Express',
  city: 'Purple City',
};

const LOCATION_EMOJIS: Record<string, string> = {
  apartment: '🏠',
  store: '🛒',
  restaurant: '🍽️',
  cafe: '☕',
  shop: '🎵',
  bar: '🎧',
  academy: '🎓',
  delivery: '🚚',
  city: '🌆',
};

const LOCATION_TIPS: Record<string, string> = {
  apartment: 'Descansa, graba canciones y planifica tu día',
  store: 'Trabaja como cajero para ganar dinero extra',
  restaurant: 'Atiende clientes como mesero',
  cafe: 'Un café siempre ayuda a empezar el día',
  shop: 'Compra equipo para mejorar tus grabaciones',
  bar: 'La música en vivo te da reputación',
  academy: 'Aprende nuevas técnicas musicales',
  delivery: 'Entregas rápidas, dinero rápido',
  city: 'Explora Purple City y encuentra oportunidades',
};

export function SceneTransition() {
  const currentScene = useGameStore((s) => s.currentScene);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const [showing, setShowing] = useState(false);
  const [targetScene, setTargetScene] = useState('');
  const prevScene = useRef(currentScene);
  const prevLevel = useRef(currentLevel);

  // Detectar cambio de escena
  useEffect(() => {
    if (prevScene.current !== currentScene) {
      setTargetScene(currentScene);
      setShowing(true);
      prevScene.current = currentScene;
      const timer = setTimeout(() => setShowing(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  // Detectar cambio de nivel (carga nueva habitación)
  useEffect(() => {
    if (prevLevel.current !== currentLevel && gamePhase === 'playing') {
      setTargetScene('apartment');
      setShowing(true);
      prevLevel.current = currentLevel;
      const timer = setTimeout(() => setShowing(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, gamePhase]);

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f0520 0%, #1a0a3e 30%, #0d1b3d 60%, #0a0f1f 100%)' }}
        >
          {/* Orbes de luz decorativos */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 60%)' }} />
            <div className="absolute bottom-[-15%] left-[-5%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 60%)' }} />
            <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 60%)' }} />
          </div>

          {/* Contenido central */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Círculo con emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))',
                border: '2px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 40px rgba(124,58,237,0.3), inset 0 0 20px rgba(34,211,238,0.1)',
              }}
            >
              <span className="text-5xl">{LOCATION_EMOJIS[targetScene] || '🗺️'}</span>
            </motion.div>

            {/* Texto "Viajando a..." */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-purple-300/60 text-xs font-medium uppercase tracking-[0.3em] mb-2"
            >
              Viajando a
            </motion.p>

            {/* Nombre del lugar */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', damping: 20 }}
              className="text-3xl font-black text-white mb-3 tracking-wide"
              style={{ textShadow: '0 0 20px rgba(124,58,237,0.5)' }}
            >
              {LOCATION_NAMES[targetScene] || 'Cargando...'}
            </motion.h2>

            {/* Tip del lugar */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm max-w-xs text-center leading-relaxed"
            >
              {LOCATION_TIPS[targetScene] || ''}
            </motion.p>

            {/* Barra de progreso */}
            <div className="mt-8 w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #22d3ee, #fbbf24)' }}
              />
            </div>

            {/* Puntos animados */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-6 text-[10px] text-white/20 font-mono tracking-wider"
          >
            LEGENDS · Purple City, 2015
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
