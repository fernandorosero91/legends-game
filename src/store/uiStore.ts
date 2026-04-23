import { create } from 'zustand';

interface UIState {
  // Define UI state here
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
}));
