/**
 * 🎮 LEGENDS: Audio Hook
 * Hook para gestión de audio y música
 * Autor: Felipe (Systems Developer)
 */

import { useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';

export const useAudio = () => {
  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    muted,
    currentTrack,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    playTrack,
    stopTrack,
    pauseTrack,
    resumeTrack,
  } = useAudioStore();

  // Reproducir música de fondo
  const playMusic = useCallback(
    (trackName: string, loop: boolean = true) => {
      playTrack(trackName, loop);
    },
    [playTrack]
  );

  // Reproducir efecto de sonido
  const playSFX = useCallback(
    (sfxName: string) => {
      if (muted) return;
      
      // Aquí se implementaría la lógica con Howler.js
      console.log(`[Audio] Playing SFX: ${sfxName} at volume ${sfxVolume}`);
    },
    [muted, sfxVolume]
  );

  // Detener toda la música
  const stopMusic = useCallback(() => {
    stopTrack();
  }, [stopTrack]);

  // Pausar música
  const pauseMusic = useCallback(() => {
    pauseTrack();
  }, [pauseTrack]);

  // Reanudar música
  const resumeMusic = useCallback(() => {
    resumeTrack();
  }, [resumeTrack]);

  // Cambiar volumen master
  const changeMasterVolume = useCallback(
    (volume: number) => {
      setMasterVolume(Math.max(0, Math.min(100, volume)));
    },
    [setMasterVolume]
  );

  // Cambiar volumen de música
  const changeMusicVolume = useCallback(
    (volume: number) => {
      setMusicVolume(Math.max(0, Math.min(100, volume)));
    },
    [setMusicVolume]
  );

  // Cambiar volumen de SFX
  const changeSFXVolume = useCallback(
    (volume: number) => {
      setSfxVolume(Math.max(0, Math.min(100, volume)));
    },
    [setSfxVolume]
  );

  // Toggle mute
  const toggleAudioMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  return {
    // Estado
    masterVolume,
    musicVolume,
    sfxVolume,
    muted,
    currentTrack,
    isPlaying: currentTrack !== null,

    // Acciones
    playMusic,
    playSFX,
    stopMusic,
    pauseMusic,
    resumeMusic,
    changeMasterVolume,
    changeMusicVolume,
    changeSFXVolume,
    toggleMute: toggleAudioMute,
  };
};
