import { create } from 'zustand';
import * as THREE from 'three';

interface PlayerStore {
  playerRef: THREE.Group | null;
  setPlayerRef: (ref: THREE.Group | null) => void;
  wallBoxes: THREE.Box3[];
  setWallBoxes: (boxes: THREE.Box3[]) => void;
  cameraMode: string;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),
  wallBoxes: [],
  setWallBoxes: (boxes) => set({ wallBoxes: boxes }),
  cameraMode: '3ra Persona',
}));
