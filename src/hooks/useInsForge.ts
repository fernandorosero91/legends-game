/**
 * 🔗 LEGENDS: useInsForge Hook (Simplified)
 * Hook simplificado para desarrollo sin InsForge
 */

import { useState, useCallback } from 'react';

// Tipos simplificados
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface SaveSlot {
  id: string;
  slotName: string;
  gameData: {
    currentDay: number;
    currentLevel: number;
    monthlyListeners: number;
  };
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  finalListeners: number;
  won: boolean;
}

export interface GlobalStats {
  totalPlayers: number;
  totalWinners: number;
  averageListeners: number;
  highestListeners: number;
  averageDays: number;
  averageSongs: number;
}

/**
 * Hook principal de InsForge (Mock)
 */
export function useInsForge() {
  const [user] = useState<AuthUser | null>(null);
  const [saves] = useState<SaveSlot[]>([]);
  const [topPlayers] = useState<LeaderboardEntry[]>([]);
  const [globalStats] = useState<GlobalStats>({
    totalPlayers: 0,
    totalWinners: 0,
    averageListeners: 0,
    highestListeners: 0,
    averageDays: 0,
    averageSongs: 0,
  });

  const register = useCallback(async () => {
    console.log('[useInsForge] Mock register');
    return { success: false, error: 'Mock mode' };
  }, []);

  const login = useCallback(async () => {
    console.log('[useInsForge] Mock login');
    return { success: false, error: 'Mock mode' };
  }, []);

  const logout = useCallback(async () => {
    console.log('[useInsForge] Mock logout');
  }, []);

  const saveGame = useCallback(async () => {
    console.log('[useInsForge] Mock saveGame');
    return { success: false, error: 'Mock mode' };
  }, []);

  const loadGame = useCallback(async () => {
    console.log('[useInsForge] Mock loadGame');
    return { success: false, error: 'Mock mode' };
  }, []);

  const deleteSave = useCallback(async () => {
    console.log('[useInsForge] Mock deleteSave');
    return { success: false, error: 'Mock mode' };
  }, []);

  const refreshSaves = useCallback(async () => {
    console.log('[useInsForge] Mock refreshSaves');
  }, []);

  const submitScore = useCallback(async () => {
    console.log('[useInsForge] Mock submitScore');
    return { success: false, error: 'Mock mode' };
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    console.log('[useInsForge] Mock refreshLeaderboard');
  }, []);

  const getPlayerRank = useCallback(async () => {
    console.log('[useInsForge] Mock getPlayerRank');
  }, []);

  return {
    // Estado de autenticación
    user,
    isAuthenticated: false,
    isLoading: false,
    
    // Funciones de autenticación
    register,
    login,
    logout,
    
    // Estado de guardado
    saves,
    isSaving: false,
    lastSaveTime: null,
    
    // Funciones de guardado
    saveGame,
    loadGame,
    deleteSave,
    refreshSaves,
    
    // Estado de leaderboard
    topPlayers,
    playerRank: { rank: 0, totalPlayers: 0, entry: null },
    globalStats,
    
    // Funciones de leaderboard
    submitScore,
    refreshLeaderboard,
    getPlayerRank,
  };
}

/**
 * Hook específico para autenticación
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, register, login, logout } = useInsForge();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
  };
}

/**
 * Hook específico para guardado de partidas
 */
export function useSaveSlots() {
  const { saves, isSaving, lastSaveTime, saveGame, loadGame, deleteSave, refreshSaves } = useInsForge();
  
  return {
    saves,
    isSaving,
    lastSaveTime,
    saveGame,
    loadGame,
    deleteSave,
    refreshSaves,
  };
}

/**
 * Hook específico para leaderboard
 */
export function useLeaderboard() {
  const { topPlayers, playerRank, globalStats, submitScore, refreshLeaderboard, getPlayerRank } = useInsForge();
  
  return {
    topPlayers,
    playerRank,
    globalStats,
    submitScore,
    refreshLeaderboard,
    getPlayerRank,
  };
}