import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

export function AcademyScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addNotification = useUIStore(state => state.addNotification);
  const showDialogue = useUIStore(state => state.showDialogue);

  const handleWork = () => {
    if (energy < 20) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }

    // Trabajar como instructor
    addMoney(800);
    consumeEnergy(20);
    advanceTime();

    addNotification('success', '¡Trabajo completado! +$800');
  };

  const handleTalkToDirector = () => {
    showDialogue({
      speaker: 'Director Miguel',
      text: '¡Perfecto! Necesito un instructor de música. Pagas bien la experiencia: $800 por turno. Solo necesitas 20 de energía.',
      portrait: '/images/portraits/director.png'
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    addNotification('info', 'Volviste al apartamento');
  };

  return (
    <>
      <CameraRig />

      {/* Ambiente de la academia */}
      {/* Piso de parquet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>

      {/* Paredes de la academia */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e6e6fa" />
      </mesh>

      {/* Decoración: Escritorio del director */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[6, 2, 1.5]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>

      {/* Director Miguel */}
      <NPCPlaceholder
        position={[2, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Director Miguel"
        color="#8b5cf6"
        onInteract={handleTalkToDirector}
      />

      {/* Aula de música */}
      <PropPlaceholder
        type="computer"
        position={[-3, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Trabajar como Instructor ($800)"
        onInteract={handleWork}
      />

      {/* Piano decorativo */}
      <mesh position={[-6, 0.5, -2]}>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Sillas de estudiantes */}
      <mesh position={[4, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[6, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[4, 0.25, 2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      <mesh position={[6, 0.25, 2]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
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