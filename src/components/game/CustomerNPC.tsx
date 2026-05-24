/**
 * LEGENDS: CustomerNPC — Cliente del restaurante.
 *
 * Renderiza un GLB de cliente y maneja:
 *  - Caminar hacia targetPosition con velocidad constante.
 *  - Bobbing sintético al caminar (los GLB no traen animaciones).
 *  - Eventos de transición de estado al llegar al destino.
 *  - Click selección y burbuja con la imagen del plato pedido.
 *  - Indicador "Tomar orden" / "Entregar plato" según contexto.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useRestaurantStore, getDishById } from '../../store/restaurantStore';
import {
  RESTAURANT_CONFIG,
  CUSTOMER_WAIT,
  CUSTOMER_EXIT,
  CUSTOMER_ROTATIONS,
  RESTAURANT_SEATS,
  DISH_CATALOG,
  type Vec3,
} from '../../data/restaurantConfig';

interface CustomerNPCProps {
  id: string;
}

const ARRIVAL_EPS = 0.05;

export function CustomerNPC({ id }: CustomerNPCProps) {
  const customer = useRestaurantStore((s) => s.customers.find((c) => c.id === id));
  const selectedId = useRestaurantStore((s) => s.selectedCustomerId);
  const carriedOrder = useRestaurantStore((s) => s.carriedOrder);
  const carriedDish = useRestaurantStore((s) => s.carriedDish);
  const updateCustomer = useRestaurantStore((s) => s.updateCustomer);
  const setCustomerState = useRestaurantStore((s) => s.setCustomerState);
  const selectCustomer = useRestaurantStore((s) => s.selectCustomer);
  const takeOrder = useRestaurantStore((s) => s.takeOrder);
  const serveDishToCustomer = useRestaurantStore((s) => s.serveDishToCustomer);
  const incrementServed = useRestaurantStore((s) => s.incrementServed);
  const removeCustomer = useRestaurantStore((s) => s.removeCustomer);

  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Cargar siempre los dos modelos para que estén pre-cacheados.
  const { scene } = useGLTF(customer?.modelFile || '/models/hombre_de_55_anos.glb');
  // Clone por instancia (id como dep garantiza un clone fresco por NPC).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene, id]);

  // Sombras
  useEffect(() => {
    clone.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [clone]);

  if (!customer) return null;

  // ----- Movimiento + transiciones de estado -----
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const c = useRestaurantStore.getState().customers.find((x) => x.id === id);
    if (!c) return;

    const [px, py, pz] = c.position;
    let nextX = px;
    let nextZ = pz;
    let walking = false;

    if (c.targetPosition) {
      const [tx, , tz] = c.targetPosition;
      const dx = tx - px;
      const dz = tz - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > ARRIVAL_EPS) {
        const step = RESTAURANT_CONFIG.CUSTOMER_WALK_SPEED * delta;
        const move = Math.min(step, dist);
        nextX = px + (dx / dist) * move;
        nextZ = pz + (dz / dist) * move;
        groupRef.current.rotation.y = Math.atan2(dx, dz);
        walking = true;

        updateCustomer(id, { position: [nextX, py, nextZ] });
      } else {
        // Llegó al destino → transiciones por estado
        updateCustomer(id, {
          position: [tx, py, tz],
          targetPosition: null,
        });
        handleArrival(c);
      }
    }

    // Aplicar posición/rotación al grupo Three
    groupRef.current.position.set(nextX, py, nextZ);

    // Bobbing sintético al caminar
    if (walking) {
      const t = performance.now() / 220;
      groupRef.current.position.y = py + Math.abs(Math.sin(t)) * 0.05;
    } else {
      groupRef.current.position.y = py;
    }

    // Timers basados en stateEnteredAt
    handleStateTimers(c);
  });

  // ----- Lógica de cambio de estado al llegar al destino -----
  function handleArrival(c: ReturnType<typeof getCustomer>) {
    if (!c) return;
    if (c.state === 'walking_in') {
      setCustomerState(id, 'waiting_door');
      // Aplicar rotación de reposo al esperar junto a la puerta
      if (groupRef.current) {
        groupRef.current.rotation.y = CUSTOMER_ROTATIONS.waiting_door;
      }
    } else if (c.state === 'walking_to_seat') {
      setCustomerState(id, 'thinking');
      // Aplicar rotación de la silla (mirando hacia la mesa)
      if (groupRef.current && c.seatId) {
        const seat = RESTAURANT_SEATS.find((s) => s.id === c.seatId);
        if (seat) {
          groupRef.current.rotation.y = seat.rotationY;
        }
      }
    } else if (c.state === 'walking_out') {
      // Salió: lo eliminamos
      removeCustomer(id);
    }
  }

  // ----- Timers para estados temporales -----
  function handleStateTimers(c: ReturnType<typeof getCustomer>) {
    if (!c) return;
    const now = Date.now();
    const elapsed = now - c.stateEnteredAt;

    if (c.state === 'thinking' && elapsed >= RESTAURANT_CONFIG.THINK_BEFORE_ORDER_MS) {
      // Asignar plato aleatorio y pasar a 'ordering'
      const pick = DISH_CATALOG[Math.floor(Math.random() * DISH_CATALOG.length)];
      updateCustomer(id, { dishId: pick.dishId });
      setCustomerState(id, 'ordering');
    } else if (c.state === 'eating' && elapsed >= RESTAURANT_CONFIG.EATING_TIME_MS) {
      // Termina de comer → camina a la salida
      incrementServed();
      updateCustomer(id, { targetPosition: CUSTOMER_EXIT as Vec3 });
      setCustomerState(id, 'walking_out');
    }
  }

  // ----- Click handling -----
  const isSelected = selectedId === id;

  const onClickGroup = (e: any) => {
    e.stopPropagation();
    const c = useRestaurantStore.getState().customers.find((x) => x.id === id);
    if (!c) return;

    // Si llevas un plato y es para este cliente → entregarlo.
    if (carriedDish && carriedDish.customerId === id && c.state === 'order_taken') {
      serveDishToCustomer(id);
      return;
    }

    // Si está esperando junto a la puerta → seleccionarlo para asignar silla.
    if (c.state === 'waiting_door') {
      selectCustomer(isSelected ? null : id);
      return;
    }

    // Si está mostrando burbuja de pedido y no llevas otra orden → tomar orden.
    if (c.state === 'ordering' && !carriedOrder) {
      takeOrder(id);
      return;
    }
  };

  // ----- Burbuja con la imagen del plato -----
  const dish = customer.dishId ? getDishById(customer.dishId) : null;
  const showOrderBubble = customer.state === 'ordering' && dish;
  const showOrderTakenBadge = customer.state === 'order_taken';

  // Etiqueta de hover
  const hoverHint = (() => {
    if (carriedDish && carriedDish.customerId === id) return 'Entregar plato';
    if (customer.state === 'waiting_door') return isSelected ? 'Seleccionado' : 'Asignar mesa';
    if (customer.state === 'ordering' && !carriedOrder) return 'Tomar orden';
    return null;
  })();

  // Helper local porque uso 2 veces el lookup
  function getCustomer() {
    return useRestaurantStore.getState().customers.find((x) => x.id === id);
  }

  return (
    <group
      ref={groupRef}
      position={customer.position}
      onClick={onClickGroup}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clone} scale={customer.modelScale} />

      {/* Halo de selección */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.9, 32]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Burbuja con la imagen del plato pedido */}
      {showOrderBubble && (
        <Html position={[0, 2.4, 0]} center distanceFactor={6}>
          <div className="bg-white rounded-2xl border-4 border-purple-500 shadow-2xl p-2 pointer-events-none">
            <img
              src={dish!.imageUrl}
              alt={dish!.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="text-center text-xs font-bold text-purple-900 mt-1">
              {dish!.name}
            </div>
          </div>
        </Html>
      )}

      {/* Indicador de "orden tomada" sobre el cliente esperando comida */}
      {showOrderTakenBadge && (
        <Html position={[0, 2.4, 0]} center distanceFactor={6}>
          <div className="bg-amber-500/95 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg pointer-events-none">
            ⏳ Esperando comida
          </div>
        </Html>
      )}

      {/* Hint de hover */}
      {hovered && hoverHint && !showOrderBubble && (
        <Html position={[0, 2.0, 0]} center distanceFactor={6}>
          <div className="bg-purple-900/95 text-white px-3 py-1 rounded-lg border-2 border-purple-400 shadow-lg whitespace-nowrap pointer-events-none text-sm font-medium">
            {hoverHint}
          </div>
        </Html>
      )}
    </group>
  );
}


useGLTF.preload('/models/hombre_de_55_anos.glb');
useGLTF.preload('/models/flexin_personaje-_litkillah_con_textura.glb');
