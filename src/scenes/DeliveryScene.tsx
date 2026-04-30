import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function DeliveryScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addNotification = useUIStore(state => state.addNotification);
  const showDialogue = useUIStore(state => state.showDialogue);

  const handleWork = () => {
    if (energy < 30) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }

    // Trabajar como repartidor
    addMoney(500);
    consumeEnergy(30);
    advanceTime();

    addNotification('success', '¡Trabajo completado! +$500');
  };

  const handleTalkToSupervisor = () => {
    showDialogue({
      speaker: 'Supervisor Luis',
      text: '¡Oye! ¿Quieres trabajar como repartidor? Te pago $500 por turno. Es trabajo físico, necesitas 30 de energía.',
      portrait: '/images/portraits/supervisor.png'
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    addNotification('info', 'Volviste al apartamento');
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente del centro de delivery */}
      {/* Piso de concreto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {/* Paredes del almacén */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Techo metálico */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#708090" />
      </mesh>

      {/* Decoración: Mostrador de dispatch */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[8, 2, 1]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>

      {/* Supervisor Luis */}
      <NPCPlaceholder
        position={[3, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Supervisor Luis"
        color="#06b6d4"
        onInteract={handleTalkToSupervisor}
      />

      {/* Terminal de trabajo */}
      <PropPlaceholder
        type="computer"
        position={[-3, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Trabajar como Repartidor ($500)"
        onInteract={handleWork}
      />

      {/* Cajas de paquetes */}
      <mesh position={[-6, 1, -2]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[6, 1, -2]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[0, 1, 2]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b4513" />
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