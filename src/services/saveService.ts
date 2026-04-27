/**
 * 💾 LEGENDS: Save Service
 * Servicio para guardar y cargar partidas en InsForge
 * Autor: Fernando (Backend Developer)
 */

import { insforge, type GameSave } from './insforge';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useJobStore } from '../store/jobStore';
import { useShopStore } from '../store/shopStore';

export interface SaveGameData {
  // Estado del juego
  currentDay: number;
  currentLevel: number;
  timeOfDay: string;
  gamePhase: string;
  unlockedFeatures: string[];
  
  // Estado del jugador
  money: number;
  energy: number;
  hunger: number;
  monthlyListeners: number;
  reputation: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  totalSongsRecorded: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  consecutiveDaysWithoutRent: number;
  
  // Datos complejos (JSONB)
  songs: any[];
  inventory: any[];
  dialogueFlags: Record<string, any>;
  jobHistory: any[];
  statistics: Record<string, any>;
}

/**
 * Servicio de guardado de partidas
 */
class SaveService {
  private lastSaveTime: number = 0;
  private autoSaveInterval: number = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene el estado actual del juego desde los stores
   */
  private getCurrentGameState(): SaveGameData {
    const gameState = useGameStore.getState();
    const playerState = usePlayerStore.getState();
    const jobState = useJobStore.getState();
    const shopState = useShopStore.getState();

    return {
      // Estado del juego
      currentDay: gameState.currentDay,
      currentLevel: gameState.currentLevel,
      timeOfDay: gameState.timeOfDay,
      gamePhase: gameState.gamePhase,
      unlockedFeatures: gameState.unlockedFeatures || [],
      
      // Estado del jugador
      money: playerState.money,
      energy: playerState.energy,
      hunger: playerState.hunger,
      monthlyListeners: playerState.monthlyListeners,
      reputation: playerState.reputation,
      positionX: playerState.position?.x || 0,
      positionY: playerState.position?.y || 0,
      positionZ: playerState.position?.z || 0,
      totalSongsRecorded: playerState.songs.length,
      totalMoneyEarned: playerState.statistics?.totalMoneyEarned || 0,
      totalMoneySpent: playerState.statistics?.totalMoneySpent || 0,
      consecutiveDaysWithoutRent: playerState.consecutiveDaysWithoutRent || 0,
      
      // Datos complejos
      songs: playerState.songs,
      inventory: playerState.inventory,
      dialogueFlags: playerState.dialogueFlags || {},
      jobHistory: playerState.jobHistory || [],
      statistics: playerState.statistics || {
        daysPlayed: gameState.currentDay,
        rentPaidTotal: 0,
        onlineJobsCompleted: 0,
        physicalJobsCompleted: 0,
        perfectSongs: 0,
        collaborationsCompleted: 0,
        itemsPurchased: 0,
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
      },
    };
  }

  /**
   * Guarda la partida actual en InsForge
   */
  async saveGame(userId: string, slotName: string = 'auto'): Promise<GameSave> {
    console.log('[SaveService] 💾 Guardando partida...', { userId, slotName });

    try {
      const gameData = this.getCurrentGameState();

      // Preparar datos para InsForge
      const saveData = {
        user_id: userId,
        slot_name: slotName,
        updated_at: new Date().toISOString(),
        
        // Estado del juego
        current_day: gameData.currentDay,
        current_level: gameData.currentLevel,
        time_of_day: gameData.timeOfDay,
        game_phase: gameData.gamePhase,
        unlocked_features: gameData.unlockedFeatures,
        
        // Estado del jugador
        money: gameData.money,
        energy: gameData.energy,
        hunger: gameData.hunger,
        monthly_listeners: gameData.monthlyListeners,
        reputation: gameData.reputation,
        position_x: gameData.positionX,
        position_y: gameData.positionY,
        position_z: gameData.positionZ,
        total_songs_recorded: gameData.totalSongsRecorded,
        total_money_earned: gameData.totalMoneyEarned,
        total_money_spent: gameData.totalMoneySpent,
        consecutive_days_without_rent: gameData.consecutiveDaysWithoutRent,
        
        // Datos complejos (JSONB)
        songs: gameData.songs,
        inventory: gameData.inventory,
        dialogue_flags: gameData.dialogueFlags,
        job_history: gameData.jobHistory,
        statistics: gameData.statistics,
      };

      // Verificar si ya existe una partida con este slot
      const { data: existingSaves } = await insforge.database
        .from('game_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('slot_name', slotName);

      let result;

      if (existingSaves && existingSaves.length > 0) {
        // Actualizar partida existente
        console.log('[SaveService] Actualizando partida existente:', existingSaves[0].id);
        
        result = await insforge.database
          .from('game_saves')
          .update(saveData)
          .eq('id', existingSaves[0].id)
          .select()
          .single();
      } else {
        // Crear nueva partida
        console.log('[SaveService] Creando nueva partida');
        
        result = await insforge.database
          .from('game_saves')
          .insert([saveData])
          .select()
          .single();
      }

      if (result.error) {
        throw new Error(result.error.message || 'Error al guardar la partida');
      }

      this.lastSaveTime = Date.now();
      console.log('[SaveService] ✅ Partida guardada exitosamente');

      return result.data as GameSave;
    } catch (error: any) {
      console.error('[SaveService] ❌ Error al guardar:', error);
      throw new Error(error.message || 'Error al guardar la partida');
    }
  }

  /**
   * Carga una partida guardada desde InsForge
   */
  async loadGame(saveId: string): Promise<void> {
    console.log('[SaveService] 📂 Cargando partida...', saveId);

    try {
      const { data, error } = await insforge.database
        .from('game_saves')
        .select('*')
        .eq('id', saveId)
        .single();

      if (error) {
        throw new Error(error.message || 'Error al cargar la partida');
      }

      if (!data) {
        throw new Error('Partida no encontrada');
      }

      const save = data as GameSave;

      // Restaurar estado del juego
      useGameStore.setState({
        currentDay: save.current_day,
        currentLevel: save.current_level,
        timeOfDay: save.time_of_day as any,
        gamePhase: save.game_phase as any,
        unlockedFeatures: save.unlocked_features || [],
      });

      // Restaurar estado del jugador
      usePlayerStore.setState({
        money: save.money,
        energy: save.energy,
        hunger: save.hunger,
        monthlyListeners: save.monthly_listeners,
        reputation: save.reputation,
        position: {
          x: save.position_x,
          y: save.position_y,
          z: save.position_z,
        },
        songs: save.songs || [],
        inventory: save.inventory || [],
        dialogueFlags: save.dialogue_flags || {},
        consecutiveDaysWithoutRent: save.consecutive_days_without_rent || 0,
        statistics: {
          daysPlayed: (save.statistics as any)?.daysPlayed || 0,
          rentPaidTotal: (save.statistics as any)?.rentPaidTotal || 0,
          onlineJobsCompleted: (save.statistics as any)?.onlineJobsCompleted || 0,
          physicalJobsCompleted: (save.statistics as any)?.physicalJobsCompleted || 0,
          perfectSongs: (save.statistics as any)?.perfectSongs || 0,
          collaborationsCompleted: (save.statistics as any)?.collaborationsCompleted || 0,
          itemsPurchased: (save.statistics as any)?.itemsPurchased || 0,
          totalMoneyEarned: (save.statistics as any)?.totalMoneyEarned || 0,
          totalMoneySpent: (save.statistics as any)?.totalMoneySpent || 0,
        },
      });

      // Restaurar historial de trabajos
      if (save.job_history && save.job_history.length > 0) {
        usePlayerStore.setState({
          jobHistory: save.job_history || [],
        });
      }

      console.log('[SaveService] ✅ Partida cargada exitosamente');
    } catch (error: any) {
      console.error('[SaveService] ❌ Error al cargar:', error);
      throw new Error(error.message || 'Error al cargar la partida');
    }
  }

  /**
   * Obtiene todas las partidas guardadas de un usuario
   */
  async getUserSaves(userId: string): Promise<GameSave[]> {
    console.log('[SaveService] 📋 Obteniendo partidas del usuario...', userId);

    try {
      const { data, error } = await insforge.database
        .from('game_saves')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Error al obtener las partidas');
      }

      console.log('[SaveService] ✅ Partidas obtenidas:', data?.length || 0);
      return (data || []) as GameSave[];
    } catch (error: any) {
      console.error('[SaveService] ❌ Error al obtener partidas:', error);
      throw new Error(error.message || 'Error al obtener las partidas');
    }
  }

  /**
   * Elimina una partida guardada
   */
  async deleteSave(saveId: string): Promise<void> {
    console.log('[SaveService] 🗑️ Eliminando partida...', saveId);

    try {
      const { error } = await insforge.database
        .from('game_saves')
        .delete()
        .eq('id', saveId);

      if (error) {
        throw new Error(error.message || 'Error al eliminar la partida');
      }

      console.log('[SaveService] ✅ Partida eliminada exitosamente');
    } catch (error: any) {
      console.error('[SaveService] ❌ Error al eliminar:', error);
      throw new Error(error.message || 'Error al eliminar la partida');
    }
  }

  /**
   * Verifica si debe hacer auto-save
   */
  shouldAutoSave(intervalMinutes: number = 5): boolean {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSaveTime;
    const intervalMs = intervalMinutes * 60 * 1000;

    return timeSinceLastSave >= intervalMs;
  }

  /**
   * Obtiene el tiempo desde el último guardado
   */
  getTimeSinceLastSave(): number {
    return Date.now() - this.lastSaveTime;
  }

  /**
   * Actualiza el tiempo del último guardado
   */
  updateLastSaveTime(): void {
    this.lastSaveTime = Date.now();
  }
}

// Exportar instancia única
export const saveService = new SaveService();
