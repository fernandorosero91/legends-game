/**
 * LEGENDS: StoreScene — Supermercado / Almacén
 * El jugador camina por el supermercado y trabaja como cajero.
 */

import { Suspense } from 'react';
import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { InteractableZone } from '../components/game/InteractableZone';
import { Supermarket } from '../components/game/Supermarket';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function StoreScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addNotification = useUIStore(state => state.addNotification);

  const handleWork = () => {
    if (energy < 20) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }
    addMoney(350);
    consumeEnergy(20);
    advanceTime();
    addNotification('success', '¡Trabajo completado! +$350');
  };

  const handleExit = () => {
    setCurrentScene('city');
    addNotification('info', 'Volviste a Purple City');
  };

  return (
    <>
      <CameraRig />

      {/* Iluminación — ligera para rendimiento */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.5}
        castShadow={false}
      />

      {/* Modelo 3D del supermercado (carga progresiva) */}
      <Suspense fallback={null}>
        <Supermarket />
      </Suspense>

      {/* 💼 Caja registradora — Trabajar */}
      <InteractableZone
        position={[-10, 1, 5]}
        size={[4, 3, 3]}
        label="Trabajar como Cajero ($350)"
        icon="💼"
        onInteract={handleWork}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* 🚪 Salida */}
      <InteractableZone
        position={[0, 1, -16]}
        size={[5, 4, 3]}
        label="Salir a Purple City"
        icon="🚪"
        onInteract={handleExit}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* Jugador — spawn en zona abierta del supermercado */}
      <Player position={[0, 0.5, 0]} />
    </>
  );
}
