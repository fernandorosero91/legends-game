/**
 * LEGENDS: StoreScene — Supermercado / Almacén
 * El jugador camina por el supermercado y trabaja como cajero.
 */

import { Suspense, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { InteractableZone } from '../components/game/InteractableZone';
import { Supermarket } from '../components/game/Supermarket';
import { SandraOwner, SANDRA_HIRE_DIALOGUE } from '../components/game/SandraOwner';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { useAudioStore } from '../store/audioStore';
import { useAuthStore } from '../store/authStore';

// Sonido de clic/beep de caja registradora usando Web Audio API
function playBeep(type: 'enter' | 'exit') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    if (type === 'enter') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => ctx.close();
  } catch (_) {}
}

export function StoreScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const energy = usePlayerStore(state => state.energy);
  const addNotification = useUIStore(state => state.addNotification);
  const muted = useAudioStore(state => state.muted);
  const { showDialogue, queueDialogue } = useUIStore();
  const user = useAuthStore(state => state.user);
  const enteredRef = useRef(false);

  // Clave por usuario para que no persista entre cuentas
  const sandraKey = `legends-sandra-intro-${user?.id || 'guest'}`;

  // Sonido + diálogo de Sandra al entrar
  useEffect(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    if (!muted) setTimeout(() => playBeep('enter'), 300);

    const alreadySeen = localStorage.getItem(sandraKey) === 'true';
    if (!alreadySeen) {
      setTimeout(() => {
        showDialogue({
          id: SANDRA_HIRE_DIALOGUE[0].id,
          speaker: SANDRA_HIRE_DIALOGUE[0].speaker,
          text: SANDRA_HIRE_DIALOGUE[0].text,
        });
        SANDRA_HIRE_DIALOGUE.slice(1).forEach(line => {
          queueDialogue({ id: line.id, speaker: line.speaker, text: line.text });
        });
        // Marcar como visto DESPUÉS de encolar (no antes)
        localStorage.setItem(sandraKey, 'true');
      }, 1200);
    }
  }, [muted, showDialogue, queueDialogue, sandraKey]);

  const handleWork = () => {
    if (energy < 20) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }
    if (!muted) playBeep('enter');
    useGameStore.getState().setGamePhase('working');
  };

  const handleExit = () => {
    if (!muted) playBeep('exit');
    setCurrentScene('city');
    addNotification('info', 'Volviste a Purple City');
  };

  return (
    <>
      <CameraRig />

      {/* Iluminación */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 3]} intensity={0.5} castShadow={false} />

      {/* Modelo 3D del supermercado */}
      <Suspense fallback={null}>
        <Supermarket />
      </Suspense>

      {/* Sandra — dueña del supermercado */}
      <Suspense fallback={null}>
        <SandraOwner position={[-29, 0.1, 10]} rotation={[0, Math.PI * 0.5, 0]} />
      </Suspense>

      {/* 💼 Caja registradora */}
      <group position={[-25, 0, 11]}>
        <Html position={[0, 4, 0]} center zIndexRange={[10, 10]}>
          <div
            className="flex flex-col items-center pointer-events-none"
            style={{ animation: 'floatBadge 2s ease-in-out infinite' }}
          >
            <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg select-none">
              💼 Trabajar
            </div>
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600" />
          </div>
        </Html>
        <mesh
          position={[0, 3, 0]}
          onClick={(e) => { e.stopPropagation(); handleWork(); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <boxGeometry args={[6, 2, 4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* 🚪 Salida */}
      <InteractableZone
        position={[0, 1, -16]}
        size={[5, 4, 3]}
        label="Salir a Purple City"
        icon="🚪"
        onInteract={handleExit}
        tooltipOffset={[0, 2.5, 0]}
      />

      {/* Jugador */}
      <Player position={[-25, 0.1, 6]} />
    </>
  );
}
