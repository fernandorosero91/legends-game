import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { PropPlaceholder } from '../components/game/PropPlaceholder';
import { NPCPlaceholder } from '../components/game/NPCPlaceholder';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useEffect, useState } from 'react';

export const ApartmentScene = () => {
  const currentDay = useGameStore(state => state.currentDay);
  const timeOfDay = useGameStore(state => state.timeOfDay);
  const currentScene = useGameStore(state => state.currentScene);
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const money = usePlayerStore(state => state.money);
  const addEnergy = usePlayerStore(state => state.addEnergy);
  const payRent = usePlayerStore(state => state.payRent);
  const advanceTime = useGameStore(state => state.advanceTime);
  const setCurrentScreen = useUIStore(state => state.setCurrentScreen);
  const showNotification = useUIStore(state => state.showNotification);
  const showDialogue = useUIStore(state => state.showDialogue);
  
  const [hasCollectedToday, setHasCollectedToday] = useState(false);

  useEffect(() => {
    setHasCollectedToday(false);
  }, [currentDay]);

  // Handler para dormir
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

    const energyRestored = 50;
    addEnergy(energyRestored);
    advanceTime();

    showNotification({
      type: 'success',
      message: `Dormiste bien. +${energyRestored} energía`,
      duration: 3000
    });
  };

  // Handler para computador
  const handleComputer = () => {
    if (energy < 15) {
      showNotification({
        type: 'warning',
        message: 'Estás muy cansado para trabajar',
        duration: 3000
      });
      return;
    }
    setCurrentScreen('job_select');
  };

  // Handler para micrófono
  const handleMic = () => {
    if (energy < 30) {
      showNotification({
        type: 'warning',
        message: 'Necesitas al menos 30 de energía para grabar',
        duration: 3000
      });
      return;
    }
    setCurrentScreen('rhythm');
  };

  // Handler para puerta
  const handleDoor = () => {
    if (currentScene === 'apartment') {
      setCurrentScene('city');
      showNotification({
        type: 'info',
        message: 'Saliste a Purple City',
        duration: 2000
      });
    } else {
      setCurrentScene('apartment');
      showNotification({
        type: 'info',
        message: 'Volviste al apartamento',
        duration: 2000
      });
    }
  };

  // Handler para El de la Renta
  const handleRentCollector = () => {
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
          usePlayerStore.getState().addReputation(-10);
        }
      });
    }
  };

  // Handler para DJ Sonic
  const handleDJSonic = () => {
    let dialogueText = '';

    if (currentDay === 1) {
      dialogueText = 'Oye, ¿qué tal? Escuché que querías hacer música. Tengo algunos beats que podrían funcionarte. ¿Qué dices? Te puedo enseñar cómo funciona esto.';
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
    <>
      <CameraRig />

      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d1b4e" />
      </mesh>

      {/* Paredes */}
      <mesh position={[0, 2.5, -10]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a2e" />
      </mesh>

      {/* Techo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f0520" />
      </mesh>

      {/* Línea de neón decorativa */}
      <mesh position={[0, 3, -9.9]}>
        <boxGeometry args={[18, 0.1, 0.1]} />
        <meshStandardMaterial color="#9333ea" emissive="#9333ea" emissiveIntensity={2} />
      </mesh>

      {/* Props interactuables */}
      <PropPlaceholder
        type="bed"
        position={[-3, 0, -2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1}
        label="Dormir"
        onInteract={handleSleep}
      />

      <PropPlaceholder
        type="computer"
        position={[2, 0.8, -3]}
        rotation={[0, Math.PI, 0]}
        scale={0.8}
        label="Trabajar Online"
        onInteract={handleComputer}
      />

      <PropPlaceholder
        type="mic"
        position={[0, 0, -4]}
        rotation={[0, 0, 0]}
        scale={1}
        label="Grabar Canción"
        onInteract={handleMic}
      />

      <PropPlaceholder
        type="door"
        position={[0, 0, 5]}
        rotation={[0, 0, 0]}
        scale={1}
        label="Salir a la Ciudad"
        onInteract={handleDoor}
      />

      {/* NPCs */}
      {timeOfDay === 'evening' && (
        <NPCPlaceholder
          position={[-2, 0, 3]}
          rotation={[0, Math.PI / 4, 0]}
          scale={1}
          name="El de la Renta"
          color="#ef4444"
          onInteract={handleRentCollector}
        />
      )}

      <NPCPlaceholder
        position={[5, 0, -2]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={1}
        name="DJ Sonic"
        color="#22d3ee"
        onInteract={handleDJSonic}
      />

      {/* Jugador */}
      <Player position={[0, 0, 0]} />
    </>
  );
};
