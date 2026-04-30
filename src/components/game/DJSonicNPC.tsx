import { NPCPlaceholder } from './NPCPlaceholder';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';

export function DJSonicNPC() {
  const currentDay = useGameStore(state => state.currentDay);
  const currentLevel = useGameStore(state => state.currentLevel);
  const monthlyListeners = usePlayerStore(state => state.monthlyListeners);
  const showDialogue = useUIStore(state => state.showDialogue);

  const handleInteract = () => {
    let dialogueText = '';

    if (currentDay === 1) {
      dialogueText = 'Oye, ¿qué tal? Escuché que querías hacer música. Tengo algunos beats que podrían funcionarte. ¿Qué dices? Te puedo enseñar cómo funciona esto.';
    } else if (currentLevel === 3 && monthlyListeners < 2000) {
      dialogueText = 'Hermano, vi que las cosas se pusieron difíciles. Todos pasamos por esto. La diferencia entre los que lo logran y los que no es que los que lo logran no se rinden. Tú tienes talento. Sigue adelante.';
    } else if (monthlyListeners >= 5000) {
      dialogueText = '¡Lo sabía! Estás en el camino correcto. Cinco mil personas escuchando tu música. ¿Recuerdas el Día 1? Esto lo construiste tú.';
    } else if (monthlyListeners >= 1000) {
      dialogueText = 'Mil oyentes, hermano. Eso es un hito importante. Sigue así y llegarás lejos.';
    } else {
      dialogueText = '¿Cómo va todo? Recuerda, la consistencia es clave. Sigue grabando y mejorando.';
    }

    showDialogue({
      character: {
        name: 'DJ Sonic',
        portrait: '/images/portraits/dj_sonic.png'
      },
      text: dialogueText,
      onContinue: () => {}
    });
  };

  return (
    <NPCPlaceholder
      position={[5, 0, -2]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={1}
      name="DJ Sonic"
      color="#22d3ee"
      onInteract={handleInteract}
    />
  );
}
