/**
 * 🎮 LEGENDS: Combo Meter
 * Muestra el combo actual y el máximo combo alcanzado
 */

import { motion, AnimatePresence } from 'framer-motion';

interface ComboMeterProps {
  combo: number;
  maxCombo: number;
}

export function ComboMeter({ combo, maxCombo }: ComboMeterProps) {
  const comboLevel = Math.floor(combo / 10);
  const isOnFire = combo >= 20;
  const isLegendary = combo >= 50;

  return (
    <div className="flex items-center gap-4">
      {/* Combo actual */}
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={combo}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              isLegendary
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                : isOnFire
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/50'
                : combo > 0
                ? 'bg-purple-800/40 border-purple-500/30'
                : 'bg-purple-900/30 border-purple-700/20'
            }`}
          >
            {/* Icono de fuego */}
            {isOnFire && (
              <motion.span
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-xl"
              >
                {isLegendary ? '💎' : '🔥'}
              </motion.span>
            )}

            <div className="flex flex-col items-center">
              <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">
                Combo
              </span>
              <span
                className={`text-2xl font-black ${
                  isLegendary
                    ? 'text-yellow-300'
                    : isOnFire
                    ? 'text-orange-300'
                    : combo > 0
                    ? 'text-white'
                    : 'text-purple-500'
                }`}
              >
                {combo}x
              </span>
            </div>

            {/* Multiplicador */}
            {comboLevel > 0 && (
              <div className="text-xs text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded-md">
                ×{(1 + comboLevel * 0.1).toFixed(1)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Partículas de combo alto */}
        {isOnFire && (
          <div className="absolute -inset-1 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-orange-400"
                animate={{
                  x: [0, Math.random() * 20 - 10],
                  y: [0, -20 - Math.random() * 10],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: i * 0.2,
                }}
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  bottom: '100%',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Max combo */}
      <div className="text-xs text-purple-500">
        <span className="block text-purple-600">Máx</span>
        <span className="font-bold text-purple-400">{maxCombo}</span>
      </div>
    </div>
  );
}
