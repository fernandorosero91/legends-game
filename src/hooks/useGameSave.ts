/**
 * 💾 Hook de Guardado de Partidas
 * 
 * Hook personalizado para gestionar el guardado y carga de partidas.
 * Incluye auto-save, guardado manual y gestión de slots.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { saveService } from '../services/saveService';
import { useGameStore } from '../store/gameStore';
import type { GameSaveDocument } from '../services/insforge';

export interface UseGameSaveReturn {
  // Estado
  isSaving: boolean;
  isLoading: boolean;
  lastSaveTime: number;
  timeSinceLastSave: number;
  error: string | null;
  
  // Acciones
  saveGame: (slotName?: string) => Promise<void>;
  loadGame: (saveId: string) => Promise<void>;
  enableAutoSave: (intervalMinutes?: number) => void;
  disableAutoSave: () => void;
  
  // Información
  canSave: boolean;
  shouldAutoSave: boolean;
}

/**
 * Hook para gestionar guardado de partidas
 */
export const useGameSave = (userId: string | null): UseGameSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const [timeSinceLastSave, setTimeSinceLastSave] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5); // minutos
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gamePhase = useGameStore(state => state.gamePhase);
  
  // Actualizar tiempo desde último guardado
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSaveTime > 0) {
        setTimeSinceLastSave(Date.now() - lastSaveTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastSaveTime]);
  
  /**
   * Guarda la partida actual
   */
  const saveGame = useCallback(async (slotName: string = 'auto') => {
    if (!userId) {
      console.warn('[useGameSave] No hay usuario - no se puede guardar');
      setError('Debes iniciar sesión para guardar');
      return;
    }
    
    if (isSaving) {
      console.warn('[useGameSave] Ya hay un guardado en progreso');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('[useGameSave] 💾 Guardando partida...', slotName);
      
      await saveService.saveGame(userId, slotName);
      
      setLastSaveTime(Date.now());
      console.log('[useGameSave] ✅ Partida guardada');
      
    } catch (err: any) {
      console.error('[useGameSave] ❌ Error al guardar:', err);
      setError(err.message || 'Error al guardar la partida');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [userId, isSaving]);
  
  /**
   * Carga una partida guardada
   */
  const loadGame = useCallback(async (saveId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[useGameSave] 📂 Cargando partida...', saveId);
      
      await saveService.loadGame(saveId);
      
      console.log('[useGameSave] ✅ Partida cargada');
      
    } catch (err: any) {
      console.error('[useGameSave] ❌ Error al cargar:', err);
      setError(err.message || 'Error al cargar la partida');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Habilita el auto-save
   */
  const enableAutoSave = useCallback((intervalMinutes: number = 5) => {
    console.log('[useGameSave] 🔄 Auto-save habilitado:', intervalMinutes, 'minutos');
    
    setAutoSaveEnabled(true);
    setAutoSaveInterval(intervalMinutes);
    
    // Limpiar timer anterior si existe
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    // Configurar nuevo timer
    autoSaveTimerRef.current = setInterval(() => {
      // Solo auto-guardar si está jugando
      if (gamePhase === 'playing' && userId) {
        console.log('[useGameSave] ⏰ Auto-save activado');
        saveGame('auto').catch(err => {
          console.error('[useGameSave] Error en auto-save:', err);
        });
      }
    }, intervalMinutes * 60 * 1000);
    
  }, [gamePhase, userId, saveGame]);
  
  /**
   * Deshabilita el auto-save
   */
  const disableAutoSave = useCallback(() => {
    console.log('[useGameSave] ⏸️ Auto-save deshabilitado');
    
    setAutoSaveEnabled(false);
    
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);
  
  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  // Auto-save al final de cada día
  const currentDay = useGameStore(state => state.currentDay);
  const prevDayRef = useRef(currentDay);
  
  useEffect(() => {
    // Detectar cambio de día
    if (currentDay > prevDayRef.current && userId && gamePhase === 'playing') {
      console.log('[useGameSave] 🌅 Nuevo día detectado - auto-save');
      saveGame('auto').catch(err => {
        console.error('[useGameSave] Error en auto-save diario:', err);
      });
    }
    
    prevDayRef.current = currentDay;
  }, [currentDay, userId, gamePhase, saveGame]);
  
  // Información derivada
  const canSave = userId !== null && !isSaving && gamePhase === 'playing';
  const shouldAutoSave = saveService.shouldAutoSave(autoSaveInterval);
  
  return {
    // Estado
    isSaving,
    isLoading,
    lastSaveTime,
    timeSinceLastSave,
    error,
    
    // Acciones
    saveGame,
    loadGame,
    enableAutoSave,
    disableAutoSave,
    
    // Información
    canSave,
    shouldAutoSave
  };
};

/**
 * Hook para formatear el tiempo desde el último guardado
 */
export const useTimeSinceLastSave = (timeSinceLastSave: number): string => {
  if (timeSinceLastSave === 0) {
    return 'Nunca';
  }
  
  const seconds = Math.floor(timeSinceLastSave / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `Hace ${hours}h ${minutes % 60}m`;
  }
  
  if (minutes > 0) {
    return `Hace ${minutes}m`;
  }
  
  return `Hace ${seconds}s`;
};

/**
 * Hook para mostrar indicador de guardado
 */
export const useSaveIndicator = (isSaving: boolean) => {
  const [showIndicator, setShowIndicator] = useState(false);
  
  useEffect(() => {
    if (isSaving) {
      setShowIndicator(true);
    } else {
      // Mantener el indicador visible por 2 segundos después de guardar
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaving]);
  
  return showIndicator;
};

/**
 * Hook para prevenir cierre de ventana si hay cambios sin guardar
 */
export const usePreventUnsavedClose = (
  hasUnsavedChanges: boolean,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '¿Estás seguro? Tienes cambios sin guardar.';
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, enabled]);
};

/**
 * Hook para guardar automáticamente al salir del juego
 */
export const useSaveOnExit = (userId: string | null, enabled: boolean = true) => {
  const { saveGame } = useGameSave(userId);
  
  useEffect(() => {
    if (!enabled || !userId) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[useSaveOnExit] Pestaña oculta - guardando...');
        saveGame('auto').catch(err => {
          console.error('[useSaveOnExit] Error al guardar:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, enabled, saveGame]);
};

export default useGameSave;
