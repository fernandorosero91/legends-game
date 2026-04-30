import { PropPlaceholder } from './PropPlaceholder';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';

export function Bed() {
  const energy = usePlayerStore(state => state.energy);
  const addEnergy = usePlayerStore(state => state.addEnergy);
  const advanceTime = useGameStore(state => state.advanceTime);
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const showNotification = useUIStore(state => state.showNotification);

  const handleSleep = () => {
    if (timeOfDay !== 'night') {
      showNotification({
        type: 'warning',
        message: 'Solo puedes dormir por la noche',
        duration: 3000
      });
      return;
    }

    if (energy >= 90) {
      showNotification({
        type: 'info',
        message: 'No estás cansado todavía',
        duration: 3000
      });
      return;
    }

    // Dormir restaura energía y avanza al siguiente día
    const energyRestored = 50;
    addEnergy(energyRestored);
    advanceTime(); // Avanza a la mañana del siguiente día

    showNotification({
      type: 'success',
      message: `Dormiste bien. +${energyRestored} energía`,
      duration: 3000
    });
  };

  return (
    <PropPlaceholder
      type="bed"
      position={[-3, 0, -2]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1}
      label="Dormir"
      onInteract={handleSleep}
    />
  );
}
