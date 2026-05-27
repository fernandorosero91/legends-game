/**
 * LEGENDS: SeatMarker — Marcador clickeable de silla del restaurante.
 *
 * Sólo se muestra cuando hay un cliente seleccionado. Al hacer click se asigna
 * el cliente a esa silla y arranca su caminata.
 */

import { useState } from 'react';
import { Html } from '@react-three/drei';
import { useRestaurantStore } from '../../store/restaurantStore';
import type { SeatConfig } from '../../data/restaurantConfig';

interface SeatMarkerProps {
  seat: SeatConfig;
}

export function SeatMarker({ seat }: SeatMarkerProps) {
  const selectedId = useRestaurantStore((s) => s.selectedCustomerId);
  const customers = useRestaurantStore((s) => s.customers);
  const assignSeat = useRestaurantStore((s) => s.assignSeat);
  const [hovered, setHovered] = useState(false);

  // Sólo visible cuando un cliente está seleccionado.
  if (!selectedId) return null;

  // Si la silla ya está ocupada, no la muestres como disponible.
  const occupied = customers.some(
    (c) => c.seatId === seat.id && c.state !== 'walking_out'
  );
  if (occupied) return null;

  const onClick = (e: any) => {
    e.stopPropagation();
    assignSeat(selectedId, seat.id, seat.position);
  };

  return (
    <group position={seat.position}>
      {/* Disco luminoso visible */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onClick}
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
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial
          color={hovered ? '#fde047' : '#a78bfa'}
          transparent
          opacity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* Hitbox invisible XL — más fácil de clickear desde cualquier ángulo. */}
      <mesh
        position={[0, 0.5, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        visible={false}
      >
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Etiqueta */}
      <Html position={[0, 1.2, 0]} center zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }}>
        <div className="bg-purple-900/90 text-white px-2 py-1 rounded-md border border-purple-400 shadow-md whitespace-nowrap pointer-events-none text-[11px] font-semibold">
          Sentar aquí
        </div>
      </Html>
    </group>
  );
}
