import { PropPlaceholder } from './PropPlaceholder';
import { useUIStore } from '@/store/uiStore';
import { usePlayerStore } from '@/store/playerStore';

export function MicStand() {
  const setCurrentScreen = useUIStore(state => state.setCurrentScreen);
  const energy = usePlayerStore(state => state.energy);
  const showNotification = useUIStore(state => state.showNotification);

  const handleInteract = () => {
    if (energy < 30) {
      showNotification({
        type: 'warning',
        message: 'Necesitas al menos 30 de energía para grabar',
        duration: 3000
      });
      return;
    }

    // Abrir minijuego rítmico
    setCurrentScreen('rhythm');
  };

  return (
    <PropPlaceholder
      type="mic"
      position={[0, 0, -4]}
      rotation={[0, 0, 0]}
      scale={1}
      label="Grabar Canción"
      onInteract={handleInteract}
    />
  );
}
