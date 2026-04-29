/**
 * 🔗 LEGENDS: useInsForge Hook
 * Hook para integración con InsForge (Auth, Save/Load, Leaderboard)
 * Autor: Fernando (Backend Developer)
 */

import { useState, useCallback, useEffect } from 'react';
import { insforge, type GameSave, type User, type LeaderboardEntry } from '../services/insforge';
import { saveService } from '../services/saveService';

// Tipos
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
}

export interface SaveSlot {
  id: string;
  slotName: string;
  gameData: {
    currentDay: number;
    currentLevel: number;
    monthlyListeners: number;
    money: number;
  };
  createdAt: string;
  updatedAt: string;
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
 * Hook principal de InsForge
 */
export function useInsForge() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalPlayers: 0,
    totalWinners: 0,
    averageListeners: 0,
    highestListeners: 0,
    averageDays: 0,
    averageSongs: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);

  // Verificar sesión al montar
  useEffect(() => {
    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Verifica si hay una sesión activa
   */
  const checkSession = useCallback(async () => {
    try {
      // Obtener el usuario actual
      const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
      
      if (userError || !userData?.user) {
        setUser(null);
        return;
      }

      // Obtener datos adicionales del usuario desde la tabla users
      const { data: userRecord, error: recordError } = await insforge.database
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (recordError || !userRecord) {
        setUser(null);
        return;
      }

      setUser({
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        emailVerified: userData.user.emailVerified || false,
      });

      // Cargar partidas del usuario
      await refreshSaves();
    } catch (error) {
      console.error('[useInsForge] Error checking session:', error);
      setUser(null);
    }
  }, []);

  /**
   * Registra un nuevo usuario
   */
  const register = useCallback(async (credentials: { email: string; password: string; username: string }) => {
    const { email, password, username } = credentials;
    setIsLoading(true);
    try {
      // Registrar en auth
      const { data: authData, error: authError } = await insforge.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData || !authData.user) {
        return { success: false, error: 'Error al crear usuario' };
      }

      // Crear registro en tabla users
      const { error: userError } = await insforge.database
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_games_played: 0,
          best_score: 0,
        }]);

      if (userError) {
        return { success: false, error: userError.message };
      }

      setUser({
        id: authData.user.id,
        email,
        username,
        emailVerified: false,
      });

      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error registering:', error);
      return { success: false, error: error.message || 'Error al registrar' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Inicia sesión
   */
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || !data.user) {
        return { success: false, error: 'Error al iniciar sesión' };
      }

      // Obtener datos del usuario
      const { data: userData, error: userError } = await insforge.database
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Error al obtener datos del usuario' };
      }

      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        emailVerified: true,
      });

      // Cargar partidas del usuario
      await refreshSaves();

      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error logging in:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cierra sesión
   */
  const logout = useCallback(async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setSaves([]);
    } catch (error) {
      console.error('[useInsForge] Error logging out:', error);
    }
  }, []);

  /**
   * Guarda la partida actual
   */
  const saveGame = useCallback(async (slotName: string = 'auto') => {
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para guardar' };
    }

    setIsSaving(true);
    try {
      await saveService.saveGame(user.id, slotName);
      setLastSaveTime(Date.now());
      await refreshSaves();
      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error saving game:', error);
      return { success: false, error: error.message || 'Error al guardar' };
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  /**
   * Carga una partida guardada
   */
  const loadGame = useCallback(async (saveId: string) => {
    setIsLoading(true);
    try {
      await saveService.loadGame(saveId);
      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error loading game:', error);
      return { success: false, error: error.message || 'Error al cargar' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Elimina una partida guardada
   */
  const deleteSave = useCallback(async (saveId: string) => {
    try {
      await saveService.deleteSave(saveId);
      await refreshSaves();
      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error deleting save:', error);
      return { success: false, error: error.message || 'Error al eliminar' };
    }
  }, []);

  /**
   * Recarga las partidas guardadas del usuario
   */
  const refreshSaves = useCallback(async () => {
    if (!user) return;

    try {
      const gameSaves = await saveService.getUserSaves(user.id);
      
      const formattedSaves: SaveSlot[] = gameSaves.map((save: GameSave) => ({
        id: save.id,
        slotName: save.slot_name,
        gameData: {
          currentDay: save.current_day,
          currentLevel: save.current_level,
          monthlyListeners: save.monthly_listeners,
          money: save.money,
        },
        createdAt: save.created_at,
        updatedAt: save.updated_at,
      }));

      setSaves(formattedSaves);
    } catch (error) {
      console.error('[useInsForge] Error refreshing saves:', error);
    }
  }, [user]);

  /**
   * Envía puntuación al leaderboard
   */
  const submitScore = useCallback(async (scoreData: {
    finalListeners: number;
    finalDay: number;
    totalSongs: number;
    won: boolean;
    finalMoney: number;
    finalReputation: number;
    totalJobsCompleted: number;
    perfectSongs: number;
    collaborations: number;
  }) => {
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión' };
    }

    try {
      const { error } = await insforge.database
        .from('leaderboard')
        .insert([{
          user_id: user.id,
          username: user.username,
          final_listeners: scoreData.finalListeners,
          final_day: scoreData.finalDay,
          total_songs: scoreData.totalSongs,
          won: scoreData.won,
          completed_at: new Date().toISOString(),
          final_money: scoreData.finalMoney,
          final_reputation: scoreData.finalReputation,
          total_jobs_completed: scoreData.totalJobsCompleted,
          perfect_songs: scoreData.perfectSongs,
          collaborations: scoreData.collaborations,
        }]);

      if (error) {
        return { success: false, error: error.message };
      }

      await refreshLeaderboard();
      return { success: true };
    } catch (error: any) {
      console.error('[useInsForge] Error submitting score:', error);
      return { success: false, error: error.message || 'Error al enviar puntuación' };
    }
  }, [user]);

  /**
   * Recarga el leaderboard
   */
  const refreshLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await insforge.database
        .from('leaderboard')
        .select('*')
        .order('final_listeners', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[useInsForge] Error loading leaderboard:', error);
        return;
      }

      setTopPlayers((data || []) as LeaderboardEntry[]);

      // Calcular estadísticas globales
      if (data && data.length > 0) {
        const totalPlayers = data.length;
        const totalWinners = data.filter((p: any) => p.won).length;
        const avgListeners = data.reduce((sum: number, p: any) => sum + p.final_listeners, 0) / totalPlayers;
        const highestListeners = Math.max(...data.map((p: any) => p.final_listeners));
        const avgDays = data.reduce((sum: number, p: any) => sum + p.final_day, 0) / totalPlayers;
        const avgSongs = data.reduce((sum: number, p: any) => sum + p.total_songs, 0) / totalPlayers;

        setGlobalStats({
          totalPlayers,
          totalWinners,
          averageListeners: Math.round(avgListeners),
          highestListeners,
          averageDays: Math.round(avgDays),
          averageSongs: Math.round(avgSongs),
        });
      }
    } catch (error) {
      console.error('[useInsForge] Error refreshing leaderboard:', error);
    }
  }, []);

  /**
   * Obtiene el ranking del jugador
   */
  const getPlayerRank = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await insforge.database
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .order('final_listeners', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      // Obtener ranking
      const { data: allPlayers } = await insforge.database
        .from('leaderboard')
        .select('final_listeners')
        .order('final_listeners', { ascending: false });

      const rank = (allPlayers || []).findIndex((p: any) => p.final_listeners <= data.final_listeners) + 1;

      return {
        rank,
        totalPlayers: allPlayers?.length || 0,
        entry: data as LeaderboardEntry,
      };
    } catch (error) {
      console.error('[useInsForge] Error getting player rank:', error);
      return null;
    }
  }, [user]);

  return {
    // Estado de autenticación
    user,
    isAuthenticated: user !== null,
    isLoading,
    
    // Funciones de autenticación
    register,
    login,
    logout,
    
    // Estado de guardado
    saves,
    isSaving,
    lastSaveTime,
    
    // Funciones de guardado
    saveGame,
    loadGame,
    deleteSave,
    refreshSaves,
    
    // Estado de leaderboard
    topPlayers,
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
  const { topPlayers, globalStats, submitScore, refreshLeaderboard, getPlayerRank } = useInsForge();
  
  return {
    topPlayers,
    globalStats,
    submitScore,
    refreshLeaderboard,
    getPlayerRank,
  };
}