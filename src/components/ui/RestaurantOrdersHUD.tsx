/**
 * LEGENDS: RestaurantOrdersHUD — HUD del nivel restaurante.
 *
 * Muestra:
 *  - Lo que el jugador lleva "en la mano":
 *      - una orden (camino al chef): botón "Entregar al chef"
 *      - un plato (camino al cliente): aviso para clickear cliente
 *  - Estado del chef (cocinando / listo).
 *  - Contador de clientes atendidos + suma propinas al subir.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurantStore, getDishById } from '../../store/restaurantStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { RESTAURANT_CONFIG } from '../../data/restaurantConfig';

export function RestaurantOrdersHUD() {
  const carriedOrder = useRestaurantStore((s) => s.carriedOrder);
  const carriedDish = useRestaurantStore((s) => s.carriedDish);
  const chefOrder = useRestaurantStore((s) => s.chefOrder);
  const readyDish = useRestaurantStore((s) => s.readyDish);
  const servedCount = useRestaurantStore((s) => s.servedCount);
  const deliverOrderToChef = useRestaurantStore((s) => s.deliverOrderToChef);

  const addMoney = usePlayerStore((s) => s.addMoney);
  const addNotification = useUIStore((s) => s.addNotification);

  const dishCarried = carriedDish ? getDishById(carriedDish.dishId) : null;
  const dishOrder = carriedOrder ? getDishById(carriedOrder.dishId) : null;

  // Pago de propinas: cuando servedCount sube, suma dinero al jugador.
  const prevServedRef = useRef(servedCount);
  useEffect(() => {
    if (servedCount > prevServedRef.current) {
      const delta = servedCount - prevServedRef.current;
      const amount = delta * RESTAURANT_CONFIG.TIP_PER_CUSTOMER;
      addMoney(amount);
      addNotification('success', `💰 +$${amount} de propina`);
    }
    prevServedRef.current = servedCount;
  }, [servedCount, addMoney, addNotification]);

  const handleDeliverToChef = () => {
    if (!carriedOrder) return;
    if (chefOrder) {
      addNotification('warning', 'El chef ya está cocinando otra orden');
      return;
    }
    deliverOrderToChef();
    addNotification('success', '🍳 El chef recibió la orden. 15s de cocina…');
  };

  return (
    <>
      {/* Contador de clientes atendidos */}
      <div className="fixed top-60 left-4 z-40 bg-purple-900/85 backdrop-blur-sm border-2 border-purple-400 rounded-xl px-4 py-2 shadow-lg pointer-events-none">
        <div className="text-xs text-purple-200 font-medium">Clientes atendidos</div>
        <div className="text-2xl font-bold text-amber-300">
          🎯 {servedCount}{' '}
          <span className="text-sm text-green-400 font-normal">
            (${servedCount * RESTAURANT_CONFIG.TIP_PER_CUSTOMER})
          </span>
        </div>
      </div>

      {/* Estado del chef */}
      <AnimatePresence>
        {chefOrder && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="fixed top-32 right-4 z-40 bg-orange-900/90 backdrop-blur-sm border-2 border-orange-400 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 pointer-events-none"
          >
            <span className="text-2xl">🍳</span>
            <div>
              <div className="text-xs text-orange-200">Chef cocinando</div>
              <div className="text-sm font-bold text-white">
                {getDishById(chefOrder.dishId)?.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plato listo esperando recogida */}
      <AnimatePresence>
        {readyDish && !carriedDish && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="fixed top-32 right-4 z-40 bg-green-900/90 backdrop-blur-sm border-2 border-green-400 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2 pointer-events-none"
          >
            <span className="text-2xl animate-bounce">✅</span>
            <div>
              <div className="text-xs text-green-200">Plato listo</div>
              <div className="text-sm font-bold text-white">
                Click sobre el plato en la barra
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD inferior: lo que llevas en la mano */}
      <AnimatePresence>
        {(dishOrder || dishCarried) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-md border-2 border-purple-500 rounded-2xl shadow-2xl p-4 flex items-center gap-4"
          >
            {dishOrder && (
              <>
                <div className="flex flex-col items-center">
                  <img
                    src={dishOrder.imageUrl}
                    alt={dishOrder.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-purple-400"
                  />
                  <div className="text-xs text-purple-300 mt-1">Pedido</div>
                </div>
                <div>
                  <div className="text-xs text-purple-300">Llevas la orden de</div>
                  <div className="text-lg font-bold text-white">{dishOrder.name}</div>
                  <button
                    onClick={handleDeliverToChef}
                    className="mt-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    👨‍🍳 Entregar al chef
                  </button>
                </div>
              </>
            )}

            {dishCarried && (
              <>
                <div className="flex flex-col items-center">
                  <img
                    src={dishCarried.imageUrl}
                    alt={dishCarried.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-green-400"
                  />
                  <div className="text-xs text-green-300 mt-1">En tu bandeja</div>
                </div>
                <div>
                  <div className="text-xs text-green-300">Llevas listo</div>
                  <div className="text-lg font-bold text-white">{dishCarried.name}</div>
                  <div className="text-xs text-purple-200 mt-1">
                    Click sobre el cliente para servir
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
