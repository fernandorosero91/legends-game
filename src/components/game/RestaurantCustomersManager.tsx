/**
 * LEGENDS: RestaurantCustomersManager — Spawn loop + HUD de pedidos.
 *
 * Componente sin mesh propio. Se monta dentro del Canvas (para acceso a Three)
 * pero también necesita renderizar un HUD 2D, que lo hace via portal a través
 * del componente paralelo <RestaurantOrdersHUD/> en el árbol DOM normal.
 */

import { useEffect, useRef } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore';
import {
  CUSTOMER_WAIT,
  CUSTOMER_SPAWN,
  RESTAURANT_CONFIG,
} from '../../data/restaurantConfig';

/**
 * Loop que dispara el spawn de clientes cada SPAWN_INTERVAL_MS hasta llegar
 * a MAX_CUSTOMERS activos. Se monta sin renderizar nada visible.
 */
export function RestaurantCustomersManager() {
  const active = useRestaurantStore((s) => s.active);
  const customers = useRestaurantStore((s) => s.customers);
  const spawnCustomer = useRestaurantStore((s) => s.spawnCustomer);
  const startRestaurant = useRestaurantStore((s) => s.startRestaurant);
  const stopRestaurant = useRestaurantStore((s) => s.stopRestaurant);

  const intervalRef = useRef<number | null>(null);

  // Activar al montar, desactivar al desmontar.
  useEffect(() => {
    startRestaurant();
    return () => {
      stopRestaurant();
    };
  }, [startRestaurant, stopRestaurant]);

  // Spawn loop
  useEffect(() => {
    if (!active) return;

    // Spawn inmediato del primer cliente
    if (customers.length === 0) {
      spawnCustomer();
    }

    intervalRef.current = window.setInterval(() => {
      const cs = useRestaurantStore.getState().customers;
      const activeCustomers = cs.filter((c) => c.state !== 'walking_out');
      if (activeCustomers.length < RESTAURANT_CONFIG.MAX_CUSTOMERS) {
        spawnCustomer();
      }
    }, RESTAURANT_CONFIG.SPAWN_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Suprimir warnings de "no usados" para constantes documentales
  void CUSTOMER_WAIT;
  void CUSTOMER_SPAWN;

  return null;
}
