/**
 * LEGENDS: PauseMenu Component
 * Menu de pausa con glassmorphism, inline SVG icons, y animaciones framer-motion
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { PauseMenuProps } from '@/types/ui';

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

const PauseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const PlayIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M6.5 3.5a1 1 0 0 1 1.5-.86l12 7a1 1 0 0 1 0 1.72l-12 7A1 1 0 0 1 6.5 17.5v-14z" />
  </svg>
);

const SaveIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const SettingsIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
  </svg>
);

const BackArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const InfoIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
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
/*  Menu item animation stagger                                        */
/* ------------------------------------------------------------------ */

const menuItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 * i, duration: 0.3, ease: 'easeOut' },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PauseMenu = ({
  isOpen,
  onContinue,
  onSave,
  onSettings,
  onMainMenu,
  isSaving = false,
}: PauseMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 backdrop-blur-sm"
            style={{ background: 'rgba(5,3,12,0.82)' }}
          />

          {/* Centered menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-0 z-80 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md backdrop-blur-md bg-white/[0.04] border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div
                className="border-b border-white/[0.06] p-6 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 100%)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full border border-purple-500/30"
                  style={{ background: 'rgba(124,58,237,0.15)' }}
                >
                  <PauseIcon className="text-purple-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-100 tracking-wider">PAUSA</h2>
                <p className="text-sm text-gray-500 mt-2">El juego esta pausado</p>
              </div>

              {/* Menu options */}
              <div className="p-6 space-y-3">

                {/* Continue */}
                <motion.button
                  custom={0}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={onContinue}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-white font-semibold text-sm tracking-wide transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: '0 0 24px rgba(124,58,237,0.35)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PlayIcon className="text-white shrink-0" />
                  Continuar
                </motion.button>

                {/* Save */}
                <motion.button
                  custom={1}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={onSave}
                  disabled={isSaving}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm tracking-wide border border-white/[0.06] backdrop-blur-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSaving ? <Spinner /> : <SaveIcon className="text-cyan-400 shrink-0" />}
                  <span className="text-gray-100">{isSaving ? 'Guardando...' : 'Guardar Partida'}</span>
                </motion.button>

                {/* Settings */}
                <motion.button
                  custom={2}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={onSettings}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm tracking-wide border border-white/[0.06] backdrop-blur-md transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SettingsIcon className="text-gray-400 shrink-0" />
                  <span className="text-gray-100">Configuracion</span>
                </motion.button>

                {/* Divider */}
                <div className="border-t border-white/[0.06] my-4" />

                {/* Exit to main menu */}
                <motion.button
                  custom={3}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={onMainMenu}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold text-sm tracking-wide border border-red-500/20 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.06) 100%)',
                  }}
                  whileHover={{ backgroundColor: 'rgba(239,68,68,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BackArrowIcon className="text-red-400 shrink-0" />
                  <span className="text-red-300">Salir al Menu Principal</span>
                </motion.button>
              </div>

              {/* Footer */}
              <div
                className="border-t border-white/[0.06] px-6 py-3"
                style={{ background: 'rgba(124,58,237,0.06)' }}
              >
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <InfoIcon className="text-gray-600" />
                  Recuerda guardar tu progreso antes de salir
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PauseMenu;
