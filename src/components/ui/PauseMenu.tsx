/**
 * 🎮 LEGENDS: PauseMenu Component
 * Menú de pausa con opciones de continuar, guardar, configuración y salir
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { PauseMenuProps } from '@/types/ui';
import { Button, Icon } from '@/components/atoms';

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
            className="fixed inset-0 z-80 bg-black/70 backdrop-blur-sm"
          />

          {/* Menú centrado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-80 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-500/20 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center">
                    <Icon name="pause" size="xl" className="text-purple-400" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-100 tracking-tight">Pausa</h2>
                <p className="text-sm text-gray-400 mt-2">El juego está pausado</p>
              </div>

              {/* Opciones del menú */}
              <div className="p-6 space-y-3">
                {/* Continuar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onContinue}
                    className="w-full justify-center"
                  >
                    <Icon name="play" size="md" />
                    Continuar
                  </Button>
                </motion.div>

                {/* Guardar Partida */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onSave}
                    disabled={isSaving}
                    loading={isSaving}
                    className="w-full justify-center"
                  >
                    <Icon name="save" size="md" />
                    {isSaving ? 'Guardando...' : 'Guardar Partida'}
                  </Button>
                </motion.div>

                {/* Configuración */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={onSettings}
                    className="w-full justify-center"
                  >
                    <Icon name="settings" size="md" />
                    Configuración
                  </Button>
                </motion.div>

                {/* Separador */}
                <div className="border-t border-purple-500/10 my-4" />

                {/* Salir al Menú */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={onMainMenu}
                    className="w-full justify-center"
                  >
                    <Icon name="arrow-left" size="md" />
                    Salir al Menú Principal
                  </Button>
                </motion.div>
              </div>

              {/* Footer con advertencia */}
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-t border-purple-500/20 p-4">
                <p className="text-xs text-gray-400 text-center">
                  💡 Recuerda guardar tu progreso antes de salir
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
