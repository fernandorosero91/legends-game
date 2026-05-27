import { Html } from '@react-three/drei';
import { useState } from 'react';

interface NPCPlaceholderProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  name: string;
  color?: string;
  onInteract?: () => void;
}

/**
 * Placeholder para NPCs mientras no tenemos los modelos GLB
 * Usa geometrías simples de Three.js
 */
export function NPCPlaceholder({ 
  position, 
  rotation = [0, 0, 0], 
  scale = 1,
  name,
  color = '#9333ea',
  onInteract
}: NPCPlaceholderProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onInteract?.();
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
      {/* Cuerpo - Cápsula */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1, 8, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Cabeza - Esfera */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Indicador de interacción */}
      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-purple-900/95 text-white px-4 py-2 rounded-lg border-2 border-purple-400 shadow-lg whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-700 px-3 py-1 rounded font-bold text-sm">E</kbd>
              <span className="font-medium">Hablar con {name}</span>
            </div>
          </div>
        </Html>
      )}

      {/* Nombre siempre visible */}
      <Html position={[0, 2.2, 0]} center>
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap pointer-events-none">
          {name}
        </div>
      </Html>
    </group>
  );
}
