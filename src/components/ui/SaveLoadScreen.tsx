/**
 * LEGENDS: SaveLoadScreen — Professional glassmorphism UI
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSaveSlots } from '../../hooks/useInsForge';
import { CityBackground } from './CityBackground';

/* ─── SVG Icons ─── */
const IcoBack = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoSave = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const IcoPlay = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IcoTrash = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const IcoCalendar = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IcoLevel = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IcoHeadphones = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);
const IcoMoney = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IcoClock = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IcoLoader = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const SaveLoadScreen = () => {
  const { saves, loadGame, deleteSave } = useSaveSlots();
  const setScreen = useUIStore((s) => s.setScreen);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);

  const handleLoadGame = async (saveId: string) => {
    setIsLoading(true);
    try {
      const result = await loadGame(saveId);
      if (result.success) {
        setScreen('game');
      } else {
        console.error('Error loading game:', result.error);
      }
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    if (confirm('Estas seguro de que quieres eliminar esta partida?')) {
      const result = await deleteSave(saveId);
      if (!result.success) {
        console.error('Error deleting save:', result.error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <CityBackground />
      <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.82)', backdropFilter: 'blur(6px)' }} />

      <div className="relative z-10 flex items-center justify-center h-full p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  <IcoSave />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-wider"
                    style={{ background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    CARGAR PARTIDA
                  </h2>
                  <p className="text-[11px] text-gray-500 tracking-wider">Selecciona una partida guardada</p>
                </div>
              </div>
              <button onClick={() => setScreen('main_menu')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <IcoBack /> VOLVER
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5">
            <AnimatePresence mode="wait">
              {saves.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-gray-600 mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <IcoSave />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">No hay partidas guardadas</p>
                  <p className="text-xs text-gray-600 tracking-wider mb-6">Comienza una nueva partida desde el menu</p>
                  <button onClick={() => setScreen('main_menu')}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #0ea5c7, #0891b2)', boxShadow: '0 4px 16px rgba(14,165,199,0.25)' }}>
                    VOLVER AL MENU
                  </button>
                </motion.div>
              ) : (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-3">
                  {saves.map((save, index) => {
                    const isSelected = selectedSave === save.id;
                    return (
                      <motion.div
                        key={save.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onClick={() => setSelectedSave(save.id)}
                        className="group cursor-pointer rounded-xl border p-4 transition-all"
                        style={{
                          background: isSelected ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.02)',
                          borderColor: isSelected ? 'rgba(34,211,238,0.25)' : 'rgba(255,255,255,0.06)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Slot name */}
                            <h3 className="text-sm font-bold text-gray-100 tracking-wide mb-2">
                              {save.slotName}
                            </h3>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-sm">
                              <span className="flex items-center gap-1.5 text-purple-400">
                                <IcoCalendar />
                                <span className="text-gray-300 font-mono tabular-nums">Dia {save.gameData.currentDay}</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-cyan-400">
                                <IcoLevel />
                                <span className="text-gray-300 font-mono tabular-nums">Nivel {save.gameData.currentLevel}</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-emerald-400">
                                <IcoHeadphones />
                                <span className="text-gray-300 font-mono tabular-nums">{save.gameData.monthlyListeners.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-amber-400">
                                <IcoMoney />
                                <span className="text-gray-300 font-mono tabular-nums">${save.gameData.money.toLocaleString()}</span>
                              </span>
                            </div>

                            {/* Saved date */}
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-600">
                              <IcoClock />
                              <span className="font-mono tabular-nums">{formatDate(save.createdAt)}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLoadGame(save.id); }}
                              disabled={isLoading}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider text-white transition-all disabled:opacity-40"
                              style={{ background: 'linear-gradient(135deg, #0ea5c7, #0891b2)', boxShadow: '0 3px 12px rgba(14,165,199,0.25)' }}>
                              <IcoPlay />
                              {isLoading && selectedSave === save.id ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">
                                  <IcoLoader />
                                </motion.span>
                              ) : 'CARGAR'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSave(save.id); }}
                              className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:text-red-400 bg-white/[0.03] border border-white/[0.04] hover:border-red-400/20 hover:bg-red-400/[0.06] transition-all"
                              title="Eliminar partida">
                              <IcoTrash />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-[11px] text-gray-600 font-mono tabular-nums tracking-wider">
              {saves.length} {saves.length === 1 ? 'partida' : 'partidas'} guardadas
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setScreen('main_menu')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                CANCELAR
              </button>
              {selectedSave && (
                <button onClick={() => handleLoadGame(selectedSave)} disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #0ea5c7, #0891b2)', boxShadow: '0 3px 10px rgba(14,165,199,0.2)' }}>
                  <IcoPlay />
                  {isLoading ? 'CARGANDO...' : 'CARGAR SELECCIONADA'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SaveLoadScreen;
