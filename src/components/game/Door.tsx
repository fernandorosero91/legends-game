import { PropPlaceholder } from './PropPlaceholder';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';

export function Door() {
  const currentScene = useGameStore(state => state.currentScene);
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const showNotification = useUIStore(state => state.showNotification);

  const handleInteract = () => {
    if (currentScene === 'apartment') {
      // Salir a la ciudad
      setCurrentScene('city');
      showNotification({
        type: 'info',
        message: 'Saliste a Purple City',
        duration: 2000
      });
    } else {
      // Volver al apartamento
      setCurrentScene('apartment');
      showNotification({
        type: 'info',
        message: 'Volviste al apartamento',
        duration: 2000
      });
    }
  };

  return (
    <PropPlaceholder
      type="door"
      position={[0, 0, 5]}
      rotation={[0, 0, 0]}
      scale={1}
      label={currentScene === 'apartment' ? 'Salir a la Ciudad' : 'Volver al Apartamento'}
      onInteract={handleInteract}
    />
  );
}
