import { create } from 'zustand';

interface AudioState {
  volume: number;
  muted: boolean;
}

export const useAudioStore = create<AudioState>(() => ({
  volume: 1,
  muted: false,
}));
