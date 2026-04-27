import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function BarScene() {
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

    // Trabajar como DJ
    addMoney(600);
    consumeEnergy(25);
    advanceTime();

    addNotification('success', '¡Trabajo completado! +$600');
  };

  const handleTalkToManager = () => {
    showDialogue({
      speaker: 'Manager Rosa',
      text: '¡Hey! ¿Sabes mezclar música? Necesito un DJ para esta noche. Te pago $600 por turno. Solo necesitas 25 de energía.',
      portrait: '/images/portraits/manager.png'
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    addNotification('info', 'Volviste al apartamento');
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente del bar */}
      {/* Piso oscuro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>

      {/* Paredes del bar */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f051a" />
      </mesh>

      {/* Decoración: Barra del bar */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[12, 2, 1]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      {/* Luces de neón */}
      <mesh position={[0, 3.5, -9.9]}>
        <boxGeometry args={[16, 0.2, 0.1]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={3} />
      </mesh>

      <mesh position={[-9.9, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.2, 0.1]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={3} />
      </mesh>

      {/* Manager Rosa */}
      <NPCPlaceholder
        position={[4, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Manager Rosa"
        color="#ec4899"
        onInteract={handleTalkToManager}
      />

      {/* Cabina de DJ */}
      <PropPlaceholder
        type="computer"
        position={[-4, 1, -7]}
        rotation={[0, 0, 0]}
        scale={1.2}
        label="Trabajar como DJ ($600)"
        onInteract={handleWork}
      />

      {/* Mesas del bar */}
      <mesh position={[-6, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a2c7a" />
      </mesh>

      <mesh position={[6, 0.5, 0]}>
        <cylinderGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a2c7a" />
      </mesh>

      <mesh position={[0, 0.5, 4]}>
        <cylinderGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a2c7a" />
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