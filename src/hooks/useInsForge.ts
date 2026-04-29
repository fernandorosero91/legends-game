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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionChecked]);

  const checkSession = useCallback(async () => {
    try {
      const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
      
      if (userError || !userData?.user) {
        setUser(null);
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
    } catch {
      setUser(null);
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

      setUser({
        id: userData.id, email: userData.email, username: userData.username,
        emailVerified: true, characterGender: userData.character_gender || 'male',
      });
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
      // Reset session check so it re-checks on next login
      setSessionChecked(false);
    } catch (error) {
      console.error('[useInsForge] Error logging out:', error);
    }
  }, [setUser, setSessionChecked]);

  const saveGame = useCallback(async (slotName: string = 'auto') => {
    if (!user) return { success: false, error: 'Debes iniciar sesión para guardar' };
    setIsSaving(true);
    try {
      await saveService.saveGame(user.id, slotName);
      setLastSaveTime(Date.now());
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al guardar' };
    } finally {
      setIsSaving(false);
    }
  }, [user]);

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
      const { data, error } = await insforge.database
        .from('leaderboard').select('*').order('final_listeners', { ascending: false }).limit(100);
      if (error) return;
      setTopPlayers((data || []) as LeaderboardEntry[]);
      if (data && data.length > 0) {
        const n = data.length;
        setGlobalStats({
          totalPlayers: n,
          totalWinners: data.filter((p: any) => p.won).length,
          averageListeners: Math.round(data.reduce((s: number, p: any) => s + p.final_listeners, 0) / n),
          highestListeners: Math.max(...data.map((p: any) => p.final_listeners)),
          averageDays: Math.round(data.reduce((s: number, p: any) => s + p.final_day, 0) / n),
          averageSongs: Math.round(data.reduce((s: number, p: any) => s + p.total_songs, 0) / n),
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
