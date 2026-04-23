import { create } from 'zustand';

interface GameState {
  // Define game state here
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
}));
