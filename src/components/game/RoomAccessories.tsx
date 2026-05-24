/**
 * 🎮 LEGENDS: RoomAccessories
 * Renderiza dentro de la habitación (room_level1) los accesorios que el
 * jugador ha COMPRADO (presentes en su inventario), cada uno en su posición.
 * Ej: el micrófono aparece sobre la mesa al comprarlo.
 */

import { useMemo, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';
import {
  ACCESSORY_MODELS,
  getAccessoryRoomPlacement,
} from '../../data/accessoryModels';

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
        <Suspense key={itemId} fallback={null}>
          <AccessoryInRoom itemId={itemId} modelPath={ACCESSORY_MODELS[itemId]} />
        </Suspense>
      ))}
    </group>
  );
}

export default RoomAccessories;