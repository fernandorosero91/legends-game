/**
 * 🎮 LEGENDS: DialogueBubble Component
 * Burbuja de diálogo simple para NPCs (shell para Yeraldin)
 */

import { motion } from 'framer-motion';
import type { DialogueBubbleProps } from '@/types/ui';

const DialogueBubble = ({
  character,
  text,
  portrait,
  onNext,
  className = '',
}: DialogueBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`backdrop-blur-md bg-black/80 border border-purple-500/30 rounded-xl p-4 shadow-2xl max-w-md ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Retrato del personaje (opcional) */}
        {portrait && (
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50">
            <img src={portrait} alt={character} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Contenido del diálogo */}
        <div className="flex-1 min-w-0">
          {/* Nombre del personaje */}
          <h4 className="text-sm font-bold text-purple-400 mb-2">{character}</h4>

          {/* Texto del diálogo */}
          <p className="text-sm text-gray-100 leading-relaxed">{text}</p>

          {/* Indicador de continuar */}
          {onNext && (
            <motion.button
              onClick={onNext}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              ▼ Click para continuar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DialogueBubble;
