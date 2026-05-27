/**
 * LEGENDS: GameOverScreen Component
 * Pantalla de Game Over con glassmorphism, inline SVG icons, y estadisticas
 */

import { motion } from 'framer-motion';
import type { GameOverScreenProps } from '@/types/ui';

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

const SkullIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="8" />
    <path d="M8 16v4h2l1-2h2l1 2h2v-4" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M10 14h4" />
  </svg>
);

const CalendarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const HeadphonesIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MusicNoteIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DollarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const StarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const BriefcaseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ShoppingBagIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChartIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M6.5 3.5a1 1 0 0 1 1.5-.86l12 7a1 1 0 0 1 0 1.72l-12 7A1 1 0 0 1 6.5 17.5v-14z" />
  </svg>
);

const BackArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Stat card helper                                                   */
/* ------------------------------------------------------------------ */

const statCardDelay = (base: number, i: number) => base + i * 0.06;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const GameOverScreen = ({ reason, stats, onRetry, onMainMenu }: GameOverScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-90 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, rgba(5,3,12,0.96) 0%, rgba(30,5,5,0.92) 50%, rgba(5,3,12,0.96) 100%)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 22 }}
        className="w-full max-w-2xl"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center mb-8"
        >
          {/* Skull badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 180 }}
            className="inline-flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full border border-red-500/30"
            style={{ background: 'rgba(239,68,68,0.12)' }}
          >
            <SkullIcon className="text-red-400" />
          </motion.div>

          <motion.h1
            animate={{
              textShadow: [
                '0 0 20px rgba(239,68,68,0.4)',
                '0 0 40px rgba(239,68,68,0.7)',
                '0 0 20px rgba(239,68,68,0.4)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-6xl md:text-7xl font-bold text-red-500 tracking-wider mb-3"
          >
            GAME OVER
          </motion.h1>
          <p className="text-sm text-gray-400">{reason}</p>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 mb-6"
        >
          <h2 className="flex items-center justify-center gap-2 text-lg font-bold text-gray-100 tracking-wider mb-6 text-center">
            <ChartIcon className="text-gray-500" />
            <span>ESTADISTICAS FINALES</span>
          </h2>

          {/* Primary stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {/* Days played */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statCardDelay(0.6, 0) }}
              className="backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <CalendarIcon className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {stats.daysPlayed}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Dias jugados</div>
            </motion.div>

            {/* Listeners */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statCardDelay(0.6, 1) }}
              className="backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <HeadphonesIcon className="text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {stats.finalListeners.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Oyentes</div>
            </motion.div>

            {/* Songs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statCardDelay(0.6, 2) }}
              className="backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <MusicNoteIcon className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {stats.totalSongs}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Canciones</div>
            </motion.div>

            {/* Money */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statCardDelay(0.6, 3) }}
              className="backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <DollarIcon className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-500 font-mono">
                ${stats.totalMoney.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Dinero total</div>
            </motion.div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.88 }}
              className="flex items-center justify-between backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <StarIcon className="text-purple-400" />
                Reputacion
              </span>
              <span className="text-sm font-bold text-purple-400 font-mono">
                {stats.finalReputation}%
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.94 }}
              className="flex items-center justify-between backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <BriefcaseIcon className="text-emerald-400" />
                Trabajos
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {stats.jobsCompleted}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-center justify-between backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <ShoppingBagIcon className="text-amber-400" />
                Items
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {stats.itemsPurchased}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Motivational quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mb-6"
        >
          <p className="text-sm text-gray-500 italic">
            "El fracaso es solo una oportunidad para empezar de nuevo con mas inteligencia."
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Retry — purple gradient */}
          <motion.button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-sm tracking-wide transition-transform"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: '0 0 28px rgba(124,58,237,0.35)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayIcon className="text-white" />
            Intentar de Nuevo
          </motion.button>

          {/* Main menu — ghost */}
          <motion.button
            onClick={onMainMenu}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm tracking-wide text-gray-300 border border-white/[0.06] backdrop-blur-md transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
          >
            <BackArrowIcon className="text-gray-400" />
            Menu Principal
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
