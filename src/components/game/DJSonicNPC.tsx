/**
 * 🎮 LEGENDS: DJ Sonic NPC
 * Mentor musical — aparece en el estudio con animación "talkingonacellphone"
 * Modelo: /models/npcs/dj_sonic.glb
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';

const MODEL_PATH = '/models/npcs/dj_sonic.glb';
const IDLE_ANIM = 'Talking On A Cell Phone';

export function DJSonicNPC() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Fix dark materials — ensure they respond to scene lights
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.isMeshStandardMaterial) {
            mat.needsUpdate = true;
            // If material appears fully black, it might have metalness=1 with no envMap
            if (mat.metalness > 0.9 && !mat.envMap) {
              mat.metalness = 0.3;
              mat.roughness = 0.7;
            }
          }
        }
      }
    });
    return c;
  }, [scene]);
  const { actions } = useAnimations(animations, group);

  const currentDay = useGameStore(state => state.currentDay);
  const currentLevel = useGameStore(state => state.currentLevel);
  const monthlyListeners = usePlayerStore(state => state.monthlyListeners);
  const showDialogue = useUIStore(state => state.showDialogue);

  const [hovered, setHovered] = useState(false);

  // Play idle animation (talkingonacellphone)
  useEffect(() => {
    const action = actions[IDLE_ANIM];
    if (action) {
      action.reset().fadeIn(0.3).play();
      action.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      // Fallback: try first available animation
      const firstKey = Object.keys(actions)[0];
      if (firstKey && actions[firstKey]) {
        actions[firstKey]!.reset().fadeIn(0.3).play();
        actions[firstKey]!.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

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
      id: `dj_sonic_${currentDay}`,
      speaker: 'DJ Sonic',
      text: dialogueText,
      portrait: '/images/portraits/dj_sonic.png',
    });
  };

  return (
    <group
      ref={group}
      position={[-3, 0, 0]}
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
      <primitive object={clone} scale={2.3} castShadow />

      {/* Mesh invisible de colisión */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Nombre + indicador */}
      {hovered && (
        <Html position={[0, 0.22, 0]} center>
          <div className="bg-cyan-900/90 text-white px-3 py-1.5 rounded-lg border border-cyan-400 shadow-lg whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-base">🎧</span>
              <span className="font-semibold text-sm">DJ Sonic</span>
              <kbd className="bg-cyan-700/80 px-1.5 py-0.5 rounded text-[10px] font-bold">CLICK</kbd>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
