/**
 * 🎮 LEGENDS: GameOverScreen Component
 * Pantalla de Game Over con estadísticas y opciones
 */

import { motion } from 'framer-motion';
import type { GameOverScreenProps } from '@/types/ui';
import { Button, Icon, Badge } from '@/components/atoms';

const GameOverScreen = ({ reason, stats, onRetry, onMainMenu }: GameOverScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-90 bg-gradient-to-b from-black via-red-950/30 to-black flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        className="w-full max-w-2xl"
      >
        {/* Título dramático */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <motion.h1
            animate={{
              textShadow: [
                '0 0 20px rgba(239, 68, 68, 0.5)',
                '0 0 40px rgba(239, 68, 68, 0.8)',
                '0 0 20px rgba(239, 68, 68, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl md:text-7xl font-bold text-red-500 tracking-tight mb-4"
          >
            GAME OVER
          </motion.h1>
          <p className="text-xl text-gray-300">{reason}</p>
        </motion.div>

        {/* Panel de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-md bg-white/5 border border-red-500/20 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
            📊 Estadísticas Finales
          </h2>

          {/* Grid de estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Días jugados */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-black/20 rounded-lg p-4 text-center border border-purple-500/10"
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="text-2xl font-bold text-purple-400 tabular-nums">
                {stats.daysPlayed}
              </div>
              <div className="text-xs text-gray-400 mt-1">Días jugados</div>
            </motion.div>

            {/* Oyentes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75 }}
              className="bg-black/20 rounded-lg p-4 text-center border border-purple-500/10"
            >
              <div className="text-3xl mb-2">🎧</div>
              <div className="text-2xl font-bold text-cyan-400 tabular-nums">
                {stats.finalListeners.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Oyentes</div>
            </motion.div>

            {/* Canciones */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-black/20 rounded-lg p-4 text-center border border-purple-500/10"
            >
              <div className="text-3xl mb-2">🎵</div>
              <div className="text-2xl font-bold text-purple-400 tabular-nums">
                {stats.totalSongs}
              </div>
              <div className="text-xs text-gray-400 mt-1">Canciones</div>
            </motion.div>

            {/* Dinero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 }}
              className="bg-black/20 rounded-lg p-4 text-center border border-purple-500/10"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-gold-500 tabular-nums">
                ${stats.totalMoney.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Dinero total</div>
            </motion.div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-purple-500/10"
            >
              <span className="text-sm text-gray-400">⭐ Reputación</span>
              <span className="text-sm font-bold text-purple-400 tabular-nums">
                {stats.finalReputation}%
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.95 }}
              className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-purple-500/10"
            >
              <span className="text-sm text-gray-400">💼 Trabajos</span>
              <span className="text-sm font-bold text-green-500 tabular-nums">
                {stats.jobsCompleted}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-purple-500/10"
            >
              <span className="text-sm text-gray-400">🛍️ Items</span>
              <span className="text-sm font-bold text-gold-500 tabular-nums">
                {stats.itemsPurchased}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mb-6"
        >
          <p className="text-gray-300 italic">
            "El fracaso es solo una oportunidad para empezar de nuevo con más inteligencia."
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onRetry}
            className="flex-1 justify-center"
          >
            <Icon name="play" size="md" />
            Intentar de Nuevo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onMainMenu}
            className="flex-1 justify-center"
          >
            <Icon name="arrow-left" size="md" />
            Menú Principal
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
