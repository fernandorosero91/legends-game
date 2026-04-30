import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

interface RoomProps {
  modelPath?: string;
}

export function Room({ modelPath = '/models/house.glb' }: RoomProps) {
  const hasModel = useMemo(() => {
    try {
      // Intentar cargar el modelo
      const { scene } = useGLTF(modelPath);
      return { hasModel: true, scene };
    } catch (error) {
      console.warn(`Modelo ${modelPath} no encontrado, usando placeholder`);
      return { hasModel: false, scene: null };
    }
  }, [modelPath]);

  if (hasModel.hasModel && hasModel.scene) {
    return <primitive object={hasModel.scene} />;
  }

  // Placeholder: Habitación simple con geometrías básicas
  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>

      {/* Paredes */}
      {/* Pared trasera */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Pared izquierda */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Pared derecha */}
      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f0520" />
      </mesh>

      {/* Decoración: Líneas de neón en las paredes */}
      <mesh position={[0, 3, -9.9]}>
        <boxGeometry args={[18, 0.1, 0.1]} />
        <meshStandardMaterial color="#9333ea" emissive="#9333ea" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
