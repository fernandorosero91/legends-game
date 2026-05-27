/**
 * 🎮 LEGENDS: JobScreen Component
 * Pantalla de trabajos online y físicos con progreso
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { JobScreenProps } from '@/types/ui';
import { Button, Icon, ProgressBar } from '@/components/atoms';
import JobSelector from '@/components/organisms/JobSelector';

const JobScreen = ({
  jobs,
  currentJob,
  onStartJob,
  onCompleteJob,
  onBack,
  isWorking,
  progress = 0,
}: JobScreenProps) => {
  // Encontrar el trabajo actual
  const activeJob = jobs.find((job) => job.id === currentJob);

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
                {isWorking ? '⏳ Trabajando...' : '💼 Trabajos Disponibles'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isWorking
                  ? 'Completa el trabajo para recibir tu pago'
                  : 'Gana dinero para pagar la renta y grabar música'}
              </p>
            </div>

            {/* Botón cerrar */}
            <Button variant="ghost" size="sm" onClick={onBack} disabled={isWorking}>
              <Icon name="close" size="md" />
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <AnimatePresence mode="wait">
            {isWorking && activeJob ? (
              // Vista de trabajo en progreso
              <motion.div
                key="working"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Información del trabajo activo */}
                <div className="backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    {/* Icono del trabajo */}
                    <div className="w-16 h-16 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">
                      {activeJob.location === 'online' ? '💻' : '🏃'}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-100 mb-1">{activeJob.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{activeJob.description}</p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Icon name="money" size="sm" className="text-gold-500" />
                          <span className="text-gold-500 font-bold tabular-nums">
                            ${activeJob.pay.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="energy" size="sm" className="text-red-500" />
                          <span className="text-red-500 font-semibold tabular-nums">
                            -{activeJob.energyCost}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">⏱️</span>
                          <span className="text-gray-300 font-semibold">
                            {activeJob.turnsCost} turno{activeJob.turnsCost > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progreso del trabajo</span>
                      <span className="text-purple-400 font-bold tabular-nums">{progress}%</span>
                    </div>
                    <ProgressBar value={progress} max={100} color="purple" animated />
                  </div>

                  {/* Mensaje de trabajo */}
                  <div className="mt-4 p-4 rounded-lg bg-black/20 border border-purple-500/10">
                    <p className="text-sm text-gray-300 text-center">
                      {progress < 30
                        ? '🔨 Comenzando el trabajo...'
                        : progress < 70
                        ? '⚙️ Trabajo en progreso...'
                        : progress < 100
                        ? '✨ Casi terminado...'
                        : '✅ ¡Trabajo completado!'}
                    </p>
                  </div>
                </div>

                {/* Botón completar (solo si progress === 100) */}
                {progress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                  >
                    <Button variant="primary" size="lg" onClick={onCompleteJob}>
                      <Icon name="check" size="md" />
                      Recibir Pago (${activeJob.pay.toLocaleString()})
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              // Vista de selección de trabajos
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Información de ayuda */}
                <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-purple-400 mb-1">
                        Consejos sobre trabajos
                      </h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Los trabajos online se hacen desde tu computador</li>
                        <li>• Los trabajos físicos requieren ir al lugar en Purple City</li>
                        <li>• Cada trabajo consume energía y turnos del día</li>
                        <li>• Los trabajos mejor pagados requieren más nivel</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Selector de trabajos */}
                <JobSelector jobs={jobs} onSelectJob={onStartJob} currentJob={currentJob} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isWorking && (
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-t border-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {jobs.filter((j) => j.available).length} trabajos disponibles
              </p>
              <Button variant="secondary" size="sm" onClick={onBack}>
                <Icon name="arrow-left" size="sm" />
                Volver
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default JobScreen;
