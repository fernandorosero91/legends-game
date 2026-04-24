import { create } from 'zustand';

interface SaveState {
  lastSave: Date | null;
}

export const useSaveStore = create<SaveState>(() => ({
  lastSave: null,
}));
