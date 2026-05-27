/**
 * LEGENDS: VictoryScreen Component
 * Pantalla de victoria con confetti CSS, glassmorphism, inline SVG icons, y estadisticas
 */

import { motion } from 'framer-motion';
import type { VictoryScreenProps } from '@/types/ui';

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

const TrophyIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const StarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HeadphonesIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MusicNoteIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DollarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CalendarIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
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

const UsersIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChartIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BackArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */

const Spinner = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Confetti particles (CSS-driven, no emojis)                         */
/* ------------------------------------------------------------------ */

const CONFETTI_COLORS = ['#22d3ee', '#7c3aed', '#f59e0b', '#34d399', '#ef4444', '#a78bfa', '#fbbf24'];

const confettiParticles = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2.5,
  duration: 3 + Math.random() * 2.5,
  size: 4 + Math.random() * 6,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  rotation: Math.random() * 360,
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statDelay = (base: number, i: number) => base + i * 0.06;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const VictoryScreen = ({
  stats,
  onSaveToLeaderboard,
  onMainMenu,
  isSaving = false,
}: VictoryScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-90 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(5,3,12,0.94) 0%, rgba(40,20,8,0.88) 50%, rgba(5,3,12,0.94) 100%)',
      }}
    >
      {/* Confetti — CSS rectangles */}
      {confettiParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, x: `${p.x}vw`, opacity: 1, rotate: p.rotation }}
          animate={{ y: '110vh', rotate: p.rotation + 360, opacity: [1, 1, 0] }}
          transition={{ delay: p.delay, duration: p.duration, ease: 'linear', repeat: Infinity }}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: 0,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.85, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', damping: 22 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center mb-8"
        >
          {/* Trophy badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
            className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-4 rounded-full border border-amber-500/30"
            style={{ background: 'rgba(245,158,11,0.12)' }}
          >
            <TrophyIcon className="text-amber-400" />
          </motion.div>

          <motion.div
            animate={{
              textShadow: [
                '0 0 20px rgba(245,158,11,0.4)',
                '0 0 48px rgba(245,158,11,0.7)',
                '0 0 20px rgba(245,158,11,0.4)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-7xl md:text-8xl font-bold tracking-wider mb-3"
            style={{ color: '#f59e0b' }}
          >
            LEYENDA
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-2 text-lg text-gray-100 font-bold tracking-wide"
          >
            <TrophyIcon className="text-amber-400 w-5 h-5" />
            Has alcanzado 10,000 oyentes
            <TrophyIcon className="text-amber-400 w-5 h-5" />
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-purple-300 mt-2 tracking-wide"
          >
            Bienvenido al Estudio Profesional
          </motion.p>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="backdrop-blur-md bg-white/[0.04] border border-amber-500/20 rounded-2xl p-6 mb-6"
        >
          <h2 className="flex items-center justify-center gap-2 text-lg font-bold text-gray-100 tracking-wider mb-6 text-center">
            <ChartIcon className="text-amber-400" />
            <span>TU RECORRIDO COMPLETO</span>
          </h2>

          {/* Primary stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {/* Listeners */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statDelay(1.0, 0) }}
              className="backdrop-blur-md bg-white/[0.04] border border-cyan-500/20 rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <HeadphonesIcon className="text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-cyan-400 font-mono">
                {stats.finalListeners.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Oyentes Finales</div>
            </motion.div>

            {/* Songs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statDelay(1.0, 1) }}
              className="backdrop-blur-md bg-white/[0.04] border border-purple-500/20 rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <MusicNoteIcon className="text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400 font-mono">
                {stats.totalSongs}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Canciones</div>
            </motion.div>

            {/* Money */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statDelay(1.0, 2) }}
              className="backdrop-blur-md bg-white/[0.04] border border-amber-500/20 rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <DollarIcon className="text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-amber-500 font-mono">
                ${stats.totalMoney.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Dinero Total</div>
            </motion.div>

            {/* Days */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: statDelay(1.0, 3) }}
              className="backdrop-blur-md bg-white/[0.04] border border-emerald-500/20 rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <CalendarIcon className="text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 font-mono">
                {stats.daysPlayed}
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-wide">Dias Jugados</div>
            </motion.div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.28 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.34 }}
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
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

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.46 }}
              className="flex items-center justify-between backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <UsersIcon className="text-cyan-400" />
                Colaboraciones
              </span>
              <span className="text-sm font-bold text-cyan-400 font-mono">
                {stats.collaborations}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="backdrop-blur-md bg-white/[0.03] border border-purple-500/10 rounded-xl p-6 mb-6 text-center"
        >
          <p className="text-base text-gray-200 italic mb-2">
            "Si algo vale la pena, vale la pena la lucha."
          </p>
          <p className="text-sm text-purple-400 font-semibold">— DJ Sonic</p>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Has demostrado que con perseverancia y talento, los suenos se hacen realidad.
            <br />
            Que sigue? El mundo esta esperando tu proximo hit.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Save to leaderboard — gold gradient */}
          <motion.button
            onClick={onSaveToLeaderboard}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-sm tracking-wide transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 0 28px rgba(245,158,11,0.35)',
            }}
            whileHover={isSaving ? {} : { scale: 1.02 }}
            whileTap={isSaving ? {} : { scale: 0.98 }}
          >
            {isSaving ? <Spinner /> : <CheckIcon className="text-white" />}
            {isSaving ? 'Guardando...' : 'Guardar en Tabla de Lideres'}
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

export default VictoryScreen;
