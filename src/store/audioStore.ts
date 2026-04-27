/**
 * 🎮 LEGENDS: Audio Store
 * Estado del audio (volumen, música, efectos)
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AudioState {
  // Volúmenes
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;

  // Estado actual
  currentTrack: string | null;
  isPlaying: boolean;

  // Acciones
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  playTrack: (trackId: string) => void;
  stopTrack: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
}

export const useAudioStore = create<AudioState>()(
  devtools(
    persist(
      (set, get) => ({
        masterVolume: 0.7,
        musicVolume: 0.8,
        sfxVolume: 0.9,
        muted: false,
        currentTrack: null,
        isPlaying: false,

        setMasterVolume: (volume: number) => {
          set({ masterVolume: Math.max(0, Math.min(1, volume)) });
        },

        setMusicVolume: (volume: number) => {
          set({ musicVolume: Math.max(0, Math.min(1, volume)) });
        },

        setSfxVolume: (volume: number) => {
          set({ sfxVolume: Math.max(0, Math.min(1, volume)) });
        },

        toggleMute: () => {
          set((state) => ({ muted: !state.muted }));
        },

        setMuted: (muted: boolean) => {
          set({ muted });
        },

        playTrack: (trackId: string) => {
          set({ currentTrack: trackId, isPlaying: true });
        },

        stopTrack: () => {
          set({ currentTrack: null, isPlaying: false });
        },

        pauseTrack: () => {
          set({ isPlaying: false });
        },

        resumeTrack: () => {
          const { currentTrack } = get();
          if (currentTrack) {
            set({ isPlaying: true });
          }
        },
      }),
      {
        name: 'legends-audio-store',
        partialize: (state) => ({
          masterVolume: state.masterVolume,
          musicVolume: state.musicVolume,
          sfxVolume: state.sfxVolume,
          muted: state.muted,
        }),
      }
    ),
    { name: 'AudioStore' }
  )
);

// Selectores útiles
export const selectMasterVolume = (state: AudioState) => state.masterVolume;
export const selectMusicVolume = (state: AudioState) => state.musicVolume;
export const selectSfxVolume = (state: AudioState) => state.sfxVolume;
export const selectMuted = (state: AudioState) => state.muted;
export const selectCurrentTrack = (state: AudioState) => state.currentTrack;
export const selectIsPlaying = (state: AudioState) => state.isPlaying;
