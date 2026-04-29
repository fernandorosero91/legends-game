import { NPCPlaceholder } from './NPCPlaceholder';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import { useState, useEffect } from 'react';

export function RentCollectorNPC() {
  const currentDay = useGameStore(state => state.currentDay);
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const money = usePlayerStore(state => state.money);
  const payRent = usePlayerStore(state => state.payRent);
  const showDialogue = useUIStore(state => state.showDialogue);
  const [hasCollectedToday, setHasCollectedToday] = useState(false);

  // Aparece solo al atardecer
  const isVisible = timeOfDay === 'evening';

  useEffect(() => {
    // Reset al cambiar de día
    setHasCollectedToday(false);
  }, [currentDay]);

  const handleInteract = () => {
    if (hasCollectedToday) {
      showDialogue({
        character: {
          name: 'El de la Renta',
          portrait: '/images/portraits/rent_collector.png'
        },
        text: 'Ya pagaste hoy. Nos vemos mañana.',
        onContinue: () => {}
      });
      return;
    }

    const rentAmount = 1000;
    
    if (money >= rentAmount) {
      payRent(rentAmount);
      setHasCollectedToday(true);
      
      showDialogue({
        character: {
          name: 'El de la Renta',
          portrait: '/images/portraits/rent_collector.png'
        },
        text: `Perfecto. $${rentAmount} como siempre. Nos vemos mañana.`,
        onContinue: () => {}
      });
    } else {
      showDialogue({
        character: {
          name: 'El de la Renta',
          portrait: '/images/portraits/rent_collector.png'
        },
        text: `¿Dónde está mi dinero? Necesito $${rentAmount}. No me hagas volver.`,
        onContinue: () => {
          // Penalización por no pagar
          usePlayerStore.getState().addReputation(-10);
        }
      });
    }
  };

  if (!isVisible) return null;

  return (
    <NPCPlaceholder
      position={[-2, 0, 3]}
      rotation={[0, Math.PI / 4, 0]}
      scale={1}
      name="El de la Renta"
      color="#ef4444"
      onInteract={handleInteract}
    />
  );
}
