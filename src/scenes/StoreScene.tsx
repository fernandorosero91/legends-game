/**
 * LEGENDS: StoreScene — Supermercado / Almacén
 * El jugador camina por el supermercado y trabaja como cajero.
 */

import { Suspense } from 'react';
import { Html } from '@react-three/drei';
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
  const addNotification = useUIStore(state => state.addNotification);

  const handleWork = () => {
    if (energy < 20) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }
    // Lanzar el minijuego de cajero
    useGameStore.getState().setGamePhase('working');
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

      {/* 💼 Caja registradora — Marcador flotante + zona de interacción */}
      <group position={[-25, 0, 11]}>
        {/* Marcador flotante siempre visible */}
        <Html position={[0, 4, 0]} center zIndexRange={[0, 0]} occlude>
          <div className="flex flex-col items-center animate-bounce pointer-events-none">
            <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
              💼 Trabajar
            </div>
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600" />
          </div>
        </Html>

        {/* Zona clickeable — pequeña y elevada para no bloquear movimiento */}
        <mesh
          position={[0, 3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            handleWork();
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <boxGeometry args={[6, 2, 4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

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
