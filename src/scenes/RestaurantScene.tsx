import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function RestaurantScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addNotification = useUIStore(state => state.addNotification);
  const showDialogue = useUIStore(state => state.showDialogue);

  const handleWork = () => {
    if (energy < 25) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }

    // Trabajar como mesero
    addMoney(400);
    consumeEnergy(25);
    advanceTime();

    addNotification('success', '¡Trabajo completado! +$400');
  };

  const handleTalkToChef = () => {
    showDialogue({
      speaker: 'Chef Carlos',
      text: '¡Hola! ¿Quieres trabajar como mesero? Te pago $400 por turno. Necesitas 25 de energía.',
      portrait: '/images/portraits/chef.png'
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    addNotification('info', 'Volviste al apartamento');
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente del restaurante */}
      {/* Piso de baldosas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Paredes del restaurante */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#cd853f" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#cd853f" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#cd853f" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>

      {/* Decoración: Barra del restaurante */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[10, 2, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Chef Carlos */}
      <NPCPlaceholder
        position={[3, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Chef Carlos"
        color="#ef4444"
        onInteract={handleTalkToChef}
      />

      {/* Estación de mesero */}
      <PropPlaceholder
        type="computer"
        position={[-3, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Trabajar como Mesero ($400)"
        onInteract={handleWork}
      />

      {/* Mesas del restaurante */}
      <mesh position={[-5, 0.5, -2]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[5, 0.5, -2]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Puerta de salida */}
      <PropPlaceholder
        type="door"
        position={[0, 0, 8]}
        rotation={[0, Math.PI, 0]}
        scale={1}
        label="Volver al Apartamento"
        onInteract={handleExit}
      />

      {/* Jugador */}
      <Player position={[0, 0, 0]} />
    </>
  );
}