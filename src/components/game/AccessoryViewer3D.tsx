/**
 * 🎮 LEGENDS: AccessoryViewer3D
 * Visor 3D reutilizable para mostrar el modelo GLB de un accesorio.
 * Rota automáticamente y centra/encuadra el modelo. Usado en el carrito.
 */

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stage, OrbitControls, Center } from '@react-three/drei';
import type { Group } from 'three';
import { getAccessoryModel } from '../../data/accessoryModels';

interface AccessoryModelProps {
  modelPath: string;
  autoRotate?: boolean;
}

function AccessoryModel({ modelPath, autoRotate = true }: AccessoryModelProps) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clonamos para poder mostrar el mismo modelo en varios sitios
  const cloned = scene.clone();

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.6;
    }
  });

  return (
    <Center>
      <group ref={group}>
        <primitive object={cloned} />
      </group>
    </Center>
  );
}

interface AccessoryViewer3DProps {
  itemId: string;
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
}

export function AccessoryViewer3D({
  itemId,
  className = '',
  autoRotate = true,
  interactive = false,
}: AccessoryViewer3DProps) {
  const modelPath = getAccessoryModel(itemId);

  // Si no hay modelo para este accesorio, no renderizamos el canvas
  if (!modelPath) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Stage
            environment="city"
            intensity={0.5}
            adjustCamera={false}
            shadows={false}
          >
            <AccessoryModel modelPath={modelPath} autoRotate={autoRotate} />
          </Stage>
        </Suspense>
        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        )}
      </Canvas>
    </div>
  );
}

export default AccessoryViewer3D;