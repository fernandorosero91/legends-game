/**
 * LEGENDS: LeaderboardScreen — Professional glassmorphism UI
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { LeaderboardScreenProps } from '@/types/ui';
import { CityBackground } from './CityBackground';

/* ─── SVG Icons ─── */
const IcoTrophy = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const IcoBack = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoGlobe = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IcoStar = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IcoCalendar = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IcoHeadphones = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);
const IcoMusic = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const IcoLoader = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ─── Medal component ─── */
const Medal = ({ rank }: { rank: number }) => {
  const colors: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' },
    2: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.35)', text: '#94a3b8' },
    3: { bg: 'rgba(180,83,9,0.15)', border: 'rgba(180,83,9,0.35)', text: '#b45309' },
  };
  const c = colors[rank];
  if (c) {
    return (
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black font-mono"
        style={{ background: c.bg, border: `2px solid ${c.border}`, color: c.text }}>
        {rank}
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold font-mono text-gray-500"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      #{rank}
    </div>
  );
};

const LeaderboardScreen = ({
  entries,
  isLoading = false,
  onBack,
  filter = 'all',
  onFilterChange,
}: LeaderboardScreenProps) => {
  const filters = [
    { id: 'all' as const, name: 'Todos', icon: <IcoGlobe /> },
    { id: 'winners' as const, name: 'Ganadores', icon: <IcoStar /> },
    { id: 'week' as const, name: 'Esta Semana', icon: <IcoCalendar /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60"
      >
        {/* Background */}
        <CityBackground />
        <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.82)', backdropFilter: 'blur(6px)' }} />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(20,10,45,0.7), rgba(10,6,22,0.8))',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-5 md:p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400"
                    style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)' }}>
                    <IcoTrophy />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black tracking-wider"
                      style={{ background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      TABLA DE LIDERES
                    </h2>
                    <p className="text-[11px] text-gray-500 tracking-wider">Los mejores artistas de Purple City</p>
                  </div>
                </div>
                <button onClick={onBack}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                  <IcoBack /> VOLVER
                </button>
              </div>

              {/* Filter tabs — AuthScreen style */}
              <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
                {filters.map((f) => (
                  <button key={f.id} onClick={() => onFilterChange?.(f.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
                      filter === f.id ? 'bg-cyan-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {f.icon}
                    <span className="hidden sm:inline">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-2.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="text-cyan-400/60 mb-4">
                    <IcoLoader />
                  </motion.div>
                  <p className="text-sm text-gray-500 tracking-wider">Cargando tabla de lideres...</p>
                </div>
              ) : entries.length > 0 ? (
                entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className="flex items-center gap-3 md:gap-4 p-3.5 rounded-xl border border-white/[0.06] transition-all hover:border-cyan-400/20"
                    style={{
                      background: entry.rank && entry.rank <= 3
                        ? 'rgba(245,158,11,0.04)'
                        : 'rgba(255,255,255,0.02)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {/* Medal */}
                    <Medal rank={entry.rank || index + 1} />

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-bold text-gray-100 truncate tracking-wide">
                          {entry.username}
                        </h3>
                        {entry.won && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
                            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                            <IcoStar /> GANADOR
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <IcoHeadphones />
                          <span className="font-mono tabular-nums font-bold">{entry.finalListeners.toLocaleString()}</span>
                          <span className="text-gray-600 text-xs">oyentes</span>
                        </span>
                        <span className="flex items-center gap-1 text-purple-400">
                          <IcoMusic />
                          <span className="font-mono tabular-nums font-bold">{entry.totalSongs}</span>
                          <span className="text-gray-600 text-xs">canciones</span>
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <IcoCalendar />
                          <span className="font-mono tabular-nums font-semibold">Dia {entry.finalDay}</span>
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-[11px] text-gray-600 font-mono tabular-nums">
                        {new Date(entry.completedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-600 mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <IcoTrophy />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">No hay entradas en la tabla</p>
                  <p className="text-xs text-gray-600 tracking-wider">Se el primero en completar el juego</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[11px] text-gray-600 font-mono tabular-nums tracking-wider">
                {entries.length > 0
                  ? `${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}`
                  : 'Sin entradas'}
              </p>
              <button onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <IcoBack /> VOLVER
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeaderboardScreen;
