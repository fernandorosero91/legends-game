/**
 * 🎮 LEGENDS: Interactable Zone
 * Zona de interacción invisible que se coloca sobre objetos GLB existentes.
 * Muestra un tooltip al hacer hover y ejecuta una acción al hacer clic.
 * No renderiza geometría visible — solo un hitbox transparente.
 */

import { useState } from 'react';
import { Html } from '@react-three/drei';

interface InteractableZoneProps {
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  icon?: string;
  onInteract: () => void;
  tooltipOffset?: [number, number, number];
  /** If true, renders a faint translucent box for debugging the hit zone */
  debug?: boolean;
}

export function InteractableZone({
  position,
  size,
  label,
  icon = '🎯',
  onInteract,
  tooltipOffset = [0, 1.5, 0],
  debug = false,
}: InteractableZoneProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Hitbox invisible */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract();
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
        <boxGeometry args={size} />
        <meshBasicMaterial transparent opacity={debug ? 0.25 : 0} depthWrite={false} />
      </mesh>

      {/* Tooltip al hacer hover */}
      {hovered && (
        <Html position={tooltipOffset} center>
          <div className="bg-purple-900/95 text-white px-4 py-2 rounded-lg border-2 border-purple-400 shadow-lg shadow-purple-500/30 whitespace-nowrap pointer-events-none animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <kbd className="bg-purple-700 px-2 py-0.5 rounded font-bold text-xs">E</kbd>
              <span className="font-medium text-sm">{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
