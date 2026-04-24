import { create } from 'zustand';

interface GameState {
  score: number;
  level: number;
}

export const useGameStore = create<GameState>(() => ({
  score: 0,
  level: 1,
}));
