import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function CafeScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const showNotification = useUIStore(state => state.showNotification);
  const showDialogue = useUIStore(state => state.showDialogue);

  const handleWork = () => {
    if (energy < 20) {
      showNotification({
        type: 'warning',
        message: 'No tienes suficiente energía para trabajar',
        duration: 3000
      });
      return;
    }

    // Trabajar como barista
    addMoney(300);
    consumeEnergy(20);
    advanceTime();

    showNotification({
      type: 'success',
      message: '¡Trabajo completado! +$300',
      duration: 3000
    });
  };

  const handleTalkToMarco = () => {
    showDialogue({
      character: {
        name: 'Marco',
        portrait: '/images/portraits/marco.png'
      },
      text: '¡Hola! ¿Quieres trabajar como barista? Te pago $300 por turno. Solo necesitas 20 de energía.',
      onContinue: () => {}
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    showNotification({
      type: 'info',
      message: 'Volviste al apartamento',
      duration: 2000
    });
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente del café */}
      {/* Piso de madera */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Paredes del café */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#d2691e" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#d2691e" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#d2691e" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Decoración: Barra de café */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[8, 2, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Marco (Jefe del café) */}
      <NPCPlaceholder
        position={[2, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Marco"
        color="#f59e0b"
        onInteract={handleTalkToMarco}
      />

      {/* Estación de trabajo */}
      <PropPlaceholder
        type="computer"
        position={[-2, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Trabajar como Barista ($300)"
        onInteract={handleWork}
      />

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