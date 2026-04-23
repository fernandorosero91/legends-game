import { create } from 'zustand';

interface SaveState {
  // Define save state here
}

export const useSaveStore = create<SaveState>((set) => ({
  // Initial state
}));
