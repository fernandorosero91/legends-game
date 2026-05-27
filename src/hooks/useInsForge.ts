/**
 * 🔗 LEGENDS: useInsForge Hook
 * Hook para integración con InsForge (Auth, Save/Load, Leaderboard)
 * Usa authStore global para compartir estado de sesión entre componentes
 */

import { useState, useCallback, useEffect } from 'react';
import { insforge, type GameSave, type LeaderboardEntry } from '../services/insforge';
import { saveService } from '../services/saveService';
import { useAuthStore, type AuthUser } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import {
  isOnline,
  cacheUserSession,
  getCachedSession,
  clearCachedSession,
  cacheGameState,
  loadCachedGameState,
  queueSyncOperation,
  syncPendingOperations,
  attachSyncListener,
} from '../services/offlineService';

export type { AuthUser } from '../store/authStore';

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
  // Auth state from global store
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const setSessionChecked = useAuthStore((s) => s.setSessionChecked);

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

  // Verificar sesión al montar (solo una vez globalmente via store)
  useEffect(() => {
    if (!sessionChecked) {
      setSessionChecked(true);
      checkSession();
      attachSyncListener(); // Start offline sync listener
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionChecked]);

  const checkSession = useCallback(async () => {
    // If offline, try to load cached session
    if (!isOnline()) {
      console.log('[useInsForge] Offline — loading cached session');
      const cached = await getCachedSession();
      if (cached) {
        setUser(cached);
        usePlayerStore.getState().setCharacterGender((cached.characterGender || 'male') as 'male' | 'female');
        // Load cached game state
        await loadCachedGameState();
        console.log('[useInsForge] ✅ Offline mode — using cached data for:', cached.username);
      } else {
        setUser(null);
      }
      return;
    }

    try {
      const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
      
      if (userError || !userData?.user) {
        // Online but no session — try cached as fallback
        const cached = await getCachedSession();
        if (cached) {
          setUser(cached);
          await loadCachedGameState();
          console.log('[useInsForge] Session expired but cached data available');
        } else {
          setUser(null);
        }
        return;
      }

      const { data: userRecord, error: recordError } = await insforge.database
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (recordError || !userRecord) {
        const profile = userData.user.profile || {};
        const displayName = (profile as any).name || userData.user.email?.split('@')[0] || 'Player';
        
        const { error: createError } = await insforge.database
          .from('users')
          .insert([{
            id: userData.user.id,
            email: userData.user.email,
            username: displayName,
            character_gender: 'male',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_games_played: 0,
            best_score: 0,
          }]);

        if (createError) {
          setUser(null);
          return;
        }

        setUser({
          id: userData.user.id,
          email: userData.user.email || '',
          username: displayName,
          emailVerified: userData.user.emailVerified || false,
          characterGender: 'male',
          needsCharacterSetup: true,
        });
        return;
      }

      setUser({
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        emailVerified: userData.user.emailVerified || false,
        characterGender: userRecord.character_gender || 'male',
      });

      // Sync character gender to playerStore
      usePlayerStore.getState().setCharacterGender((userRecord.character_gender || 'male') as 'male' | 'female');

      // Try to load the user's latest save if stores are in initial state
      const currentMoney = usePlayerStore.getState().money;
      const currentDay = useGameStore.getState().currentDay;
      if (currentMoney === 5000 && currentDay === 1) {
        // Stores are at initial values — try loading saved game
        try {
          const userSaves = await saveService.getUserSaves(userRecord.id);
          if (userSaves.length > 0) {
            await saveService.loadGame(userSaves[0].id);
            console.log('[useInsForge] ✅ Auto-loaded save for returning user:', userRecord.username);
          }
        } catch {
          // No save found, that's fine
        }
      }

      // Cache session + game state for offline access
      await cacheUserSession({
        id: userRecord.id, email: userRecord.email, username: userRecord.username,
        emailVerified: userData.user.emailVerified || false, characterGender: userRecord.character_gender || 'male',
      });
      await cacheGameState();

      // Sync any pending offline operations
      syncPendingOperations();
    } catch {
      // Online failed — try cached session
      const cached = await getCachedSession();
      if (cached) {
        setUser(cached);
        await loadCachedGameState();
      } else {
        setUser(null);
      }
    }
  }, [setUser]);

  const register = useCallback(async (credentials: { email: string; password: string; username: string; characterGender?: string }) => {
    const { email, password, username, characterGender = 'male' } = credentials;
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await insforge.auth.signUp({
        email, password, name: username,
      });

      if (authError) {
        const msg = authError.message?.toLowerCase() || '';
        if (msg.includes('already') || msg.includes('conflict') || msg.includes('exists') || (authError as any).statusCode === 409) {
          try { await insforge.auth.resendVerificationEmail({ email }); } catch { /* ignore */ }
          return { 
            success: false, requiresVerification: true, userId: '', email, username, characterGender,
            error: 'Ya existe una cuenta con este email. Revisa tu correo o inicia sesión.' 
          };
        }
        return { success: false, error: authError.message };
      }

      if (!authData || !authData.user) {
        return { success: false, error: 'No se pudo crear la cuenta' };
      }

      if (authData.requireEmailVerification) {
        return { 
          success: false, requiresVerification: true, userId: authData.user.id,
          email, username, characterGender,
          error: 'Te enviamos un código de verificación a tu email' 
        };
      }

      const { error: userError } = await insforge.database
        .from('users')
        .insert([{ id: authData.user.id, email, username, character_gender: characterGender,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          total_games_played: 0, best_score: 0 }]);

      if (userError) return { success: false, error: userError.message };

      setUser({ id: authData.user.id, email, username, emailVerified: true, characterGender });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al registrar' };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const verifyEmail = useCallback(async (params: { email: string; otp: string; username: string; characterGender: string; userId: string }) => {
    const { email, otp, username, characterGender, userId } = params;
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });
      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: 'Error al verificar email' };

      let realUserId = (data as any).user?.id || userId;
      if (!realUserId) {
        const { data: currentUser } = await insforge.auth.getCurrentUser();
        realUserId = currentUser?.user?.id;
      }
      if (!realUserId) return { success: false, error: 'No se pudo obtener el ID del usuario' };

      await insforge.database.from('users').insert([{
        id: realUserId, email, username, character_gender: characterGender,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        total_games_played: 0, best_score: 0,
      }]);

      setUser({ id: realUserId, email, username, emailVerified: true, characterGender });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al verificar' };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const updateCharacterGender = useCallback(async (gender: 'male' | 'female') => {
    if (!user) return { success: false, error: 'No hay usuario' };
    try {
      const { error } = await insforge.database
        .from('users')
        .update({ character_gender: gender, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) return { success: false, error: error.message };
      setUser({ ...user, characterGender: gender, needsCharacterSetup: false });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al actualizar' };
    }
  }, [user, setUser]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await insforge.auth.signInWithOAuth({
        provider: 'google', redirectTo: window.location.origin,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error con Google' };
    }
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;
    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data || !data.user) return { success: false, error: 'Error al iniciar sesión' };

      const { data: userData, error: userError } = await insforge.database
        .from('users').select('*').eq('id', data.user.id).single();
      if (userError || !userData) return { success: false, error: 'Error al obtener datos del usuario' };

      // Reset stores before loading new user data
      usePlayerStore.getState().resetPlayer();
      useGameStore.getState().resetGame();
      localStorage.removeItem('legends-player-store');
      localStorage.removeItem('legends-game-store');

      setUser({
        id: userData.id, email: userData.email, username: userData.username,
        emailVerified: true, characterGender: userData.character_gender || 'male',
      });

      // Sync character gender
      usePlayerStore.getState().setCharacterGender((userData.character_gender || 'male') as 'male' | 'female');

      // Try to load the user's latest save automatically
      try {
        const userSaves = await saveService.getUserSaves(userData.id);
        if (userSaves.length > 0) {
          // Load the most recent save
          const latestSave = userSaves[0]; // Already ordered by updated_at desc
          await saveService.loadGame(latestSave.id);
          console.log('[useInsForge] ✅ Loaded latest save for user:', userData.username);
        }
      } catch (loadError) {
        console.log('[useInsForge] No saved game found, starting fresh');
      }

      // Cache for offline access
      await cacheUserSession({
        id: userData.id, email: userData.email, username: userData.username,
        emailVerified: true, characterGender: userData.character_gender || 'male',
      });
      await cacheGameState();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      setSaves([]);
      setSessionChecked(false);
      
      // Clear offline cache
      await clearCachedSession();
      
      // ⚠️ CRITICAL: Reset all game stores to initial state
      // This prevents stale data from previous user showing up
      usePlayerStore.getState().resetPlayer();
      useGameStore.getState().resetGame();
      
      // Clear persisted localStorage for game stores
      localStorage.removeItem('legends-player-store');
      localStorage.removeItem('legends-game-store');
    } catch (error) {
      console.error('[useInsForge] Error logging out:', error);
    }
  }, [setUser, setSessionChecked]);

  const saveGame = useCallback(async (slotName: string = 'auto') => {
    if (!user) return { success: false, error: 'Debes iniciar sesión para guardar' };
    setIsSaving(true);

    // Always cache locally first (instant)
    await cacheGameState();

    // If offline, queue for later sync
    if (!isOnline()) {
      await queueSyncOperation({ type: 'save_game', data: { userId: user.id, slotName } });
      setLastSaveTime(Date.now());
      setIsSaving(false);
      return { success: true };
    }

    try {
      const { data: refreshedUser } = await insforge.auth.getCurrentUser();
      if (!refreshedUser) {
        // Can't reach server — save locally
        await queueSyncOperation({ type: 'save_game', data: { userId: user.id, slotName } });
        setLastSaveTime(Date.now());
        setIsSaving(false);
        return { success: true };
      }

      await saveService.saveGame(user.id, slotName);
      setLastSaveTime(Date.now());
      return { success: true };
    } catch (error: any) {
      // Save failed online — queue for sync
      await queueSyncOperation({ type: 'save_game', data: { userId: user.id, slotName } });
      setLastSaveTime(Date.now());
      return { success: true }; // From user perspective, it saved (locally)
    } finally {
      setIsSaving(false);
    }
  }, [user, setUser, setSessionChecked]);

  const loadGame = useCallback(async (saveId: string) => {
    setIsLoading(true);
    try {
      await saveService.loadGame(saveId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al cargar' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSave = useCallback(async (saveId: string) => {
    try {
      await saveService.deleteSave(saveId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al eliminar' };
    }
  }, []);

  const refreshSaves = useCallback(async () => {
    if (!user) return;
    try {
      const gameSaves = await saveService.getUserSaves(user.id);
      setSaves(gameSaves.map((save: GameSave) => ({
        id: save.id, slotName: save.slot_name,
        gameData: { currentDay: save.current_day, currentLevel: save.current_level,
          monthlyListeners: save.monthly_listeners, money: save.money },
        createdAt: save.created_at, updatedAt: save.updated_at,
      })));
    } catch (error) {
      console.error('[useInsForge] Error refreshing saves:', error);
    }
  }, [user]);

  const submitScore = useCallback(async (scoreData: {
    finalListeners: number; finalDay: number; totalSongs: number; won: boolean;
    finalMoney: number; finalReputation: number; totalJobsCompleted: number;
    perfectSongs: number; collaborations: number;
  }) => {
    if (!user) return { success: false, error: 'Debes iniciar sesión' };
    try {
      const { error } = await insforge.database.from('leaderboard').insert([{
        user_id: user.id, username: user.username,
        final_listeners: scoreData.finalListeners, final_day: scoreData.finalDay,
        total_songs: scoreData.totalSongs, won: scoreData.won,
        completed_at: new Date().toISOString(), final_money: scoreData.finalMoney,
        final_reputation: scoreData.finalReputation,
        total_jobs_completed: scoreData.totalJobsCompleted,
        perfect_songs: scoreData.perfectSongs, collaborations: scoreData.collaborations,
      }]);
      if (error) return { success: false, error: error.message };
      await refreshLeaderboard();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al enviar puntuación' };
    }
  }, [user]);

  const refreshLeaderboard = useCallback(async () => {
    try {
      // Leaderboard dinámico: leer directamente de game_saves + users
      const { data, error } = await insforge.database
        .from('game_saves')
        .select('id, user_id, monthly_listeners, current_day, current_level, total_songs_recorded, money, reputation, updated_at, users(username)')
        .gt('monthly_listeners', 0)
        .order('monthly_listeners', { ascending: false })
        .limit(100);
      if (error) {
        // Fallback: intentar tabla leaderboard estática
        const { data: fallback } = await insforge.database
          .from('leaderboard').select('*').order('final_listeners', { ascending: false }).limit(100);
        if (fallback) setTopPlayers(fallback as LeaderboardEntry[]);
        return;
      }
      // Mapear game_saves a formato LeaderboardEntry
      const entries: LeaderboardEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        username: row.users?.username || 'Jugador',
        final_listeners: row.monthly_listeners,
        final_day: row.current_day,
        total_songs: row.total_songs_recorded,
        won: row.monthly_listeners >= 10000,
        completed_at: row.updated_at,
        final_money: row.money || 0,
        final_reputation: row.reputation || 0,
        total_jobs_completed: 0,
        perfect_songs: 0,
        collaborations: 0,
      }));
      setTopPlayers(entries);
      if (entries.length > 0) {
        const n = entries.length;
        setGlobalStats({
          totalPlayers: n,
          totalWinners: entries.filter((p) => p.won).length,
          averageListeners: Math.round(entries.reduce((s, p) => s + p.final_listeners, 0) / n),
          highestListeners: Math.max(...entries.map((p) => p.final_listeners)),
          averageDays: Math.round(entries.reduce((s, p) => s + p.final_day, 0) / n),
          averageSongs: Math.round(entries.reduce((s, p) => s + p.total_songs, 0) / n),
        });
      }
    } catch { /* ignore */ }
  }, []);

  const getPlayerRank = useCallback(async () => {
    if (!user) return null;
    try {
      const { data, error } = await insforge.database
        .from('leaderboard').select('*').eq('user_id', user.id)
        .order('final_listeners', { ascending: false }).limit(1).single();
      if (error || !data) return null;
      const { data: all } = await insforge.database
        .from('leaderboard').select('final_listeners').order('final_listeners', { ascending: false });
      const rank = (all || []).findIndex((p: any) => p.final_listeners <= data.final_listeners) + 1;
      return { rank, totalPlayers: all?.length || 0, entry: data as LeaderboardEntry };
    } catch { return null; }
  }, [user]);

  return {
    user, isAuthenticated: user !== null, isLoading,
    register, login, loginWithGoogle, logout, verifyEmail, updateCharacterGender,
    saves, isSaving, lastSaveTime, saveGame, loadGame, deleteSave, refreshSaves,
    topPlayers, globalStats, submitScore, refreshLeaderboard, getPlayerRank,
  };
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, register, login, loginWithGoogle, logout, verifyEmail, updateCharacterGender } = useInsForge();
  return { user, isAuthenticated, isLoading, register, login, loginWithGoogle, logout, verifyEmail, updateCharacterGender };
}

export function useSaveSlots() {
  const { saves, isSaving, lastSaveTime, saveGame, loadGame, deleteSave, refreshSaves } = useInsForge();
  return { saves, isSaving, lastSaveTime, saveGame, loadGame, deleteSave, refreshSaves };
}

export function useLeaderboard() {
  const { topPlayers, globalStats, submitScore, refreshLeaderboard, getPlayerRank } = useInsForge();
  return { topPlayers, globalStats, submitScore, refreshLeaderboard, getPlayerRank };
}
