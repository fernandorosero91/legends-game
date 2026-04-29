/**
 * 🎮 LEGENDS: VictoryScreen Component
 * Pantalla de victoria con confetti, estadísticas completas y celebración
 */

import { motion } from 'framer-motion';
import type { VictoryScreenProps } from '@/types/ui';
import { Button, Icon, Badge } from '@/components/atoms';

const VictoryScreen = ({
  stats,
  onSaveToLeaderboard,
  onMainMenu,
  isSaving = false,
}: VictoryScreenProps) => {
  // Partículas de confetti (simplificadas con emojis)
  const confettiEmojis = ['🎉', '🎊', '⭐', '✨', '🏆', '👑', '💎', '🎵', '🎤', '🔥'];
  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-90 bg-gradient-to-b from-purple-900 via-purple-800 to-yellow-900 flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Confetti animado */}
      {confettiParticles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -100, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            rotate: 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="absolute text-2xl pointer-events-none"
          style={{ left: 0 }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Título épico */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 20px rgba(251, 191, 36, 0.5)',
                '0 0 40px rgba(251, 191, 36, 0.8)',
                '0 0 20px rgba(251, 191, 36, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl md:text-8xl font-bold text-gold-500 tracking-tight mb-4"
          >
            ¡LEYENDA!
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-gray-100 font-bold"
          >
            🏆 ¡Has alcanzado 10,000 oyentes! 🏆
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-purple-300 mt-2"
          >
            Bienvenido al Estudio Profesional
          </motion.p>
        </motion.div>

        {/* Panel de estadísticas completas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="backdrop-blur-md bg-white/10 border border-gold-500/30 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center flex items-center justify-center gap-2">
            <span>📊</span>
            <span>Tu Recorrido Completo</span>
            <span>📊</span>
          </h2>

          {/* Grid principal de estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Oyentes finales */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-lg p-4 text-center border border-cyan-500/30"
            >
              <div className="text-3xl mb-2">🎧</div>
              <div className="text-3xl font-bold text-cyan-400 tabular-nums">
                {stats.finalListeners.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 mt-1 font-semibold">Oyentes Finales</div>
            </motion.div>

            {/* Canciones grabadas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.15 }}
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 text-center border border-purple-500/30"
            >
              <div className="text-3xl mb-2">🎵</div>
              <div className="text-3xl font-bold text-purple-400 tabular-nums">
                {stats.totalSongs}
              </div>
              <div className="text-xs text-gray-300 mt-1 font-semibold">Canciones</div>
            </motion.div>

            {/* Dinero acumulado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-lg p-4 text-center border border-gold-500/30"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="text-3xl font-bold text-gold-500 tabular-nums">
                ${stats.totalMoney.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 mt-1 font-semibold">Dinero Total</div>
            </motion.div>

            {/* Días jugados */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.25 }}
              className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 text-center border border-green-500/30"
            >
              <div className="text-3xl mb-2">📅</div>
              <div className="text-3xl font-bold text-green-400 tabular-nums">
                {stats.daysPlayed}
              </div>
              <div className="text-xs text-gray-300 mt-1 font-semibold">Días Jugados</div>
            </motion.div>
          </div>

          {/* Estadísticas secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <span className="text-sm text-gray-300">⭐ Reputación</span>
              <span className="text-sm font-bold text-purple-400 tabular-nums">
                {stats.finalReputation}%
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <span className="text-sm text-gray-300">💼 Trabajos</span>
              <span className="text-sm font-bold text-green-400 tabular-nums">
                {stats.jobsCompleted}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <span className="text-sm text-gray-300">🛍️ Items</span>
              <span className="text-sm font-bold text-gold-400 tabular-nums">
                {stats.itemsPurchased}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.45 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-purple-500/20"
            >
              <span className="text-sm text-gray-300">🤝 Colaboraciones</span>
              <span className="text-sm font-bold text-cyan-400 tabular-nums">
                {stats.collaborations}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Mensaje final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-xl p-6 mb-6 text-center"
        >
          <p className="text-lg text-gray-100 italic mb-2">
            "Si algo vale la pena, vale la pena la lucha."
          </p>
          <p className="text-sm text-purple-300">— DJ Sonic</p>
          <p className="text-sm text-gray-400 mt-4">
            Has demostrado que con perseverancia y talento, los sueños se hacen realidad.
            <br />
            ¿Qué sigue? El mundo está esperando tu próximo hit.
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onSaveToLeaderboard}
            disabled={isSaving}
            loading={isSaving}
            className="flex-1 justify-center bg-gradient-to-r from-gold-500 to-yellow-600 hover:from-gold-400 hover:to-yellow-500"
          >
            <Icon name="check" size="md" />
            {isSaving ? 'Guardando...' : 'Guardar en Tabla de Líderes'}
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

export default VictoryScreen;
