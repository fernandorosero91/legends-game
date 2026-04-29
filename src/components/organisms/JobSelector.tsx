/**
 * 🎮 LEGENDS: JobSelector Component
 * Lista de trabajos disponibles con filtros y selección
 */

import { useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { JobSelectorProps } from '@/types/ui';
import { Button, Badge, Icon } from '@/components/atoms';

const JobSelector = memo(({ jobs, onSelectJob, currentJob, className = '' }: JobSelectorProps) => {
  const [filter, setFilter] = useState<'all' | 'online' | 'physical'>('all');

  // Filtrar trabajos por tipo (memoizado)
  const filteredJobs = useMemo(() => {
    return filter === 'all' ? jobs : jobs.filter((job) => job.location === filter);
  }, [filter, jobs]);

  // Obtener icono según ubicación
  const getLocationIcon = (location: string) => {
    const icons: Record<string, string> = {
      online: '💻',
      cafe: '☕',
      store: '🏪',
      restaurant: '🍽️',
      delivery: '📦',
      bar: '🎵',
      academy: '🎓',
    };
    return icons[location] || '💼';
  };

  // Obtener color según disponibilidad
  const getJobColor = (job: typeof jobs[0]) => {
    if (!job.available) return 'border-gray-700/30 opacity-50';
    if (currentJob === job.id) return 'border-purple-500 bg-purple-500/10';
    return 'border-purple-500/20 hover:border-purple-500/40';
  };

  return (
    <div className={className}>
      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'online' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('online')}
        >
          💻 Online
        </Button>
        <Button
          variant={filter === 'physical' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('physical')}
        >
          🏃 Físicos
        </Button>
      </div>

      {/* Lista de trabajos */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`backdrop-blur-md bg-white/5 border rounded-xl p-4 transition-all ${getJobColor(
                job
              )}`}
            >
              <div className="flex items-start gap-4">
                {/* Icono del trabajo */}
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {getLocationIcon(job.location)}
                </div>

                {/* Información del trabajo */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-100 truncate">
                        {job.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">{job.description}</p>
                    </div>

                    {/* Badges de estado */}
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      {!job.available && <Badge variant="red">Nivel {job.levelRequired}</Badge>}
                      {currentJob === job.id && <Badge variant="purple">Activo</Badge>}
                    </div>
                  </div>

                  {/* Stats del trabajo */}
                  <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                    {/* Pago */}
                    <div className="flex items-center gap-1">
                      <Icon name="money" size="xs" className="text-gold-500" />
                      <span className="text-gold-500 font-bold tabular-nums">
                        ${job.pay.toLocaleString()}
                      </span>
                    </div>

                    {/* Energía */}
                    <div className="flex items-center gap-1">
                      <Icon name="energy" size="xs" className="text-red-500" />
                      <span className="text-red-500 font-semibold tabular-nums">
                        -{job.energyCost}
                      </span>
                    </div>

                    {/* Turnos */}
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">⏱️</span>
                      <span className="text-gray-300 font-semibold">
                        {job.turnsCost} turno{job.turnsCost > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Ubicación */}
                    {job.location !== 'online' && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">📍</span>
                        <span className="text-gray-300 text-xs capitalize">
                          {job.location === 'cafe'
                            ? 'Purple Beans'
                            : job.location === 'store'
                            ? 'StreetWear'
                            : job.location === 'restaurant'
                            ? 'La Esquina'
                            : job.location === 'delivery'
                            ? 'Delivery Express'
                            : job.location === 'bar'
                            ? 'Neon Nights'
                            : job.location === 'academy'
                            ? 'SoundWave'
                            : job.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <Button
                    variant={currentJob === job.id ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => onSelectJob(job.id)}
                    disabled={!job.available || currentJob === job.id}
                    className="w-full sm:w-auto"
                  >
                    {currentJob === job.id ? (
                      <>
                        <Icon name="check" size="sm" />
                        Trabajo Activo
                      </>
                    ) : !job.available ? (
                      <>
                        <Icon name="close" size="sm" />
                        Bloqueado
                      </>
                    ) : (
                      <>
                        <Icon name="work" size="sm" />
                        Iniciar Trabajo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No hay trabajos disponibles con este filtro</p>
        </div>
      )}
    </div>
  );
});

JobSelector.displayName = 'JobSelector';

export default JobSelector;
