import { create } from 'zustand';

type Screen = 'splash' | 'main_menu' | 'game' | 'settings' | 'credits' | 'save_load' | 'leaderboard';

interface UIState {
  currentScreen: Screen;
  menuOpen: boolean;
  loadingProgress: number;
  loadingComplete: boolean;

  setScreen: (screen: Screen) => void;
  setLoadingProgress: (progress: number) => void;
  setLoadingComplete: (complete: boolean) => void;
  toggleMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'splash',
  menuOpen: false,
  loadingProgress: 0,
  loadingComplete: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setLoadingComplete: (complete) => set({ loadingComplete: complete }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
}));
