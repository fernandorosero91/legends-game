/**
 * 🎮 LEGENDS: RentCollectorNPC
 * El de la Renta — Solo aparece al atardecer para cobrar la renta.
 * Desaparece una vez que el jugador paga (o al cambiar de turno).
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';
import { useAudioStore } from '@/store/audioStore';

const MODEL_PATH = '/models/npcs/npc_rent_collector.glb';
const IDLE_ANIM = 'Armature|mixamo.com|Layer0';
const RENT_AMOUNT = 1000;

export function RentCollectorNPC() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  const { actions } = useAnimations(animations, group);

  const currentDay = useGameStore((s) => s.currentDay);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const money = usePlayerStore((s) => s.money);

  const [hasCollectedToday, setHasCollectedToday] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [showPayButton, setShowPayButton] = useState(false);
  const [paid, setPaid] = useState(false);

  const isEvening = timeOfDay === 'evening';
  const shouldShow = isEvening && !paid;

  const getDialogueText = (): string => {
    if (hasCollectedToday) {
      return 'Ya pagaste hoy. Nos vemos mañana, artista. 👋';
    }
    if (currentDay === 1) {
      return `¡Hola, artista! Llegó la hora del pago. Son $${RENT_AMOUNT}. ¿Tienes para pagar?`;
    }
    if (currentDay >= 30 || currentLevel >= 4) {
      return `Veo que te va bien. Igual son $${RENT_AMOUNT}. ¿Pagamos?`;
    }
    if (currentDay === 45) {
      return `Felicidades, artista. Última renta: $${RENT_AMOUNT}. *sonríe*`;
    }
    const streak = usePlayerStore.getState().consecutiveDaysWithoutRent;
    if (streak >= 2) {
      return `¡Ya van ${streak} días sin pagar! Son $${RENT_AMOUNT}. ¡AHORA!`;
    }
    return `Hora de pagar. $${RENT_AMOUNT}. Sin excusas.`;
  };

  // Reset al cambiar de día
  useEffect(() => {
    setHasCollectedToday(false);
    setPaid(false);
    setShowBubble(false);
  }, [currentDay]);

  // Play idle animation solo cuando es visible + auto-mostrar diálogo
  useEffect(() => {
    if (!shouldShow) return;

    // Reproducir sonido de aparición
    const { sfxVolume, masterVolume, muted } = useAudioStore.getState();
    if (!muted) {
      const audio = new Audio('/audio/npc_rent.mp3');
      audio.volume = sfxVolume * masterVolume;
      audio.play().catch(() => {});
    }

    const action = actions[IDLE_ANIM];
    if (action) {
      action.reset().fadeIn(0.3).play();
      action.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      const firstKey = Object.keys(actions)[0];
      if (firstKey && actions[firstKey]) {
        actions[firstKey]!.reset().fadeIn(0.3).play();
        actions[firstKey]!.setLoop(THREE.LoopRepeat, Infinity);
      }
    }

    // Auto-mostrar diálogo al aparecer (después de un breve delay para que se vea la entrada)
    const timer = setTimeout(() => {
      const text = getDialogueText();
      setBubbleText(text);
      setShowBubble(true);
      setShowPayButton(!hasCollectedToday);
    }, 800);

    return () => {
      clearTimeout(timer);
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions, shouldShow]);

  // No renderizar si no es atardecer o ya pagó
  if (!shouldShow) {
    return null;
  }

  const handleInteract = () => {
    const text = getDialogueText();
    setBubbleText(text);
    setShowBubble(true);
    setShowPayButton(!hasCollectedToday);
  };

  const handlePay = () => {
    usePlayerStore.getState().payRent(RENT_AMOUNT);
    setHasCollectedToday(true);
    setPaid(true);
    setShowPayButton(false);
    setBubbleText('Perfecto. Nos vemos mañana. 💰');
    useUIStore.getState().addNotification('success', `💰 Renta pagada: -$${RENT_AMOUNT}`);
    setTimeout(() => setShowBubble(false), 3000);
  };

  const handlePayLater = () => {
    usePlayerStore.getState().missRent();
    usePlayerStore.getState().addReputation(-10);
    const streak = usePlayerStore.getState().consecutiveDaysWithoutRent;
    useUIStore.getState().addNotification('error', `❌ No pudiste pagar. Días sin pagar: ${streak}/3`);
    setShowPayButton(false);
    setBubbleText(`Más te vale tener mi dinero mañana... Van ${streak}/3 días. 😤`);
    setTimeout(() => {
      setShowBubble(false);
      setPaid(true); // El NPC se va después de la advertencia
    }, 3000);
  };

  const handleCloseBubble = () => {
    // Si ya pagó o ya dijo "más tarde", puede cerrar libremente
    if (hasCollectedToday || paid) {
      setShowBubble(false);
      setShowPayButton(false);
    }
    // Si no ha pagado, no puede cerrar — debe elegir pagar o "más tarde"
  };

  return (
    <group
      ref={group}
      position={(() => {
        const level = useGameStore.getState().currentLevel;
        const room = useGameStore.getState().currentRoom;
        if (room === 'studio_level_3') return [-3, 0.3, 5] as [number, number, number];
        if (level >= 5) return [4, 0.3, 1] as [number, number, number];
        if (level >= 4) return [15, 0.3, -10] as [number, number, number];
        if (level >= 3) return [5, 0.3, 2] as [number, number, number];
        if (level >= 2) return [3, 0.3, 5] as [number, number, number];
        return [-3, 0.3, 3] as [number, number, number];
      })()}
      rotation={[0, Math.PI / 4, 0]}
      onClick={(e) => {
        e.stopPropagation();
        handleInteract();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clone} scale={13.5} castShadow />

      {/* Mesh invisible de colisión — cubre el cuerpo completo del NPC */}
      <mesh position={[0, 1.0, 0]}>
        <capsuleGeometry args={[0.5, 1.2, 8, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Nombre del NPC + indicador de interacción */}
      {hovered && !showBubble && (
        <Html position={[0, 0.22, 0]} center>
          <div className="bg-red-900/90 text-white px-3 py-1.5 rounded-lg border border-red-400 shadow-lg whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-base">💰</span>
              <span className="font-semibold text-sm">El de la Renta</span>
              <kbd className="bg-red-700/80 px-1.5 py-0.5 rounded text-[10px] font-bold">CLICK</kbd>
            </div>
          </div>
        </Html>
      )}

      {/* Diálogo bubble encima del NPC */}
      {showBubble && (
        <Html position={[0, 0.28, 0]} center>
          <div className="w-64 bg-gray-900/95 backdrop-blur-md border-2 border-red-500/60 rounded-2xl shadow-2xl p-4 pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span className="font-bold text-red-400 text-sm">El de la Renta</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleCloseBubble(); }}
                className={`text-gray-400 hover:text-white text-lg leading-none ${showPayButton ? 'invisible' : ''}`}
              >
                ✕
              </button>
            </div>

            {/* Texto del diálogo */}
            <p className="text-white text-sm leading-relaxed mb-3">
              {bubbleText}
            </p>

            {/* Botones de acción */}
            {showPayButton && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Tu saldo:</span>
                  <span className={money >= RENT_AMOUNT ? 'text-green-400' : 'text-red-400'}>
                    ${money.toLocaleString()}
                  </span>
                </div>
                {money >= RENT_AMOUNT ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePay(); }}
                    className="w-full py-2 px-4 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-500/30"
                  >
                    💰 Pagar ${RENT_AMOUNT.toLocaleString()}
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePayLater(); }}
                    className="w-full py-2 px-4 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  >
                    🙏 Le pago más tarde
                  </button>
                )}
              </div>
            )}

            {/* Cerrar si ya pagó o ya dijo más tarde */}
            {!showPayButton && (
              <button
                onClick={(e) => { e.stopPropagation(); handleCloseBubble(); }}
                className="w-full py-1.5 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-all"
              >
                Cerrar
              </button>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
