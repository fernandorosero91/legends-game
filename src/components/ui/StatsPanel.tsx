/**
 * 🎮 LEGENDS: StatsPanel Component
 * Panel lateral de estadísticas con canciones, trabajos y progreso
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StatsPanelProps } from '@/types/ui';
import { Button, Icon, Badge, ProgressBar } from '@/components/atoms';

const StatsPanel = ({
  isOpen,
  onClose,
  songs,
  jobHistory,
  levelProgress,
  globalStats,
}: StatsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'songs' | 'jobs' | 'progress' | 'global'>('progress');

  // Obtener badge de calidad
  const getQualityBadge = (quality: string) => {
    const badges: Record<string, { variant: 'gold' | 'green' | 'purple' | 'red'; text: string }> =
      {
        masterpiece: { variant: 'gold', text: '🌟 Obra Maestra' },
        high: { variant: 'green', text: '✨ Alta' },
        medium: { variant: 'purple', text: '👍 Media' },
        low: { variant: 'red', text: '👎 Baja' },
      };
    return badges[quality.toLowerCase()] || { variant: 'purple', text: quality };
  };

  // Tabs de secciones
  const tabs = [
    { id: 'progress' as const, name: 'Progreso', icon: '📊' },
    { id: 'songs' as const, name: 'Canciones', icon: '🎵' },
    { id: 'jobs' as const, name: 'Trabajos', icon: '💼' },
    { id: 'global' as const, name: 'Global', icon: '🌍' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel lateral derecho */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-70 w-80 backdrop-blur-md bg-black/90 border-l border-purple-500/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-500/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-100 tracking-tight">
                  📈 Estadísticas
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Icon name="close" size="md" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-4 gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-base">{tab.icon}</div>
                    <div className="mt-1 text-[10px]">{tab.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {/* Tab: Progreso del Nivel */}
                {activeTab === 'progress' && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Nivel actual */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <h3 className="text-sm font-bold text-purple-400 mb-3">
                        Nivel {levelProgress.currentLevel}
                      </h3>

                      {/* Progreso de oyentes */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Oyentes</span>
                          <span className="text-cyan-400 font-bold tabular-nums">
                            {levelProgress.currentListeners.toLocaleString()} /{' '}
                            {levelProgress.goalListeners.toLocaleString()}
                          </span>
                        </div>
                        <ProgressBar
                          value={levelProgress.progressPercentage}
                          max={100}
                          color="cyan"
                          animated
                        />
                      </div>

                      {/* Porcentaje */}
                      <div className="text-center">
                        <span className="text-2xl font-bold text-cyan-400 tabular-nums">
                          {levelProgress.progressPercentage}%
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Progreso del nivel</p>
                      </div>
                    </div>

                    {/* Mensaje motivacional */}
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-xs text-gray-300 text-center italic">
                        {levelProgress.progressPercentage < 25
                          ? '🚀 ¡Apenas comenzando! Sigue grabando.'
                          : levelProgress.progressPercentage < 50
                          ? '💪 Buen progreso. Mantén el ritmo.'
                          : levelProgress.progressPercentage < 75
                          ? '🔥 ¡Vas muy bien! Ya casi llegas.'
                          : levelProgress.progressPercentage < 100
                          ? '⭐ ¡Casi lo logras! Un último esfuerzo.'
                          : '🎉 ¡Nivel completado! Sigue adelante.'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Canciones */}
                {activeTab === 'songs' && (
                  <motion.div
                    key="songs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    {songs.length > 0 ? (
                      songs.map((song, index) => {
                        const qualityBadge = getQualityBadge(song.quality);
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-bold text-gray-100 truncate flex-1">
                                {song.title}
                              </h4>
                              <Badge variant={qualityBadge.variant} className="flex-shrink-0">
                                {qualityBadge.text}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-cyan-400">🎧</span>
                                <span className="text-cyan-400 font-bold tabular-nums">
                                  {song.listeners.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-gray-500">Día {song.dayRecorded}</span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-3">🎵</div>
                        <p className="text-sm text-gray-400">No has grabado canciones aún</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab: Trabajos */}
                {activeTab === 'jobs' && (
                  <motion.div
                    key="jobs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    {jobHistory.length > 0 ? (
                      jobHistory.map((job, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-100 truncate">
                              {job.jobName}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Icon name="money" size="xs" className="text-gold-500" />
                              <span className="text-gold-500 font-bold text-xs tabular-nums">
                                ${job.moneyEarned.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Día {job.dayCompleted}</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-3">💼</div>
                        <p className="text-sm text-gray-400">No has completado trabajos aún</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab: Estadísticas Globales */}
                {activeTab === 'global' && (
                  <motion.div
                    key="global"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    {/* Días jugados */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          <span className="text-sm text-gray-400">Días jugados</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-400 tabular-nums">
                          {globalStats.daysPlayed}
                        </span>
                      </div>
                    </div>

                    {/* Canciones totales */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎵</span>
                          <span className="text-sm text-gray-400">Canciones</span>
                        </div>
                        <span className="text-2xl font-bold text-purple-400 tabular-nums">
                          {globalStats.totalSongs}
                        </span>
                      </div>
                    </div>

                    {/* Dinero total */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          <span className="text-sm text-gray-400">Dinero total</span>
                        </div>
                        <span className="text-xl font-bold text-gold-500 tabular-nums">
                          ${globalStats.totalMoney.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Trabajos completados */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💼</span>
                          <span className="text-sm text-gray-400">Trabajos</span>
                        </div>
                        <span className="text-2xl font-bold text-green-500 tabular-nums">
                          {globalStats.totalJobsCompleted}
                        </span>
                      </div>
                    </div>

                    {/* Items comprados */}
                    <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🛍️</span>
                          <span className="text-sm text-gray-400">Items</span>
                        </div>
                        <span className="text-2xl font-bold text-gold-500 tabular-nums">
                          {globalStats.totalItemsPurchased}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StatsPanel;
