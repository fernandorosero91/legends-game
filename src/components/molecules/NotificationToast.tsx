/**
 * 🎮 LEGENDS: NotificationToast Component
 * Toast de notificación individual con auto-dismiss
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { NotificationToastProps } from '@/types/ui';
import { Icon } from '@/components/atoms';

const NotificationToast = ({
  id,
  type,
  message,
  duration = 3000,
  onClose,
  className = '',
}: NotificationToastProps) => {
  // Auto-dismiss después del duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Obtener configuración según tipo
  const getConfig = () => {
    const configs = {
      success: {
        icon: 'check' as const,
        bgColor: 'bg-green-500/90',
        borderColor: 'border-green-500',
        iconColor: 'text-white',
        emoji: '✅',
      },
      warning: {
        icon: 'check' as const,
        bgColor: 'bg-orange-500/90',
        borderColor: 'border-orange-500',
        iconColor: 'text-white',
        emoji: '⚠️',
      },
      danger: {
        icon: 'close' as const,
        bgColor: 'bg-red-500/90',
        borderColor: 'border-red-500',
        iconColor: 'text-white',
        emoji: '❌',
      },
      info: {
        icon: 'check' as const,
        bgColor: 'bg-purple-500/90',
        borderColor: 'border-purple-500',
        iconColor: 'text-white',
        emoji: 'ℹ️',
      },
    };

    return configs[type];
  };

  const config = getConfig();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`backdrop-blur-md ${config.bgColor} border ${config.borderColor} rounded-lg shadow-2xl overflow-hidden min-w-[280px] max-w-[400px] ${className}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icono/Emoji */}
        <div className="flex-shrink-0 text-2xl">{config.emoji}</div>

        {/* Mensaje */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-relaxed">{message}</p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => onClose?.(id)}
          className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
          aria-label="Cerrar notificación"
        >
          <Icon name="close" size="xs" className={config.iconColor} />
        </button>
      </div>

      {/* Barra de progreso de auto-dismiss */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="h-1 bg-white/30 origin-left"
        />
      )}
    </motion.div>
  );
};

export default NotificationToast;
