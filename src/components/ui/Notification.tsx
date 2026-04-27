/**
 * 🎮 LEGENDS: Notification Component
 * Sistema de notificaciones con cola y posicionamiento
 */

import { AnimatePresence } from 'framer-motion';
import type { NotificationQueueProps } from '@/types/ui';
import NotificationToast from '@/components/molecules/NotificationToast';

const Notification = ({
  notifications,
  onDismiss,
  position = 'top-right',
}: NotificationQueueProps) => {
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

  return (
    <div className={`fixed ${getPositionClasses()} z-[100] flex flex-col gap-3 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              id={notification.id}
              type={notification.type}
              message={notification.message}
              duration={notification.duration}
              onClose={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
