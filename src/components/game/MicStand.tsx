import { PropPlaceholder } from './PropPlaceholder';
import { useUIStore } from '@/store/uiStore';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';

export function MicStand() {
  const energy = usePlayerStore(state => state.energy);
  const addNotification = useUIStore(state => state.addNotification);
  const setGamePhase = useGameStore(state => state.setGamePhase);

  const handleInteract = () => {
    if (energy < 30) {
      addNotification('warning', 'Necesitas al menos 30 de energía para grabar 🎤');
      return;
    }

    // Abrir selección de beat → minijuego rítmico
    setGamePhase('rhythm_game');
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
