/**
 * 🎮 LEGENDS: Notification Component
 * Sistema de notificaciones mejorado con información detallada
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  timestamp: number;
}

interface NotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function Notification({
  notifications,
  onDismiss,
  position = 'top-right',
}: NotificationProps) {
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);

  // Obtener clases de posicionamiento
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    };
    return positions[position];
  };

  // Obtener información del tipo de notificación
  const getNotificationInfo = (type: Notification['type']) => {
    const notificationTypes = {
      info: {
        icon: 'ℹ️',
        bgColor: 'from-blue-500/90 to-blue-600/90',
        borderColor: 'border-blue-400/50',
        textColor: 'text-blue-100',
        titleColor: 'text-blue-200',
        title: 'INFORMACIÓN'
      },
      success: {
        icon: '✅',
        bgColor: 'from-green-500/90 to-green-600/90',
        borderColor: 'border-green-400/50',
        textColor: 'text-green-100',
        titleColor: 'text-green-200',
        title: 'ÉXITO'
      },
      warning: {
        icon: '⚠️',
        bgColor: 'from-yellow-500/90 to-yellow-600/90',
        borderColor: 'border-yellow-400/50',
        textColor: 'text-yellow-100',
        titleColor: 'text-yellow-200',
        title: 'ADVERTENCIA'
      },
      error: {
        icon: '❌',
        bgColor: 'from-red-500/90 to-red-600/90',
        borderColor: 'border-red-400/50',
        textColor: 'text-red-100',
        titleColor: 'text-red-200',
        title: 'ERROR'
      }
    };
    return notificationTypes[type];
  };

  // Formatear tiempo transcurrido
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-[100] flex flex-col gap-3 pointer-events-none max-w-md`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => {
          const notificationInfo = getNotificationInfo(notification.type);
          const isHovered = hoveredNotification === notification.id;

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 20,
                layout: { duration: 0.2 }
              }}
              className="pointer-events-auto"
              onMouseEnter={() => setHoveredNotification(notification.id)}
              onMouseLeave={() => setHoveredNotification(null)}
            >
              <motion.div
                className={`
                  relative bg-gradient-to-br ${notificationInfo.bgColor} 
                  backdrop-blur-md border-2 ${notificationInfo.borderColor} 
                  rounded-xl shadow-2xl overflow-hidden min-w-[320px]
                `}
                whileHover={{ scale: 1.02 }}
                style={{
                  boxShadow: isHovered 
                    ? `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${notificationInfo.borderColor.replace('border-', '').replace('/50', '')}40`
                    : '0 10px 25px rgba(0,0,0,0.2)'
                }}
              >
                {/* Barra de progreso superior */}
                {notification.duration && notification.duration > 0 && (
                  <motion.div
                    className="absolute top-0 left-0 h-1 bg-white/30"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                  />
                )}

                {/* Contenido principal */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                      <span className="text-2xl">{notificationInfo.icon}</span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`text-xs font-bold uppercase tracking-wide ${notificationInfo.titleColor}`}>
                          {notificationInfo.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                          >
                            <span className="text-white text-sm">×</span>
                          </button>
                        </div>
                      </div>
                      
                      <p className={`text-sm font-medium ${notificationInfo.textColor} leading-relaxed`}>
                        {notification.message}
                      </p>

                      {/* Información adicional en hover */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-white/20"
                        >
                          <div className="flex items-center justify-between text-xs text-white/70">
                            <span>Notificación #{notifications.length - index}</span>
                            <span>
                              {new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Contador de notificaciones */}
      {notifications.length > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-auto bg-gray-900/90 backdrop-blur-md border-2 border-gray-600/50 rounded-xl px-4 py-2 text-center"
        >
          <div className="text-xs text-gray-400 font-medium">
            +{notifications.length - 3} notificaciones más
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Notification;