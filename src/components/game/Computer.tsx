import { PropPlaceholder } from './PropPlaceholder';
import { useUIStore } from '@/store/uiStore';
import { usePlayerStore } from '@/store/playerStore';

export function Computer() {
  const setCurrentScreen = useUIStore(state => state.setCurrentScreen);
  const energy = usePlayerStore(state => state.energy);
  const showNotification = useUIStore(state => state.showNotification);

  const handleInteract = () => {
    if (energy < 15) {
      showNotification({
        type: 'warning',
        message: 'Estás muy cansado para trabajar',
        duration: 3000
      });
      return;
    }

    // Abrir pantalla de trabajos online
    setCurrentScreen('jobs');
  };

  return (
    <PropPlaceholder
      type="computer"
      position={[2, 0.8, -3]}
      rotation={[0, Math.PI, 0]}
      scale={0.8}
      label="Trabajar Online"
      onInteract={handleInteract}
    />
  );
}
