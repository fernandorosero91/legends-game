import { Html } from '@react-three/drei';
import { useState } from 'react';

interface PropPlaceholderProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type: 'bed' | 'computer' | 'mic' | 'door' | 'sofa';
  label: string;
  onInteract?: () => void;
}

/**
 * Placeholder para props interactuables mientras no tenemos los modelos GLB
 */
export function PropPlaceholder({ 
  position, 
  rotation = [0, 0, 0], 
  scale = 1,
  type,
  label,
  onInteract
}: PropPlaceholderProps) {
  const [hovered, setHovered] = useState(false);

  const getGeometry = () => {
    switch (type) {
      case 'bed':
        return (
          <group>
            {/* Base de la cama */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[2, 0.6, 3]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
            {/* Almohada */}
            <mesh position={[0, 0.7, -1]} castShadow>
              <boxGeometry args={[1.5, 0.3, 0.8]} />
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
          </group>
        );

      case 'computer':
        return (
          <group>
            {/* Monitor */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.8, 0.6, 0.1]} />
              <meshStandardMaterial color="#1a0a2e" emissive="#9333ea" emissiveIntensity={0.5} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[1, 0.05, 0.6]} />
              <meshStandardMaterial color="#2d1b4e" />
            </mesh>
          </group>
        );

      case 'mic':
        return (
          <group>
            {/* Micrófono */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
              <meshStandardMaterial color="#c4b5fd" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Soporte */}
            <mesh position={[0, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
              <meshStandardMaterial color="#2d1b4e" />
            </mesh>
          </group>
        );

      case 'door':
        return (
          <group>
            {/* Puerta */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[1.2, 3, 0.1]} />
              <meshStandardMaterial color="#1a0a2e" />
            </mesh>
            {/* Manija */}
            <mesh position={[0.4, 1.2, 0.1]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );

      case 'sofa':
        return (
          <group>
            {/* Asiento */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <boxGeometry args={[2, 0.4, 1]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
            {/* Respaldo */}
            <mesh position={[0, 0.9, -0.4]} castShadow>
              <boxGeometry args={[2, 1, 0.2]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
            {/* Brazos */}
            <mesh position={[-0.9, 0.7, 0]} castShadow>
              <boxGeometry args={[0.2, 0.6, 1]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
            <mesh position={[0.9, 0.7, 0]} castShadow>
              <boxGeometry args={[0.2, 0.6, 1]} />
              <meshStandardMaterial color="#4a2c7a" />
            </mesh>
          </group>
        );

      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#9333ea" />
          </mesh>
        );
    }
  };

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
      {getGeometry()}

      {/* Indicador de interacción */}
      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-purple-900/95 text-white px-4 py-2 rounded-lg border-2 border-purple-400 shadow-lg whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <kbd className="bg-purple-700 px-3 py-1 rounded font-bold text-sm">E</kbd>
              <span className="font-medium">{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
