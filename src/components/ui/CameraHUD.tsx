/**
 * 🎮 LEGENDS: CameraHUD Component
 * HUD inferior con controles e indicadores de interacción
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button, Icon, Badge } from '@/components/atoms';

interface CameraHUDProps {
  showInteractPrompt?: boolean;
  interactText?: string;
  onInteract?: () => void;
  showMobileControls?: boolean;
  className?: string;
}

const CameraHUD = ({
  showInteractPrompt = false,
  interactText = 'Interactuar',
  onInteract,
  showMobileControls = false,
  className = '',
}: CameraHUDProps) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <div className="px-4 py-3">
        {/* Indicador de interacción */}
        <AnimatePresence>
          {showInteractPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center mb-4"
            >
              <div className="backdrop-blur-md bg-white/10 border border-purple-500/30 rounded-xl px-6 py-3 flex items-center gap-3">
                <Badge variant="purple">E</Badge>
                <span className="text-sm font-semibold text-gray-100">
                  {interactText}
                </span>
                {onInteract && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onInteract}
                    className="md:hidden"
                  >
                    <Icon name="check" size="sm" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles móviles (joystick virtual) */}
        {showMobileControls && (
          <div className="md:hidden flex justify-between items-end">
            {/* Joystick izquierdo (movimiento) */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-white/5 border-2 border-purple-500/30 backdrop-blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-500/50 border-2 border-purple-400" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                Mover
              </div>
            </div>

            {/* Botones de acción derecha */}
            <div className="flex flex-col gap-2">
              {/* Botón de interacción */}
              <Button
                variant="primary"
                size="lg"
                className="w-16 h-16 rounded-full"
                disabled={!showInteractPrompt}
                onClick={onInteract}
              >
                <span className="text-xl font-bold">E</span>
              </Button>

              {/* Mini-mapa o indicador de ubicación */}
              <div className="w-16 h-16 rounded-lg bg-black/40 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
                <Icon name="day" size="sm" className="text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Indicador de ubicación (desktop) */}
        {!showMobileControls && (
          <div className="hidden md:flex justify-center">
            <div className="backdrop-blur-md bg-black/40 border border-purple-500/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <Icon name="day" size="sm" className="text-purple-400" />
              <span className="text-xs text-gray-400">Apartamento</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraHUD;
