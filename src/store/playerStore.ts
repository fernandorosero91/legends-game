/**
 * 🎮 LEGENDS: Player Store
 * Estado del jugador (recursos, stats, inventario, canciones)
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SongQuality } from '../types/game';

interface Song {
  id: string;
  title: string;
  beatId: string;
  quality: SongQuality;
  rhythmScore: number;
  listenersGenerated: number;
  revenueGenerated: number;
  dayRecorded: number;
  level: number;
  isCollaboration: boolean;
}

interface InventoryItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
}

interface JobRecord {
  jobId: string;
  dayCompleted: number;
  moneyEarned: number;
}

export type CharacterModel = 'player1' | 'player2';

interface PlayerState {
  // Selección de personaje
  selectedCharacter: CharacterModel;

  // Recursos básicos
  money: number;
  energy: number;
  hunger: number;
  monthlyListeners: number;
  reputation: number;

  // Estadísticas
  totalSongsRecorded: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  rentPaidTotal: number;
  consecutiveDaysWithoutRent: number;
  statistics: {
    daysPlayed: number;
    rentPaidTotal: number;
    onlineJobsCompleted: number;
    physicalJobsCompleted: number;
    perfectSongs: number;
    collaborationsCompleted: number;
    itemsPurchased: number;
    totalMoneyEarned: number;
    totalMoneySpent: number;
  };

  // Colecciones
  songs: Song[];
  inventory: InventoryItem[];
  jobHistory: JobRecord[];

  // Flags de diálogo
  dialogueFlags: Record<string, boolean>;

  // Posición del jugador (3D)
  playerPosition: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number }; // Alias para compatibilidad
  playerRef: any; // Referencia al mesh del jugador en Three.js
  wallBoxes: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }>;
  isSitting: boolean;
  isSleeping: boolean;

  // Personaje
  characterGender: 'male' | 'female';

  // Acciones - Recursos
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  setEnergy: (amount: number) => void;
  addEnergy: (amount: number) => void;
  consumeEnergy: (amount: number) => boolean;
  setHunger: (amount: number) => void;
  addHunger: (amount: number) => void;
  consumeHunger: (amount: number) => void;
  addListeners: (amount: number) => void;
  setReputation: (amount: number) => void;
  addReputation: (amount: number) => void;

  // Acciones - Canciones
  addSong: (song: Song) => void;
  getSongsByQuality: (quality: SongQuality) => Song[];
  getAverageQuality: () => number;
  getLastThreeSongs: () => Song[];

  // Acciones - Inventario
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  hasItem: (itemId: string) => boolean;
  getItemQuantity: (itemId: string) => number;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  isItemEquipped: (itemId: string) => boolean;

  // Acciones - Trabajos
  addJobRecord: (record: JobRecord) => void;
  getJobCount: (jobId: string) => number;

  // Acciones - Diálogos
  setDialogueFlag: (flag: string, value: boolean) => void;
  hasSeenDialogue: (flag: string) => boolean;

  // Acciones - Renta
  payRent: (amount: number) => boolean;
  missRent: () => void;
  resetRentStreak: () => void;

  // Acciones - Posición
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  setPosition: (position: { x: number; y: number; z: number }) => void; // Alias
  setPlayerRef: (ref: any) => void;
  addWallBox: (box: { id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }) => void;
  removeWallBox: (id: string) => void;
  clearWallBoxes: () => void;
  setWallBoxes: (boxes: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }>) => void;

  // Personaje
  setCharacterGender: (gender: 'male' | 'female') => void;
  setPlayerSitting: (sitting: boolean) => void;
  setPlayerSleeping: (sleeping: boolean) => void;

  // Acciones - Sistema
  setSelectedCharacter: (character: CharacterModel) => void;
  resetPlayer: () => void;
  loadPlayer: (savedState: Partial<PlayerState>) => void;
}

const INITIAL_STATE = {
  selectedCharacter: 'player2' as CharacterModel,
  money: 5000,
  energy: 100,
  hunger: 100,
  monthlyListeners: 0,
  reputation: 50,
  totalSongsRecorded: 0,
  totalMoneyEarned: 0,
  totalMoneySpent: 0,
  rentPaidTotal: 0,
  consecutiveDaysWithoutRent: 0,
  statistics: {
    daysPlayed: 0,
    rentPaidTotal: 0,
    onlineJobsCompleted: 0,
    physicalJobsCompleted: 0,
    perfectSongs: 0,
    collaborationsCompleted: 0,
    itemsPurchased: 0,
    totalMoneyEarned: 0,
    totalMoneySpent: 0,
  },
  songs: [],
  inventory: [],
  jobHistory: [],
  dialogueFlags: {},
  playerPosition: { x: 0, y: 0, z: 0 },
  position: { x: 0, y: 0, z: 0 },
  playerRef: null,
  wallBoxes: [],
  isSitting: false,
  isSleeping: false,
  characterGender: 'male' as const,
};

export const usePlayerStore = create<PlayerState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // Recursos - Dinero
        addMoney: (amount: number) => {
          set((state) => ({
            money: state.money + amount,
            totalMoneyEarned: state.totalMoneyEarned + amount,
          }));
        },

        spendMoney: (amount: number) => {
          const { money } = get();
          if (money >= amount) {
            set((state) => ({
              money: state.money - amount,
              totalMoneySpent: state.totalMoneySpent + amount,
            }));
            return true;
          }
          return false;
        },

        // Recursos - Energía
        setEnergy: (amount: number) => {
          set({ energy: Math.max(0, Math.min(100, amount)) });
        },

        addEnergy: (amount: number) => {
          set((state) => ({
            energy: Math.min(100, state.energy + amount),
          }));
        },

        consumeEnergy: (amount: number) => {
          const { energy, hunger } = get();
          // Penalización: si hambre = 0, cuesta el doble
          const finalCost = hunger === 0 ? Math.ceil(amount * 2) : amount;
          if (energy >= finalCost) {
            // Consume hambre proporcional (30% del costo base)
            const hungerCost = Math.max(3, Math.ceil(amount * 0.3));
            set((state) => ({
              energy: Math.max(0, state.energy - finalCost),
              hunger: Math.max(0, state.hunger - hungerCost),
            }));
            return true;
          }
          return false;
        },

        // Recursos - Hambre
        setHunger: (amount: number) => {
          set({ hunger: Math.max(0, Math.min(100, amount)) });
        },

        addHunger: (amount: number) => {
          set((state) => ({
            hunger: Math.min(100, state.hunger + amount),
          }));
        },

        consumeHunger: (amount: number) => {
          set((state) => ({
            hunger: Math.max(0, state.hunger - amount),
          }));
        },

        // Recursos - Oyentes
        addListeners: (amount: number) => {
          set((state) => ({
            monthlyListeners: state.monthlyListeners + amount,
          }));
        },

        // Recursos - Reputación
        setReputation: (amount: number) => {
          set({ reputation: Math.max(0, Math.min(100, amount)) });
        },

        addReputation: (amount: number) => {
          set((state) => ({
            reputation: Math.max(0, Math.min(100, state.reputation + amount)),
          }));
        },

        // Canciones
        addSong: (song: Song) => {
          set((state) => ({
            songs: [...state.songs, song],
            totalSongsRecorded: state.totalSongsRecorded + 1,
          }));
        },

        getSongsByQuality: (quality: SongQuality) => {
          return get().songs.filter((song) => song.quality === quality);
        },

        getAverageQuality: () => {
          const { songs } = get();
          if (songs.length === 0) return 0;

          const qualityMap: Record<SongQuality, number> = {
            low: 25,
            medium: 60,
            high: 80,
            masterpiece: 95,
          };

          const total = songs.reduce((sum, song) => sum + qualityMap[song.quality], 0);
          return total / songs.length;
        },

        getLastThreeSongs: () => {
          const { songs } = get();
          return songs.slice(-3);
        },

        // Inventario
        addItem: (itemId: string, quantity: number = 1) => {
          set((state) => {
            const existingItem = state.inventory.find((item) => item.itemId === itemId);
            if (existingItem) {
              return {
                inventory: state.inventory.map((item) =>
                  item.itemId === itemId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
              };
            } else {
              return {
                inventory: [...state.inventory, { itemId, quantity, equipped: false }],
              };
            }
          });
        },

        removeItem: (itemId: string, quantity: number = 1) => {
          const item = get().inventory.find((i) => i.itemId === itemId);
          if (!item || item.quantity < quantity) return false;

          set((state) => ({
            inventory: state.inventory
              .map((item) =>
                item.itemId === itemId
                  ? { ...item, quantity: item.quantity - quantity }
                  : item
              )
              .filter((item) => item.quantity > 0),
          }));
          return true;
        },

        hasItem: (itemId: string) => {
          return get().inventory.some((item) => item.itemId === itemId);
        },

        getItemQuantity: (itemId: string) => {
          const item = get().inventory.find((i) => i.itemId === itemId);
          return item?.quantity || 0;
        },

        equipItem: (itemId: string) => {
          set((state) => ({
            inventory: state.inventory.map((item) =>
              item.itemId === itemId ? { ...item, equipped: true } : item
            ),
          }));
        },

        unequipItem: (itemId: string) => {
          set((state) => ({
            inventory: state.inventory.map((item) =>
              item.itemId === itemId ? { ...item, equipped: false } : item
            ),
          }));
        },

        isItemEquipped: (itemId: string) => {
          const item = get().inventory.find((i) => i.itemId === itemId);
          return item?.equipped || false;
        },

        // Trabajos
        addJobRecord: (record: JobRecord) => {
          set((state) => ({
            jobHistory: [...state.jobHistory, record],
          }));
        },

        getJobCount: (jobId: string) => {
          return get().jobHistory.filter((record) => record.jobId === jobId).length;
        },

        // Diálogos
        setDialogueFlag: (flag: string, value: boolean) => {
          set((state) => ({
            dialogueFlags: { ...state.dialogueFlags, [flag]: value },
          }));
        },

        hasSeenDialogue: (flag: string) => {
          return get().dialogueFlags[flag] || false;
        },

        // Renta
        payRent: (amount: number) => {
          const success = get().spendMoney(amount);
          if (success) {
            set((state) => ({
              rentPaidTotal: state.rentPaidTotal + amount,
              consecutiveDaysWithoutRent: 0,
            }));
          }
          return success;
        },

        missRent: () => {
          set((state) => ({
            consecutiveDaysWithoutRent: state.consecutiveDaysWithoutRent + 1,
            reputation: Math.max(0, state.reputation - 10),
          }));
        },

        resetRentStreak: () => {
          set({ consecutiveDaysWithoutRent: 0 });
        },

        // Posición
        setPlayerPosition: (position: { x: number; y: number; z: number }) => {
          set({ playerPosition: position, position });
        },

        setPosition: (position: { x: number; y: number; z: number }) => {
          set({ playerPosition: position, position });
        },

        setPlayerRef: (ref: any) => {
          set({ playerRef: ref });
        },

        addWallBox: (box: { id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }) => {
          set((state) => ({
            wallBoxes: [...state.wallBoxes, box],
          }));
        },

        removeWallBox: (id: string) => {
          set((state) => ({
            wallBoxes: state.wallBoxes.filter((box) => box.id !== id),
          }));
        },

        clearWallBoxes: () => {
          set({ wallBoxes: [] });
        },

        setWallBoxes: (boxes: Array<{ id: string; min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }>) => {
          set({ wallBoxes: boxes });
        },

        setCharacterGender: (gender: 'male' | 'female') => {
          set({ characterGender: gender });
        },

        setPlayerSitting: (sitting: boolean) => {
          set({ isSitting: sitting });
        },

        setPlayerSleeping: (sleeping: boolean) => {
          set({ isSleeping: sleeping });
        },

        // Sistema
        setSelectedCharacter: (character: CharacterModel) => {
          set({ selectedCharacter: character });
        },

        resetPlayer: () => {
          set(INITIAL_STATE);
        },

        loadPlayer: (savedState: Partial<PlayerState>) => {
          set(savedState);
        },
      }),
      {
        name: 'legends-player-store',
        partialize: (state) => ({
          selectedCharacter: state.selectedCharacter,
          money: state.money,
          energy: state.energy,
          hunger: state.hunger,
          monthlyListeners: state.monthlyListeners,
          reputation: state.reputation,
          totalSongsRecorded: state.totalSongsRecorded,
          totalMoneyEarned: state.totalMoneyEarned,
          totalMoneySpent: state.totalMoneySpent,
          rentPaidTotal: state.rentPaidTotal,
          consecutiveDaysWithoutRent: state.consecutiveDaysWithoutRent,
          songs: state.songs,
          inventory: state.inventory,
          jobHistory: state.jobHistory,
          dialogueFlags: state.dialogueFlags,
          characterGender: state.characterGender,
        }),
      }
    ),
    { name: 'PlayerStore' }
  )
);

// Selectores útiles
export const selectMoney = (state: PlayerState) => state.money;
export const selectEnergy = (state: PlayerState) => state.energy;
export const selectHunger = (state: PlayerState) => state.hunger;
export const selectListeners = (state: PlayerState) => state.monthlyListeners;
export const selectReputation = (state: PlayerState) => state.reputation;
export const selectSongs = (state: PlayerState) => state.songs;
export const selectInventory = (state: PlayerState) => state.inventory;
export const selectCanPayRent = (amount: number) => (state: PlayerState) =>
  state.money >= amount;
