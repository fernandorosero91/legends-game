/**
 * 🎮 LEGENDS: Game Initializer
 * Componente que maneja la inicialización del juego y la transición al menú principal
 * Autor: Felipe (Integration)
 */

import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '../hooks/useInsForge';

export function GameInitializer() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  useEffect(() => {
    // Solo cambiar a loading si no está ya en una pantalla válida
    if (currentScreen === 'loading') {
      console.log('[GameInitializer] Initializing - screen is on loading');
    }
  }, [currentScreen]);

  return null;
}