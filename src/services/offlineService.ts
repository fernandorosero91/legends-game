/**
 * 🔌 LEGENDS: Offline Service
 * Maneja la persistencia local con IndexedDB para funcionar sin internet.
 * Sincroniza con InsForge cuando hay conexión.
 *
 * Estrategia offline-first:
 * 1. Al hacer login exitoso → guarda credenciales + datos en IndexedDB
 * 2. Al cargar el juego → verifica conexión
 *    - Online: usa InsForge normalmente
 *    - Offline: carga desde IndexedDB, permite jugar
 * 3. Al recuperar conexión → sincroniza datos locales con InsForge
 */

import { useAuthStore, type AuthUser } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';

// ─── IndexedDB setup ─────────────────────────────────────────────────────────

const DB_NAME = 'legends-offline';
const DB_VERSION = 1;
const STORES = {
  session: 'session',     // Cached user session
  gameSave: 'gameSave',   // Last game state
  pending: 'pending',     // Pending sync operations
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.session)) {
        db.createObjectStore(STORES.session, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.gameSave)) {
        db.createObjectStore(STORES.gameSave, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.pending)) {
        db.createObjectStore(STORES.pending, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(storeName: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function dbGet(storeName: string, key: string): Promise<any | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function dbGetAll(storeName: string): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => { db.close(); resolve(request.result || []); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function dbClear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ─── Connection detection ────────────────────────────────────────────────────

export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Verifica si InsForge es accesible (no solo que haya red)
 */
export async function isInsForgeReachable(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const url = import.meta.env.VITE_INSFORGE_BASE_URL;
    await fetch(`${url}/health`, { signal: controller.signal, method: 'HEAD' }).catch(() => {
      // Fallback: try the base URL
      return fetch(url, { signal: controller.signal, method: 'HEAD' });
    });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

// ─── Session caching ─────────────────────────────────────────────────────────

/**
 * Guarda la sesión del usuario localmente para acceso offline
 */
export async function cacheUserSession(user: AuthUser): Promise<void> {
  try {
    await dbPut(STORES.session, { id: 'current_user', ...user, cachedAt: Date.now() });
    console.log('[Offline] Session cached for:', user.username);
  } catch (err) {
    console.error('[Offline] Error caching session:', err);
  }
}

/**
 * Recupera la sesión cacheada para modo offline
 */
export async function getCachedSession(): Promise<AuthUser | null> {
  try {
    const cached = await dbGet(STORES.session, 'current_user');
    if (!cached) return null;
    // Session válida por 30 días offline
    const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - cached.cachedAt > MAX_AGE) return null;
    const { id, email, username, emailVerified, characterGender } = cached;
    return { id, email, username, emailVerified, characterGender };
  } catch {
    return null;
  }
}

/**
 * Borra la sesión cacheada (logout)
 */
export async function clearCachedSession(): Promise<void> {
  try {
    await dbClear(STORES.session);
  } catch {}
}

// ─── Game state caching ──────────────────────────────────────────────────────

/**
 * Guarda el estado completo del juego localmente
 */
export async function cacheGameState(): Promise<void> {
  try {
    const gameState = useGameStore.getState();
    const playerState = usePlayerStore.getState();

    const snapshot = {
      id: 'current_save',
      savedAt: Date.now(),
      game: {
        currentDay: gameState.currentDay,
        currentLevel: gameState.currentLevel,
        timeOfDay: gameState.timeOfDay,
        gamePhase: gameState.gamePhase,
        currentScene: gameState.currentScene,
        currentRoom: gameState.currentRoom,
        unlockedFeatures: gameState.unlockedFeatures,
        highestUnlockedLevel: gameState.highestUnlockedLevel,
        levelStars: gameState.levelStars,
      },
      player: {
        money: playerState.money,
        energy: playerState.energy,
        hunger: playerState.hunger,
        monthlyListeners: playerState.monthlyListeners,
        reputation: playerState.reputation,
        songs: playerState.songs,
        inventory: playerState.inventory,
        jobHistory: playerState.jobHistory,
        dialogueFlags: playerState.dialogueFlags,
        characterGender: playerState.characterGender,
        consecutiveDaysWithoutRent: playerState.consecutiveDaysWithoutRent,
      },
    };

    await dbPut(STORES.gameSave, snapshot);
    console.log('[Offline] Game state cached');
  } catch (err) {
    console.error('[Offline] Error caching game state:', err);
  }
}

/**
 * Carga el estado del juego desde cache local
 */
export async function loadCachedGameState(): Promise<boolean> {
  try {
    const snapshot = await dbGet(STORES.gameSave, 'current_save');
    if (!snapshot) return false;

    // Restore game state
    useGameStore.setState({
      currentDay: snapshot.game.currentDay,
      currentLevel: snapshot.game.currentLevel,
      timeOfDay: snapshot.game.timeOfDay,
      currentScene: snapshot.game.currentScene,
      currentRoom: snapshot.game.currentRoom,
      unlockedFeatures: snapshot.game.unlockedFeatures,
      highestUnlockedLevel: snapshot.game.highestUnlockedLevel,
      levelStars: snapshot.game.levelStars,
      gamePhase: 'playing',
      isPaused: false,
    });

    // Restore player state
    usePlayerStore.setState({
      money: snapshot.player.money,
      energy: snapshot.player.energy,
      hunger: snapshot.player.hunger,
      monthlyListeners: snapshot.player.monthlyListeners,
      reputation: snapshot.player.reputation,
      songs: snapshot.player.songs,
      inventory: snapshot.player.inventory,
      jobHistory: snapshot.player.jobHistory,
      dialogueFlags: snapshot.player.dialogueFlags,
      characterGender: snapshot.player.characterGender,
      consecutiveDaysWithoutRent: snapshot.player.consecutiveDaysWithoutRent,
    });

    console.log('[Offline] Game state restored from cache (day:', snapshot.game.currentDay, ')');
    return true;
  } catch (err) {
    console.error('[Offline] Error loading cached game state:', err);
    return false;
  }
}

// ─── Pending sync queue ──────────────────────────────────────────────────────

interface PendingOperation {
  id?: number;
  type: 'save_game' | 'submit_score';
  data: any;
  createdAt: number;
}

/**
 * Encola una operación para sincronizar cuando haya conexión
 */
export async function queueSyncOperation(op: Omit<PendingOperation, 'id' | 'createdAt'>): Promise<void> {
  try {
    await dbPut(STORES.pending, { ...op, createdAt: Date.now() });
    console.log('[Offline] Queued sync operation:', op.type);
  } catch {}
}

/**
 * Sincroniza todas las operaciones pendientes con InsForge
 */
export async function syncPendingOperations(): Promise<{ synced: number; failed: number }> {
  if (!isOnline()) return { synced: 0, failed: 0 };

  try {
    const { insforge } = await import('./insforge');
    const pending = await dbGetAll(STORES.pending);
    if (pending.length === 0) return { synced: 0, failed: 0 };

    console.log('[Offline] Syncing', pending.length, 'pending operations...');
    let synced = 0;
    let failed = 0;

    for (const op of pending) {
      try {
        if (op.type === 'save_game') {
          const { saveService } = await import('./saveService');
          await saveService.saveGame(op.data.userId, op.data.slotName || 'auto');
          synced++;
        } else if (op.type === 'submit_score') {
          await insforge.database.from('leaderboard').insert([op.data]);
          synced++;
        }
      } catch {
        failed++;
      }
    }

    // Clear synced operations
    if (synced > 0) {
      await dbClear(STORES.pending);
      console.log('[Offline] Sync complete:', synced, 'synced,', failed, 'failed');
    }

    return { synced, failed };
  } catch {
    return { synced: 0, failed: 0 };
  }
}

// ─── Auto-sync on reconnect ─────────────────────────────────────────────────

let syncListenerAttached = false;

/**
 * Attach listener to sync when connection is restored
 */
export function attachSyncListener(): void {
  if (syncListenerAttached) return;
  syncListenerAttached = true;

  window.addEventListener('online', async () => {
    console.log('[Offline] Connection restored — syncing...');
    const { synced } = await syncPendingOperations();
    if (synced > 0) {
      const { useUIStore } = await import('../store/uiStore');
      useUIStore.getState().addNotification('success', `☁️ ${synced} cambio(s) sincronizado(s) con la nube`);
    }
  });

  // Also auto-cache game state periodically (every 60s while playing)
  setInterval(() => {
    const { gamePhase } = useGameStore.getState();
    if (gamePhase === 'playing') {
      cacheGameState();
    }
  }, 60000);
}
