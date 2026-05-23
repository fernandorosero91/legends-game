

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type GamePhase = 'menu' | 'playing' | 'paused' | 'dialogue' | 'rhythm_game' | 'working' | 'shopping' | 'game_over' | 'victory';
export type GameScene = 'apartment' | 'cafe' | 'store' | 'shop' | 'restaurant' | 'delivery' | 'bar' | 'academy' | 'city';

interface GameState {
  // Estado del juego
  currentDay: number;
  currentLevel: number;
  timeOfDay: TimeOfDay;
  gamePhase: GamePhase;
  currentScene: GameScene;
  isPaused: boolean;
  isLoading: boolean;

  // Progreso
  totalDaysPlayed: number;
  gameStartTime: number | null;
  lastSaveTime: number | null;

  // Flags de desbloqueo
  unlockedFeatures: string[];

  // Progreso de niveles (menú de selección)
  highestUnlockedLevel: number;        // Nivel máximo desbloqueado
  levelStars: Record<number, number>;  // Estrellas obtenidas por nivel (0-3)

  // Acciones
  startNewGame: () => void;
  startLevel: (level: number) => void;
  setLevelStars: (level: number, stars: number) => void;
  advanceTime: () => void;
  advanceDay: () => void;
  setLevel: (level: number) => void;
  setGamePhase: (phase: GamePhase) => void;
  setCurrentScene: (scene: GameScene) => void;
  togglePause: () => void;
  unlockFeature: (feature: string) => void;
  isFeatureUnlocked: (feature: string) => boolean;
  resetGame: () => void;
  loadGame: (savedState: Partial<GameState>) => void;
}

const INITIAL_STATE = {
  currentDay: 1,
  currentLevel: 1,
  timeOfDay: 'morning' as TimeOfDay,
  gamePhase: 'menu' as GamePhase,
  currentScene: 'apartment' as GameScene,
  isPaused: false,
  isLoading: false,
  totalDaysPlayed: 0,
  gameStartTime: null,
  lastSaveTime: null,
  unlockedFeatures: ['rhythm_game', 'basic_recording'],
  highestUnlockedLevel: 1,
  levelStars: {} as Record<number, number>,
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        startNewGame: () => {
          const { highestUnlockedLevel, levelStars } = get();
          set({
            ...INITIAL_STATE,
            gamePhase: 'playing',
            gameStartTime: Date.now(),
            unlockedFeatures: ['rhythm_game', 'basic_recording'],
            // Conservar el progreso del menú de niveles
            highestUnlockedLevel,
            levelStars,
          });
        },

        // Iniciar un nivel específico desde el menú de selección
        startLevel: (level: number) => {
          // Día inicial de cada nivel según la narrativa (levels.ts)
          const levelStartDay: Record<number, number> = {
            1: 1, 2: 6, 3: 13, 4: 21, 5: 31, 6: 41,
          };
          const { highestUnlockedLevel, levelStars } = get();
          set({
            ...INITIAL_STATE,
            currentLevel: level,
            currentDay: levelStartDay[level] ?? 1,
            gamePhase: 'playing',
            gameStartTime: Date.now(),
            unlockedFeatures: ['rhythm_game', 'basic_recording'],
            highestUnlockedLevel,
            levelStars,
          });
        },

        // Guardar estrellas y desbloquear el siguiente nivel
        setLevelStars: (level: number, stars: number) => {
          const { levelStars, highestUnlockedLevel } = get();
          const prev = levelStars[level] ?? 0;
          set({
            levelStars: { ...levelStars, [level]: Math.max(prev, stars) },
            highestUnlockedLevel: Math.max(highestUnlockedLevel, level + 1),
          });
        },

        advanceTime: () => {
          const { timeOfDay, currentDay } = get();
          const timeProgression: Record<TimeOfDay, TimeOfDay | 'next_day'> = {
            morning: 'afternoon',
            afternoon: 'evening',
            evening: 'night',
            night: 'next_day',
          };

          const nextTime = timeProgression[timeOfDay];

          if (nextTime === 'next_day') {
            get().advanceDay();
          } else {
            set({ timeOfDay: nextTime as TimeOfDay });
          }
        },

        advanceDay: () => {
          const { currentDay, currentLevel, totalDaysPlayed } = get();
          const newDay = currentDay + 1;

          // Verificar si se completa el juego (día 45)
          if (newDay > 45) {
            set({
              gamePhase: 'victory',
              lastSaveTime: Date.now(),
            });
            return;
          }

          // Calcular nivel basado en el día
          let newLevel = currentLevel;
          if (newDay >= 41) newLevel = 6;
          else if (newDay >= 31) newLevel = 5;
          else if (newDay >= 21) newLevel = 4;
          else if (newDay >= 13) newLevel = 3;
          else if (newDay >= 6) newLevel = 2;

          set({
            currentDay: newDay,
            currentLevel: newLevel,
            timeOfDay: 'morning',
            totalDaysPlayed: totalDaysPlayed + 1,
            lastSaveTime: Date.now(),
          });
        },

        setLevel: (level: number) => {
          set({ currentLevel: level });
        },

        setGamePhase: (phase: GamePhase) => {
          set({ gamePhase: phase });
        },

        setCurrentScene: (scene: GameScene) => {
          set({ currentScene: scene });
        },

        togglePause: () => {
          const { isPaused, gamePhase } = get();
          if (gamePhase === 'playing' || gamePhase === 'paused') {
            set({
              isPaused: !isPaused,
              gamePhase: !isPaused ? 'paused' : 'playing',
            });
          }
        },

        unlockFeature: (feature: string) => {
          const { unlockedFeatures } = get();
          if (!unlockedFeatures.includes(feature)) {
            set({ unlockedFeatures: [...unlockedFeatures, feature] });
          }
        },

        isFeatureUnlocked: (feature: string) => {
          return get().unlockedFeatures.includes(feature);
        },

        resetGame: () => {
          set({
            ...INITIAL_STATE,
            gamePhase: 'menu',
          });
        },

        loadGame: (savedState: Partial<GameState>) => {
          set({
            ...savedState,
            gamePhase: 'playing',
            isPaused: false,
            isLoading: false,
          });
        },
      }),
      {
        name: 'legends-game-store',
        partialize: (state) => ({
          currentDay: state.currentDay,
          currentLevel: state.currentLevel,
          timeOfDay: state.timeOfDay,
          currentScene: state.currentScene,
          totalDaysPlayed: state.totalDaysPlayed,
          gameStartTime: state.gameStartTime,
          lastSaveTime: state.lastSaveTime,
          unlockedFeatures: state.unlockedFeatures,
          highestUnlockedLevel: state.highestUnlockedLevel,
          levelStars: state.levelStars,
        }),
      }
    ),
    { name: 'GameStore' }
  )
);

// Selectores útiles
export const selectCurrentDay = (state: GameState) => state.currentDay;
export const selectCurrentLevel = (state: GameState) => state.currentLevel;
export const selectTimeOfDay = (state: GameState) => state.timeOfDay;
export const selectGamePhase = (state: GameState) => state.gamePhase;
export const selectIsPaused = (state: GameState) => state.isPaused;
export const selectIsFeatureUnlocked = (feature: string) => (state: GameState) =>
  state.isFeatureUnlocked(feature);
