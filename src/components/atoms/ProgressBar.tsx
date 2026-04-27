/**
 * 🎮 LEGENDS: ProgressBar Component
 * Barra de progreso animada para recursos (energía, hambre, etc.)
 */

import { motion } from 'framer-motion';
import type { ProgressBarProps } from '@/types/ui';

const ProgressBar = ({
  value,
  max = 100,
  color = 'green',
  label,
  showPercent = false,
  className = '',
  animated = true,
}: ProgressBarProps) => {
  // Calcular porcentaje
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isLow = percentage < 20;

  // Clases de color
  const colorClasses = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-400',
  };

  // Clase de alerta si está bajo
  const alertClass = isLow && animated ? 'animate-pulse' : '';

  return (
    <div className={`w-full ${className}`}>
      {/* Label y porcentaje */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1 text-sm">
          {label && <span className="text-gray-300">{label}</span>}
          {showPercent && (
            <span className={`font-semibold tabular-nums ${isLow ? 'text-red-500' : 'text-gray-100'}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      <div 
        className="relative w-full h-2 rounded-full overflow-hidden bg-gray-800"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${colorClasses[color]} ${alertClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.3 : 0,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
