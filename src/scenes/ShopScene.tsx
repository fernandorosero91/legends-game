import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export function ShopScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const setCurrentScreen = useUIStore(state => state.setCurrentScreen);
  const showDialogue = useUIStore(state => state.showDialogue);
  const showNotification = useUIStore(state => state.showNotification);

  const handleOpenShop = () => {
    setCurrentScreen('shop');
  };

  const handleTalkToVendor = () => {
    showDialogue({
      character: {
        name: 'Vendedor',
        portrait: '/images/portraits/vendor.png'
      },
      text: '¡Bienvenido a Purple Sound Shop! Aquí encontrarás todo lo que necesitas para sonar como un profesional. ¿Qué te interesa?',
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

      {/* Ambiente de la tienda de música */}
      {/* Piso de madera oscura */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4a2c2a" />
      </mesh>

      {/* Paredes púrpura */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#581c87" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#581c87" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#581c87" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3b0764" />
      </mesh>

      {/* Decoración: Mostrador de la tienda */}
      <mesh position={[0, 1, -8]}>
        <boxGeometry args={[8, 2, 1]} />
        <meshStandardMaterial color="#7c3aed" />
      </mesh>

      {/* Líneas de neón */}
      <mesh position={[0, 3, -9.9]}>
        <boxGeometry args={[18, 0.1, 0.1]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
      </mesh>

      {/* Vendedor */}
      <NPCPlaceholder
        position={[2, 0, -7]}
        rotation={[0, 0, 0]}
        scale={1}
        name="Vendedor"
        color="#a855f7"
        onInteract={handleTalkToVendor}
      />

      {/* Catálogo de productos */}
      <PropPlaceholder
        type="computer"
        position={[-2, 1, -7]}
        rotation={[0, 0, 0]}
        scale={0.8}
        label="Abrir Tienda"
        onInteract={handleOpenShop}
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