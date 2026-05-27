/**
 * 🎮 LEGENDS: StatRow Component
 * Fila de estadística con label, valor y tendencia
 */

import { motion } from 'framer-motion';
import type { StatRowProps } from '@/types/ui';
import { Icon } from '@/components/atoms';

const StatRow = ({ label, value, trend, icon, className = '' }: StatRowProps) => {
  // Obtener configuración de tendencia
  const getTrendConfig = () => {
    if (!trend) return null;

    const configs = {
      up: {
        icon: 'arrow-up' as const,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        emoji: '📈',
      },
      down: {
        icon: 'arrow-down' as const,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        emoji: '📉',
      },
      neutral: {
        icon: 'arrow-right' as const,
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        emoji: '➡️',
      },
    };

    return configs[trend];
  };

  const trendConfig = getTrendConfig();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-purple-500/10 hover:border-purple-500/20 transition-colors ${className}`}
    >
      {/* Label con icono opcional */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && <Icon name={icon} size="sm" className="text-gray-400 flex-shrink-0" />}
        <span className="text-sm text-gray-400 truncate">{label}</span>
      </div>

      {/* Valor y tendencia */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Valor */}
        <span className="text-base font-bold text-gray-100 tabular-nums">{value}</span>

        {/* Indicador de tendencia */}
        {trendConfig && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center justify-center w-6 h-6 rounded ${trendConfig.bgColor}`}
          >
            <span className="text-sm">{trendConfig.emoji}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StatRow;
