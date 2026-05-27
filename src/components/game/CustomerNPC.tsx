/**
 * LEGENDS: CustomerNPC — Cliente del restaurante con animaciones.
 *
 * - La POSICIÓN del NPC vive en `groupRef.current.position` durante el caminar.
 *   Sólo se sincroniza al store en transiciones de estado (llegar a destino,
 *   pasar a comer, etc.). Esto evita re-renders por frame y el "yo-yo" visual.
 *
 * - El NPC camina en LÍNEA RECTA al `targetPosition`. No detecta obstáculos
 *   (ni paredes, ni mesas, ni otros NPCs). Si querés colisión, vuelve a
 *   activarla aquí — pero ten en cuenta que con sólo 2 mesas pequeñas y
 *   waypoints fijos no es necesario y empeoraba la experiencia.
 */

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useRestaurantStore, getDishById } from '../../store/restaurantStore';
import {
  RESTAURANT_CONFIG,
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

function CustomerNPCImpl({ id }: CustomerNPCProps) {
  // Sólo se suscribe a cosas que cambian con baja frecuencia (estado lógico).
  // La posición se mutará directamente sobre groupRef → no causa re-renders.
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
  const currentAnimRef = useRef<string>('');

  // Carga del modelo
  const modelFile = customer?.modelFile || '/models/npcs/lit_killah_animado.glb';
  const { scene, animations } = useGLTF(modelFile);

  // Clonado por instancia (skeleton independiente).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene, id]);

  /**
   * IMPORTANTE — eliminamos las pistas de POSICIÓN de cada clip de animación.
   *
   * Las animaciones de Mixamo (caminar, sentarse, etc.) vienen con "root motion":
   * el hueso raíz (Hips/Armature) trae una pista `.position` que mueve al
   * personaje hacia adelante DENTRO del propio loop de la animación. Como
   * nosotros movemos al NPC manualmente con useFrame, ambas fuerzas chocan y
   * producen el efecto "yo-yo": el modelo avanza con la animación, retrocede
   * cuando el clip vuelve al frame 0, mientras nosotros lo seguimos empujando.
   *
   * Filtrando las pistas que terminan en `.position` (que sólo afectan al hueso
   * raíz en rigs humanoides) la animación queda IN-PLACE y el desplazamiento
   * queda 100% en manos del sistema de movimiento. Adiós yo-yo.
   */
  const cleanAnimations = useMemo(() => {
    return animations.map((clip) => {
      const cloned = clip.clone();
      cloned.tracks = cloned.tracks.filter(
        (t) => !t.name.toLowerCase().endsWith('.position')
      );
      return cloned;
    });
  }, [animations]);

  const { actions } = useAnimations(cleanAnimations, groupRef);

  // Sombras + desactivar frustum culling en SkinnedMesh.
  //
  // Three.js calcula la bounding sphere de un SkinnedMesh UNA VEZ en su pose
  // de rest. Cuando los huesos extienden el mesh más allá de esa esfera —cosa
  // que ocurre seguido con animaciones largas de Mixamo— el renderer decide
  // que está fuera de cámara y deja de pintarlo. Resultado visible: el NPC
  // "desaparece" aunque siga ahí. Apagar frustumCulled en cada mesh lo evita.
  useEffect(() => {
    clone.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
      }
    });
  }, [clone]);

  // Posición inicial (sólo al montar): copia la posición lógica al ref.
  useEffect(() => {
    if (!groupRef.current || !customer) return;
    groupRef.current.position.set(
      customer.position[0],
      customer.position[1],
      customer.position[2]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reproducción de animación (con cross-fade).
  const playAnim = (name: string) => {
    if (currentAnimRef.current === name) return;
    const prev = actions[currentAnimRef.current];
    const next = actions[name];
    if (prev) prev.fadeOut(0.2);
    if (next) {
      next.reset().fadeIn(0.2).play();
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    currentAnimRef.current = name;
  };

  // Idle inicial = primer frame del walk congelado.
  useEffect(() => {
    if (!customer) return;
    const walkName = customer.anims.walk;
    const action = actions[walkName];
    if (action) {
      action.reset().play();
      action.timeScale = 0;
      action.time = 0;
      currentAnimRef.current = walkName;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  if (!customer) return null;

  const walkAnim = customer.anims.walk;
  const sitAnim = customer.anims.sit;

  // ----- Movement + state transitions -----
  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const c = useRestaurantStore.getState().customers.find((x) => x.id === id);
    if (!c) return;

    let walking = false;

    if (c.targetPosition) {
      const px = g.position.x;
      const pz = g.position.z;
      const [tx, , tz] = c.targetPosition;
      const dx = tx - px;
      const dz = tz - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > ARRIVAL_EPS) {
        const step = RESTAURANT_CONFIG.CUSTOMER_WALK_SPEED * delta;
        const move = Math.min(step, dist);
        g.position.x = px + (dx / dist) * move;
        g.position.z = pz + (dz / dist) * move;
        g.rotation.y = Math.atan2(dx, dz);
        walking = true;
      } else {
        // Llegó. Snap exacto y notifica al store (1 sólo update).
        g.position.x = tx;
        g.position.z = tz;
        const snapped: Vec3 = [tx, g.position.y, tz];

        if (c.pathQueue.length > 0) {
          const [nextWp, ...rest] = c.pathQueue;
          updateCustomer(id, {
            position: snapped,
            targetPosition: nextWp,
            pathQueue: rest,
          });
        } else {
          updateCustomer(id, {
            position: snapped,
            targetPosition: null,
          });
          handleArrival(c);
        }
      }
    }

    // Animación + ajuste de altura según estado
    if (walking) {
      if (currentAnimRef.current !== walkAnim) playAnim(walkAnim);
      const a = actions[walkAnim];
      if (a) a.timeScale = 1;
      // Caminando: pies en el suelo (Y de la posición lógica)
      g.position.y = c.position[1];
    } else {
      const isSeated =
        c.state === 'thinking' ||
        c.state === 'ordering' ||
        c.state === 'order_taken' ||
        c.state === 'eating';
      if (isSeated) {
        if (currentAnimRef.current !== sitAnim) playAnim(sitAnim);
        // Sentado: aplicar offset configurado por modelo
        g.position.y = c.position[1] + customer.seatYOffset;
      } else {
        if (currentAnimRef.current !== walkAnim) playAnim(walkAnim);
        const a = actions[walkAnim];
        if (a) {
          a.timeScale = 0;
          a.time = 0;
        }
        g.position.y = c.position[1];
      }
    }

    handleStateTimers(c);
  });

  // ----- Arrival / state timers -----
  function handleArrival(c: NonNullable<typeof customer>) {
    if (c.state === 'walking_in') {
      setCustomerState(id, 'waiting_door');
      if (groupRef.current) {
        groupRef.current.rotation.y = CUSTOMER_ROTATIONS.waiting_door;
      }
    } else if (c.state === 'walking_to_seat') {
      setCustomerState(id, 'thinking');
      if (groupRef.current && c.seatId) {
        const seat = RESTAURANT_SEATS.find((s) => s.id === c.seatId);
        if (seat) groupRef.current.rotation.y = seat.rotationY;
      }
    } else if (c.state === 'walking_out') {
      removeCustomer(id);
    }
  }

  function handleStateTimers(c: NonNullable<typeof customer>) {
    const now = Date.now();
    const elapsed = now - c.stateEnteredAt;

    if (c.state === 'thinking' && elapsed >= RESTAURANT_CONFIG.THINK_BEFORE_ORDER_MS) {
      const pick = DISH_CATALOG[Math.floor(Math.random() * DISH_CATALOG.length)];
      updateCustomer(id, { dishId: pick.dishId });
      setCustomerState(id, 'ordering');
    } else if (c.state === 'eating' && elapsed >= RESTAURANT_CONFIG.EATING_TIME_MS) {
      const g = groupRef.current;
      const curPos: Vec3 = g
        ? [g.position.x, g.position.y, g.position.z]
        : c.position;
      incrementServed();
      updateCustomer(id, {
        position: curPos,
        targetPosition: CUSTOMER_EXIT as Vec3,
        pathQueue: [],
      });
      setCustomerState(id, 'walking_out');
    }
  }

  // ----- Click / hover -----
  const isSelected = selectedId === id;

  const onClickGroup = (e: any) => {
    e.stopPropagation();
    const c = useRestaurantStore.getState().customers.find((x) => x.id === id);
    if (!c) return;

    if (carriedDish && carriedDish.customerId === id && c.state === 'order_taken') {
      serveDishToCustomer(id);
      return;
    }
    if (c.state === 'waiting_door') {
      selectCustomer(isSelected ? null : id);
      return;
    }
    if (c.state === 'ordering' && !carriedOrder) {
      takeOrder(id);
      return;
    }
  };

  // ----- UI -----
  const dish = customer.dishId ? getDishById(customer.dishId) : null;
  const showOrderBubble = customer.state === 'ordering' && dish;
  const showOrderTakenBadge = customer.state === 'order_taken';

  const hoverHint = (() => {
    if (carriedDish && carriedDish.customerId === id) return 'Entregar plato';
    if (customer.state === 'waiting_door') return isSelected ? 'Seleccionado' : 'Asignar mesa';
    if (customer.state === 'ordering' && !carriedOrder) return 'Tomar orden';
    return null;
  })();

  return (
    <group
      ref={groupRef}
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
      <group rotation={[0, customer.modelBaseRotationY, 0]}>
        <primitive object={clone} scale={customer.modelScale} />
      </group>

      {/* Hitbox invisible XL para captar clicks/hover fácilmente. */}
      <mesh visible={false} position={[0, 1.0, 0]}>
        <boxGeometry args={[1.4, 2.2, 1.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.9, 32]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.7} />
        </mesh>
      )}

      {showOrderBubble && (
        <Html zIndexRange={[0, 0]} position={[0, 2.4, 0]} center>
          <div className="bg-white rounded-2xl border-4 border-purple-500 shadow-2xl p-2 pointer-events-none">
            <img
              src={dish!.imageUrl}
              alt={dish!.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="text-center text-[11px] font-semibold text-purple-900 mt-1">
              {dish!.name}
            </div>
          </div>
        </Html>
      )}

      {showOrderTakenBadge && (
        <Html zIndexRange={[0, 0]} position={[0, 2.4, 0]} center>
          <div className="bg-amber-500/95 text-white px-3 py-1 rounded-full text-[11px] font-semibold shadow-lg pointer-events-none">
            ⏳ Esperando comida
          </div>
        </Html>
      )}

      {hovered && hoverHint && !showOrderBubble && (
        <Html zIndexRange={[0, 0]} position={[0, 2.0, 0]} center>
          <div className="bg-purple-900/95 text-white px-3 py-1 rounded-lg border-2 border-purple-400 shadow-lg whitespace-nowrap pointer-events-none text-[11px] font-semibold">
            {hoverHint}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Memoizamos por `id`: el padre puede re-renderizar cada frame (por
 * subscripciones a `customers`) sin que cada NPC vuelva a renderizar.
 */
export const CustomerNPC = memo(CustomerNPCImpl, (a, b) => a.id === b.id);

// Models load on-demand via Suspense when restaurant scene renders
