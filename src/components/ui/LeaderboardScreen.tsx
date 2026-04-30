/**
 * 🎮 LEGENDS: LeaderboardScreen Component
 * Tabla de líderes con filtros y rankings
 */

import { motion } from 'framer-motion';
import type { LeaderboardScreenProps } from '@/types/ui';
import { Button, Icon, Badge } from '@/components/atoms';

const LeaderboardScreen = ({
  entries,
  isLoading = false,
  onBack,
  filter = 'all',
  onFilterChange,
}: LeaderboardScreenProps) => {
  // Obtener medalla según posición
  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Filtros disponibles
  const filters = [
    { id: 'all' as const, name: 'Todos', icon: '🌍' },
    { id: 'winners' as const, name: 'Ganadores', icon: '🏆' },
    { id: 'week' as const, name: 'Esta Semana', icon: '📅' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 tracking-tight flex items-center gap-3">
                <span>🏆</span>
                <span>Tabla de Líderes</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Los mejores artistas de Purple City
              </p>
            </div>

            {/* Botón cerrar */}
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Icon name="close" size="md" />
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onFilterChange?.(f.id)}
              >
                <span className="text-base">{f.icon}</span>
                {f.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            // Estado de carga
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block text-4xl mb-4"
              >
                ⏳
              </motion.div>
              <p className="text-gray-400">Cargando tabla de líderes...</p>
            </div>
          ) : entries.length > 0 ? (
            // Lista de entradas
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`backdrop-blur-md bg-white/5 border rounded-xl p-4 transition-all ${
                    entry.rank && entry.rank <= 3
                      ? 'border-gold-500/30 bg-gold-500/5'
                      : 'border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Ranking */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
                        entry.rank && entry.rank <= 3
                          ? 'bg-gold-500/20 border border-gold-500/30'
                          : 'bg-purple-500/10 border border-purple-500/20 text-gray-400 text-lg'
                      }`}
                    >
                      {getMedal(entry.rank || index + 1)}
                    </div>

                    {/* Información del jugador */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-100 truncate">
                          {entry.username}
                        </h3>
                        {entry.won && <Badge variant="gold">🏆 Ganador</Badge>}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Oyentes */}
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">🎧</span>
                          <span className="text-cyan-400 font-bold tabular-nums">
                            {entry.finalListeners.toLocaleString()}
                          </span>
                          <span className="text-gray-500">oyentes</span>
                        </div>

                        {/* Canciones */}
                        <div className="flex items-center gap-1">
                          <span className="text-purple-400">🎵</span>
                          <span className="text-purple-400 font-bold tabular-nums">
                            {entry.totalSongs}
                          </span>
                          <span className="text-gray-500">canciones</span>
                        </div>

                        {/* Día final */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">📅</span>
                          <span className="text-gray-300 font-semibold tabular-nums">
                            Día {entry.finalDay}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fecha */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-gray-500">
                        {new Date(entry.completedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Estado vacío
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-400 mb-2">No hay entradas en la tabla de líderes</p>
              <p className="text-sm text-gray-500">
                Sé el primero en completar el juego y aparecer aquí
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-t border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {entries.length > 0
                ? `Mostrando ${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}`
                : 'Sin entradas'}
            </p>
            <Button variant="secondary" size="sm" onClick={onBack}>
              <Icon name="arrow-left" size="sm" />
              Volver
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardScreen;
