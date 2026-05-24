/**
 * LEGENDS: restaurantStore — Estado del nivel restaurante.
 *
 * Maneja el ciclo de vida de los clientes: spawn → espera → caminar a silla →
 * pensar → pedir → orden tomada → comiendo → salir.
 *
 * También maneja la cola del chef (orden pendiente, plato listo) y el plato que
 * el jugador tiene actualmente "en la mano" para entregar.
 */

import { create } from 'zustand';
import {
  DISH_CATALOG,
  CUSTOMER_MODELS,
  CUSTOMER_SPAWN,
  CUSTOMER_WAIT,
  RESTAURANT_CONFIG,
  type Vec3,
} from '../data/restaurantConfig';

export type CustomerState =
  | 'walking_in'        // Caminando del spawn al área de espera
  | 'waiting_door'      // Esperando junto a la puerta a ser asignado
  | 'walking_to_seat'   // Caminando a la silla asignada
  | 'thinking'          // Sentado, pensando qué pedir
  | 'ordering'          // Mostrando burbuja con el plato deseado
  | 'order_taken'       // Pedido tomado por el jugador, esperando comida
  | 'eating'            // Comiendo el plato entregado
  | 'walking_out';      // Caminando a la puerta para salir

export interface Customer {
  id: string;
  modelFile: string;
  modelScale: number;
  /** Posición actual en mundo (la actualiza el componente con useFrame). */
  position: Vec3;
  /** Posición destino al caminar; null = quieto. */
  targetPosition: Vec3 | null;
  state: CustomerState;
  /** Asiento asignado, si está sentado. */
  seatId: string | null;
  /** Plato deseado (sólo definido cuando ya pidió). */
  dishId: string | null;
  /** Timestamp epoch ms cuando entró al estado actual (para timers). */
  stateEnteredAt: number;
}

interface PendingOrder {
  customerId: string;
  dishId: string;
}

interface ChefOrder {
  customerId: string;
  dishId: string;
  /** Timestamp en que el chef empezó a cocinar. */
  startedAt: number;
}

interface ReadyDish {
  customerId: string;
  dishId: string;
}

interface RestaurantState {
  active: boolean;
  customers: Customer[];

  /** Cliente actualmente seleccionado por el jugador (para asignar silla / tomar orden). */
  selectedCustomerId: string | null;

  /** Pedido que el jugador "lleva" del cliente al chef (en su cabeza). */
  carriedOrder: PendingOrder | null;

  /** Orden en proceso por el chef (sólo una a la vez para mantenerlo simple). */
  chefOrder: ChefOrder | null;

  /** Plato listo en la barra esperando ser recogido por el jugador. */
  readyDish: ReadyDish | null;

  /** Plato que el jugador "lleva" del chef al cliente. */
  carriedDish: ReadyDish | null;

  /** Total de clientes atendidos (para stats). */
  servedCount: number;

  // ---------- acciones ----------
  startRestaurant: () => void;
  stopRestaurant: () => void;

  spawnCustomer: () => void;
  removeCustomer: (id: string) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  setCustomerState: (id: string, state: CustomerState) => void;

  selectCustomer: (id: string | null) => void;
  assignSeat: (customerId: string, seatId: string, seatPos: Vec3) => void;

  takeOrder: (customerId: string) => void;
  deliverOrderToChef: () => void;
  finishCooking: () => void;
  pickUpReadyDish: () => void;
  serveDishToCustomer: (customerId: string) => void;

  incrementServed: () => void;
}

let nextCustomerNum = 1;
let modelToggle = 0;

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  active: false,
  customers: [],
  selectedCustomerId: null,
  carriedOrder: null,
  chefOrder: null,
  readyDish: null,
  carriedDish: null,
  servedCount: 0,

  startRestaurant: () => {
    set({
      active: true,
      customers: [],
      selectedCustomerId: null,
      carriedOrder: null,
      chefOrder: null,
      readyDish: null,
      carriedDish: null,
      servedCount: 0,
    });
  },

  stopRestaurant: () => {
    set({ active: false, customers: [] });
  },

  spawnCustomer: () => {
    const id = `customer-${nextCustomerNum++}`;
    const model = CUSTOMER_MODELS[modelToggle % CUSTOMER_MODELS.length];
    modelToggle++;

    // Calcular posición en la fila: offset en Z según cuántos ya esperan en la puerta.
    const waitingCount = get().customers.filter(
      (c) => c.state === 'waiting_door' || c.state === 'walking_in'
    ).length;
    const queueOffset = waitingCount * RESTAURANT_CONFIG.QUEUE_SPACING;
    const waitTarget: Vec3 = [
      CUSTOMER_WAIT[0],
      CUSTOMER_WAIT[1],
      CUSTOMER_WAIT[2] + queueOffset,
    ];

    set((s) => ({
      customers: [
        ...s.customers,
        {
          id,
          modelFile: model.file,
          modelScale: model.scale,
          position: [...CUSTOMER_SPAWN] as Vec3,
          targetPosition: waitTarget,
          state: 'walking_in',
          seatId: null,
          dishId: null,
          stateEnteredAt: Date.now(),
        },
      ],
    }));
  },

  removeCustomer: (id) => {
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      selectedCustomerId: s.selectedCustomerId === id ? null : s.selectedCustomerId,
    }));
  },

  updateCustomer: (id, patch) => {
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  setCustomerState: (id, state) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, state, stateEnteredAt: Date.now() } : c
      ),
    }));
  },

  selectCustomer: (id) => {
    const { customers } = get();
    if (id === null) {
      set({ selectedCustomerId: null });
      return;
    }
    const c = customers.find((x) => x.id === id);
    // Sólo se puede seleccionar para asignar silla si está esperando junto a la puerta.
    if (!c) return;
    if (c.state === 'waiting_door') {
      set({ selectedCustomerId: id });
    }
  },

  assignSeat: (customerId, seatId, seatPos) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              seatId,
              state: 'walking_to_seat' as CustomerState,
              targetPosition: seatPos,
              stateEnteredAt: Date.now(),
            }
          : c
      ),
      selectedCustomerId: null,
    }));
  },

  takeOrder: (customerId) => {
    const { customers, carriedOrder } = get();
    if (carriedOrder) return; // ya llevas una orden
    const c = customers.find((x) => x.id === customerId);
    if (!c || c.state !== 'ordering' || !c.dishId) return;

    set((s) => ({
      carriedOrder: { customerId, dishId: c.dishId! },
      customers: s.customers.map((x) =>
        x.id === customerId
          ? { ...x, state: 'order_taken' as CustomerState, stateEnteredAt: Date.now() }
          : x
      ),
    }));
  },

  deliverOrderToChef: () => {
    const { carriedOrder, chefOrder, readyDish } = get();
    if (!carriedOrder || chefOrder || readyDish) return;
    set({
      chefOrder: {
        customerId: carriedOrder.customerId,
        dishId: carriedOrder.dishId,
        startedAt: Date.now(),
      },
      carriedOrder: null,
    });
  },

  finishCooking: () => {
    const { chefOrder } = get();
    if (!chefOrder) return;
    set({
      readyDish: { customerId: chefOrder.customerId, dishId: chefOrder.dishId },
      chefOrder: null,
    });
  },

  pickUpReadyDish: () => {
    const { readyDish, carriedDish } = get();
    if (!readyDish || carriedDish) return;
    set({ carriedDish: readyDish, readyDish: null });
  },

  serveDishToCustomer: (customerId) => {
    const { carriedDish } = get();
    if (!carriedDish) return;
    if (carriedDish.customerId !== customerId) return;

    set((s) => ({
      carriedDish: null,
      customers: s.customers.map((c) =>
        c.id === customerId
          ? { ...c, state: 'eating' as CustomerState, stateEnteredAt: Date.now() }
          : c
      ),
    }));
  },

  incrementServed: () => set((s) => ({ servedCount: s.servedCount + 1 })),
}));

/** Helpers de lookup. */
export function getDishById(dishId: string) {
  return DISH_CATALOG.find((d) => d.dishId === dishId);
}
