import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function StoreScene() {
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

    // Trabajar como cajero
    addMoney(350);
    consumeEnergy(20);
    advanceTime();

    showNotification({
      type: 'success',
      message: '¡Trabajo completado! +$350',
      duration: 3000
    });
  };

  const handleTalkToDaniela = () => {
    showDialogue({
      character: {
        name: 'Daniela',
        portrait: '/images/portraits/daniela.png'
      },
      text: '¡Hey! ¿Buscas trabajo? Necesito un cajero. Te pago $350 por turno y solo necesitas 20 de energía.',
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

      {/* Ambiente de la tienda */}
      {/* Piso de tienda */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Paredes de la tienda */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>

      {/* Decoración: Mostrador */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[6, 2, 1]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      {/* Daniela (Jefa de la tienda) */}
      <NPCPlaceholder
        position={[2, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Daniela"
        color="#22c55e"
        onInteract={handleTalkToDaniela}
      />

      {/* Caja registradora */}
      <PropPlaceholder
        type="computer"
        position={[-2, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Trabajar como Cajero ($350)"
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