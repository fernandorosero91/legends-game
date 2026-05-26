/**
 * LEGENDS: RestaurantCustomersManager — Spawn loop + HUD de pedidos.
 *
 * Componente sin mesh propio. Se monta dentro del Canvas (para acceso a Three)
 * pero también necesita renderizar un HUD 2D, que lo hace via portal a través
 * del componente paralelo <RestaurantOrdersHUD/> en el árbol DOM normal.
 *
 * Reglas de spawn:
 *  - No spawnea hasta que el jugador habla con el chef (spawnAllowed = true).
 *  - Mantiene como mucho MAX_WAITING_AT_DOOR clientes esperando junto a la puerta;
 *    cuando uno es enviado a una mesa, su slot queda libre y entra el siguiente.
 *
 * Modo calibración (RESTAURANT_CONFIG.AUTO_RECYCLE_AT_DOOR = true):
 *  - Los clientes esperando en la puerta se mandan automáticamente a salir
 *    tras AUTO_RECYCLE_MS para que entren modelos nuevos. Útil para ver las
 *    distintas skins en escena sin asignar sillas manualmente.
 */

import { useEffect, useRef } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore';
import {
  RESTAURANT_CONFIG,
  MAX_WAITING_AT_DOOR,
  CUSTOMER_EXIT,
  type Vec3,
} from '../../data/restaurantConfig';

export function RestaurantCustomersManager() {
  const active = useRestaurantStore((s) => s.active);
  const spawnAllowed = useRestaurantStore((s) => s.spawnAllowed);
  const spawnCustomer = useRestaurantStore((s) => s.spawnCustomer);
  const startRestaurant = useRestaurantStore((s) => s.startRestaurant);
  const stopRestaurant = useRestaurantStore((s) => s.stopRestaurant);

  const intervalRef = useRef<number | null>(null);
  const recycleRef = useRef<number | null>(null);
  const allowSpawning = useRestaurantStore((s) => s.allowSpawning);

  // Activar al montar (sin spawn aún), desactivar al desmontar.
  useEffect(() => {
    startRestaurant();
    // Modo calibración: arrancar el spawn sin esperar al diálogo del chef.
    if (RESTAURANT_CONFIG.AUTO_RECYCLE_AT_DOOR) {
      allowSpawning();
    }
    return () => {
      stopRestaurant();
    };
  }, [startRestaurant, stopRestaurant, allowSpawning]);

  // Spawn loop — sólo cuando el jugador habilita el spawn.
  useEffect(() => {
    if (!active || !spawnAllowed) return;

    const trySpawn = () => {
      const cs = useRestaurantStore.getState().customers;
      const waiting = cs.filter(
        (c) => c.state === 'walking_in' || c.state === 'waiting_door'
      ).length;
      const total = cs.filter((c) => c.state !== 'walking_out').length;
      if (
        waiting < MAX_WAITING_AT_DOOR &&
        total < RESTAURANT_CONFIG.MAX_CUSTOMERS
      ) {
        spawnCustomer();
      }
    };

    // Primer spawn inmediato.
    trySpawn();

    intervalRef.current = window.setInterval(
      trySpawn,
      RESTAURANT_CONFIG.SPAWN_INTERVAL_MS
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, spawnAllowed, spawnCustomer]);

  // Modo calibración: reciclar clientes en la puerta tras AUTO_RECYCLE_MS.
  useEffect(() => {
    if (!active || !spawnAllowed) return;
    if (!RESTAURANT_CONFIG.AUTO_RECYCLE_AT_DOOR) return;

    const tick = () => {
      const store = useRestaurantStore.getState();
      const now = Date.now();
      for (const c of store.customers) {
        if (
          c.state === 'waiting_door' &&
          now - c.stateEnteredAt >= RESTAURANT_CONFIG.AUTO_RECYCLE_MS
        ) {
          // Lo mandamos a salir para liberar el slot y dejar entrar uno nuevo.
          store.updateCustomer(c.id, {
            targetPosition: CUSTOMER_EXIT as Vec3,
            pathQueue: [],
            doorSlot: null,
          });
          store.setCustomerState(c.id, 'walking_out');
        }
      }
    };

    recycleRef.current = window.setInterval(tick, 500);
    return () => {
      if (recycleRef.current) {
        clearInterval(recycleRef.current);
        recycleRef.current = null;
      }
    };
  }, [active, spawnAllowed]);

  return null;
}
