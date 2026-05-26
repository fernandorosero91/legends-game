/**
 * LEGENDS: ReadyDishOnCounter — Plato listo sobre la barra del chef.
 *
 * Aparece cuando readyDish !== null. Al hacer click el jugador lo "recoge"
 * (queda en carriedDish) y este componente desaparece. Mientras el chef cocina,
 * muestra una burbuja con cuenta regresiva en el mismo punto.
 */

import { useState } from 'react';
import { Html, useGLTF } from '@react-three/drei';
import { useRestaurantStore, getDishById } from '../../store/restaurantStore';
import { CHEF_COUNTER_POSITION, RESTAURANT_CONFIG } from '../../data/restaurantConfig';
import { useEffect } from 'react';

export function ReadyDishOnCounter() {
  const readyDish = useRestaurantStore((s) => s.readyDish);
  const chefOrder = useRestaurantStore((s) => s.chefOrder);
  const carriedDish = useRestaurantStore((s) => s.carriedDish);
  const pickUpReadyDish = useRestaurantStore((s) => s.pickUpReadyDish);
  const finishCooking = useRestaurantStore((s) => s.finishCooking);

  const [hovered, setHovered] = useState(false);
  const [, force] = useState(0);

  // Tick cada segundo para refrescar el countdown.
  useEffect(() => {
    if (!chefOrder) return;
    const interval = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(interval);
  }, [chefOrder]);

  // Cuando el chef termina de cocinar, marcar plato como listo.
  useEffect(() => {
    if (!chefOrder) return;
    const elapsed = Date.now() - chefOrder.startedAt;
    if (elapsed >= RESTAURANT_CONFIG.CHEF_COOK_TIME_MS) {
      finishCooking();
    } else {
      const timeout = setTimeout(
        () => finishCooking(),
        RESTAURANT_CONFIG.CHEF_COOK_TIME_MS - elapsed
      );
      return () => clearTimeout(timeout);
    }
  }, [chefOrder, finishCooking]);

  // Burbuja de "cocinando" sobre la barra
  if (chefOrder) {
    const remaining = Math.max(
      0,
      Math.ceil(
        (RESTAURANT_CONFIG.CHEF_COOK_TIME_MS - (Date.now() - chefOrder.startedAt)) / 1000
      )
    );
    return (
      <Html position={CHEF_COUNTER_POSITION} center distanceFactor={7}>
        <div className="bg-orange-500/95 text-white px-4 py-2 rounded-xl border-2 border-orange-300 shadow-2xl pointer-events-none flex items-center gap-2 font-bold">
          <span className="text-2xl">🍳</span>
          <span>Cocinando… {remaining}s</span>
        </div>
      </Html>
    );
  }

  if (!readyDish || carriedDish) return null;

  const dish = getDishById(readyDish.dishId);
  if (!dish) return null;

  return (
    <ReadyDishMesh
      modelFile={dish.modelFile}
      scale={dish.modelScale}
      hovered={hovered}
      setHovered={setHovered}
      onPick={() => pickUpReadyDish()}
      dishName={dish.name}
    />
  );
}

interface ReadyDishMeshProps {
  modelFile: string;
  scale: number;
  hovered: boolean;
  setHovered: (v: boolean) => void;
  onPick: () => void;
  dishName: string;
}

function ReadyDishMesh({
  modelFile,
  scale,
  hovered,
  setHovered,
  onPick,
  dishName,
}: ReadyDishMeshProps) {
  const { scene } = useGLTF(`/models/dishes/${modelFile}`);

  // El group exterior NO escala, así la hitbox invisible vive en unidades
  // de mundo y es fácil de clickear. El modelo va dentro de un sub-group
  // con el scale real.
  return (
    <group
      position={CHEF_COUNTER_POSITION}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
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
      {/* Hitbox invisible XL para captar clicks fácil. */}
      <mesh visible={false}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Modelo escalado al tamaño visual normal. */}
      <group scale={scale}>
        <primitive object={scene.clone()} />
      </group>

      {/* Halo sutil cuando hay hover (refuerza que es interactuable). */}
      {hovered && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.55, 32]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.7} />
        </mesh>
      )}

      {hovered && (
        <Html position={[0, 0.6, 0]} center distanceFactor={7}>
          <div className="bg-green-600/95 text-white px-3 py-1 rounded-lg border-2 border-green-300 shadow-lg whitespace-nowrap pointer-events-none text-sm font-bold">
            ✋ Recoger {dishName}
          </div>
        </Html>
      )}
    </group>
  );
}
