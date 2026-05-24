/**
 * 🎮 LEGENDS: RoomAccessories
 * Renderiza dentro de la habitación (room_level1) los accesorios que el
 * jugador ha COMPRADO (presentes en su inventario), cada uno en su posición.
 * Ej: el micrófono aparece sobre la mesa al comprarlo.
 *
 * Cada accesorio está envuelto en un ErrorBoundary, de modo que si un GLB
 * concreto falla al cargar (archivo faltante, etc.), solo se omite ese
 * modelo y NO se rompe el resto de la escena.
 */

import { Component, useMemo, Suspense } from 'react';
import type { ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';
import {
  ACCESSORY_MODELS,
  getAccessoryRoomPlacement,
} from '../../data/accessoryModels';

/* ------------------------------------------------------------------ */
/*  Error boundary: aísla fallos de carga de un GLB individual         */
/* ------------------------------------------------------------------ */
class ModelErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[RoomAccessories] No se pudo cargar el modelo "${this.props.name}":`, error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface AccessoryInRoomProps {
  itemId: string;
  modelPath: string;
}

function AccessoryInRoom({ itemId, modelPath }: AccessoryInRoomProps) {
  const { scene } = useGLTF(modelPath);
  const placement = getAccessoryRoomPlacement(itemId);

  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  if (!placement) return null;

  return (
    <primitive
      object={clone}
      position={placement.position}
      rotation={placement.rotation}
      scale={placement.scale}
    />
  );
}

export function RoomAccessories() {
  const inventory = usePlayerStore((s) => s.inventory);

  // Accesorios comprados que (a) están en el inventario y (b) tienen modelo y posición
  const ownedAccessories = useMemo(() => {
    return inventory
      .map((i) => i.itemId)
      .filter(
        (id) => ACCESSORY_MODELS[id] && getAccessoryRoomPlacement(id)
      );
  }, [inventory]);

  if (ownedAccessories.length === 0) return null;

  return (
    <group name="room-accessories">
      {ownedAccessories.map((itemId) => (
        <ModelErrorBoundary key={itemId} name={itemId}>
          <Suspense fallback={null}>
            <AccessoryInRoom itemId={itemId} modelPath={ACCESSORY_MODELS[itemId]} />
          </Suspense>
        </ModelErrorBoundary>
      ))}
    </group>
  );
}

export default RoomAccessories;