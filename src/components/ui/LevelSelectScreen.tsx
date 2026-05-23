/**
 * 🎮 LEGENDS: LevelSelectScreen Component
 * Menú de selección de niveles que aparece tras el tutorial.
 * Muestra los 4 niveles en tarjetas estilo "Tidy Up", conservando
 * la estética Purple City del juego (morado, dorado, glassmorphism).
 */

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { LEVELS } from '@/data/levels';

/* ------------------------------------------------------------------ */
/*  Iconos SVG inline (mismo estilo que VictoryScreen)                 */
/* ------------------------------------------------------------------ */

const StarIcon = ({ className = '', filled = true }: { className?: string; filled?: boolean }) => (
  <svg
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const LockIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MusicNoteIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const ArrowLeftIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Configuración: qué niveles mostrar en el menú                      */
/*  Se muestran todos los niveles (1-6).                               */
/* ------------------------------------------------------------------ */

const LEVEL_IDS_TO_SHOW = [1, 2, 3, 4, 5, 6];

// Color de acento por nivel
const LEVEL_ACCENTS: Record<number, { from: string; to: string; glow: string }> = {
  1: { from: '#34d399', to: '#10b981', glow: 'rgba(52,211,153,0.35)' },   // emerald
  2: { from: '#22d3ee', to: '#06b6d4', glow: 'rgba(34,211,238,0.35)' },  // cyan
  3: { from: '#a78bfa', to: '#7c3aed', glow: 'rgba(167,139,250,0.35)' }, // purple
  4: { from: '#fbbf24', to: '#d97706', glow: 'rgba(251,191,36,0.35)' },  // gold
  5: { from: '#f9a8d4', to: '#db2777', glow: 'rgba(249,168,212,0.35)' }, // pink
  6: { from: '#f43f5e', to: '#be123c', glow: 'rgba(244,63,94,0.35)' },   // red
};

export function LevelSelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const addNotification = useUIStore((s) => s.addNotification);
  const highestUnlockedLevel = useGameStore((s) => s.highestUnlockedLevel);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const levelStars = useGameStore((s) => s.levelStars);
  const startLevel = useGameStore((s) => s.startLevel);

  const levels = LEVELS.filter((l) => LEVEL_IDS_TO_SHOW.includes(l.id));

  // El nivel actual y el más alto desbloqueado determinan qué está disponible
  const effectiveUnlocked = Math.max(highestUnlockedLevel, currentLevel, 1);

  const handleSelectLevel = (levelId: number, unlocked: boolean) => {
    if (!unlocked) {
      addNotification('warning', '🔒 Completa el nivel anterior para desbloquear este.');
      return;
    }
    startLevel(levelId);
    setScreen('game');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{
      background: 'linear-gradient(160deg, #1a0a2e 0%, #2d1b4e 55%, #1a0a2e 100%)',
    }}>
      {/* Glow de fondo decorativo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 70%)' }} />

      <div className="relative z-10 min-h-full flex flex-col items-center px-5 py-8">

        {/* ===== HEADER ===== */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-2">
          <button
            onClick={() => setScreen('main_menu')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all"
          >
            <ArrowLeftIcon />
            <span className="text-sm font-bold">Menú</span>
          </button>
        </div>

        {/* ===== TÍTULO ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6 mt-2"
        >
          <div className="flex items-center gap-3 text-purple-300 mb-2">
            <MusicNoteIcon className="text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide"
              style={{ textShadow: '0 2px 20px rgba(124,58,237,0.6)' }}>
              Selecciona tu Nivel
            </h1>
          </div>
          <p className="text-purple-300/70 text-sm">Tu camino para convertirte en leyenda</p>
        </motion.div>

        {/* ===== CÓMO JUGAR ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-2xl mb-6 p-4 rounded-2xl border border-cyan-400/15 backdrop-blur-sm"
          style={{ background: 'rgba(34,211,238,0.04)' }}
        >
          <h3 className="text-cyan-300 text-sm font-bold mb-2 flex items-center gap-2">
            <span>💡</span> ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-white/70">
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <span className="text-lg">🎤</span>
              <span className="font-semibold text-white/90">Graba</span>
              <span className="text-white/40">Canciones al ritmo</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <span className="text-lg">💰</span>
              <span className="font-semibold text-white/90">Trabaja</span>
              <span className="text-white/40">Paga renta diaria</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <span className="text-lg">📈</span>
              <span className="font-semibold text-white/90">Crece</span>
              <span className="text-white/40">Gana oyentes</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-white/[0.03]">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-white/90">Meta</span>
              <span className="text-white/40">10,000 oyentes</span>
            </div>
          </div>
        </motion.div>

        {/* ===== GRID DE NIVELES ===== */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level, index) => {
            const unlocked = level.id <= effectiveUnlocked;
            const stars = levelStars[level.id] ?? 0;
            const accent = LEVEL_ACCENTS[level.id] ?? LEVEL_ACCENTS[2];
            const completed = stars > 0;

            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring', damping: 18 }}
                whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                onClick={() => handleSelectLevel(level.id, unlocked)}
                disabled={!unlocked}
                className="relative text-left rounded-3xl overflow-hidden transition-all group"
                style={{
                  background: unlocked
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.025)',
                  border: `1.5px solid ${unlocked ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}`,
                  backdropFilter: 'blur(12px)',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  boxShadow: unlocked ? `0 8px 32px ${accent.glow}` : 'none',
                }}
              >
                {/* Barra de color superior */}
                <div className="h-1.5 w-full" style={{
                  background: unlocked
                    ? `linear-gradient(90deg, ${accent.from}, ${accent.to})`
                    : 'rgba(255,255,255,0.08)',
                }} />

                <div className="p-5">
                  {/* Cabecera tarjeta: número + estado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Insignia número de nivel */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0"
                        style={{
                          background: unlocked
                            ? `linear-gradient(135deg, ${accent.from}, ${accent.to})`
                            : 'rgba(255,255,255,0.08)',
                          color: unlocked ? '#fff' : 'rgba(255,255,255,0.3)',
                          boxShadow: unlocked ? `0 4px 14px ${accent.glow}` : 'none',
                        }}
                      >
                        {unlocked ? level.id : <LockIcon className="text-white/30" />}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold"
                          style={{ color: unlocked ? accent.from : 'rgba(255,255,255,0.3)' }}>
                          Nivel {level.id}
                        </p>
                        <h3 className={`text-base font-extrabold leading-tight ${unlocked ? 'text-white' : 'text-white/30'}`}>
                          {level.name}
                        </h3>
                      </div>
                    </div>

                    {/* Botón play / candado */}
                    {unlocked && (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
                      >
                        <PlayIcon />
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className={`text-xs leading-relaxed mb-3 ${unlocked ? 'text-purple-200/70' : 'text-white/20'}`}>
                    {unlocked ? level.description : 'Completa el nivel anterior para desbloquear.'}
                  </p>

                  {/* Meta de oyentes */}
                  {unlocked && (
                    <div className="flex items-center gap-2 mb-3 text-[10px]">
                      <span className="text-cyan-400">🎧</span>
                      <span className="text-cyan-300/70 font-medium">
                        Meta: {level.listenerGoal[1].toLocaleString()} oyentes
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/40">
                        Días {level.days[0]}-{level.days[1]}
                      </span>
                    </div>
                  )}

                  {/* Estrellas */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        style={{
                          color: completed && s <= stars
                            ? '#fbbf24'
                            : unlocked
                            ? 'rgba(255,255,255,0.15)'
                            : 'rgba(255,255,255,0.07)',
                          filter: completed && s <= stars ? 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' : 'none',
                        }}
                      >
                        <StarIcon filled />
                      </span>
                    ))}
                    {completed && (
                      <span className="ml-1.5 text-[10px] font-bold text-gold-400 uppercase tracking-wide" style={{ color: '#fbbf24' }}>
                        Completado
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ===== PIE: progreso global ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-purple-300/60 text-xs"
        >
          <StarIcon className="text-gold-400" filled />
          <span>
            {(Object.values(levelStars) as number[]).reduce((a, b) => a + b, 0)} / {LEVEL_IDS_TO_SHOW.length * 3} estrellas conseguidas
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default LevelSelectScreen;