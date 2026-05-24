import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { isRestaurantOnCooldown, getRestaurantCooldownRemaining } from '../components/ui/RestaurantTimer';

export function CityScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const currentLevel = useGameStore(state => state.currentLevel);
  const addNotification = useUIStore(state => state.addNotification);

  const handleGoToLocation = (location: string) => {
    // Restaurant cooldown check
    if (location === 'restaurant' && isRestaurantOnCooldown()) {
      const remaining = getRestaurantCooldownRemaining();
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      addNotification('warning', `Vuelve a tomar otro turno en ${min > 0 ? `${min}m ` : ''}${sec}s`);
      return;
    }

    setCurrentScene(location as any);
    addNotification('info', `Entrando a ${location}...`);
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente de la ciudad */}
      {/* Suelo de asfalto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>

      {/* Cielo nocturno */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 20, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Edificios de fondo */}
      <mesh position={[-15, 5, -15]}>
        <boxGeometry args={[5, 10, 5]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      <mesh position={[15, 7, -15]}>
        <boxGeometry args={[4, 14, 4]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      <mesh position={[0, 6, -18]}>
        <boxGeometry args={[6, 12, 3]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>

      {/* Entradas a los lugares */}
      <PropPlaceholder
        type="door"
        position={[-8, 0, -5]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Café Purple Beans"
        onInteract={() => handleGoToLocation('cafe')}
      />

      <PropPlaceholder
        type="door"
        position={[8, 0, -5]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Almacén StreetWear"
        onInteract={() => handleGoToLocation('store')}
      />

      <PropPlaceholder
        type="door"
        position={[0, 0, -8]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Purple Sound Shop"
        onInteract={() => handleGoToLocation('shop')}
      />

      <PropPlaceholder
        type="door"
        position={[-10, 0, 5]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Restaurante La Esquina"
        onInteract={() => handleGoToLocation('restaurant')}
      />

      <PropPlaceholder
        type="door"
        position={[10, 0, 5]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Delivery Express"
        onInteract={() => handleGoToLocation('delivery')}
      />

      <PropPlaceholder
        type="door"
        position={[-6, 0, 8]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Bar Neon Nights"
        onInteract={() => handleGoToLocation('bar')}
      />

      <PropPlaceholder
        type="door"
        position={[6, 0, 8]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Academia SoundWave"
        onInteract={() => handleGoToLocation('academy')}
      />

      {/* Volver al apartamento */}
      <PropPlaceholder
        type="door"
        position={[0, 0, 12]}
        rotation={[0, Math.PI, 0]}
        scale={1.5}
        label="Volver al Apartamento"
        onInteract={() => handleGoToLocation('apartment')}
      />

      {/* Farolas de la ciudad */}
      <mesh position={[-5, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[-5, 6, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="#ffff99" emissive="#ffff99" emissiveIntensity={2} />
      </mesh>

      <mesh position={[5, 3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[5, 6, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="#ffff99" emissive="#ffff99" emissiveIntensity={2} />
      </mesh>

      {/* Jugador */}
      <Player position={[0, 0, 0]} />
    </>
  );
}