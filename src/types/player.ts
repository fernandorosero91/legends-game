// Player types - Player state and related types
// Autor: Fernando (Arquitecto de Sistemas)
// Sprint 1 - CRÍTICO: Todo el equipo depende de estos types

export type SongQuality = 'low' | 'medium' | 'high' | 'masterpiece';

export interface Song {
  id: string;
  title: string;
  quality: SongQuality;
  rhythmScore: number; // 0-100
  listenersGenerated: number;
  revenueGenerated: number;
  dayRecorded: number;
  level: number;
  isCollaboration: boolean;
  beatId: string;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
}

export interface PlayerStats {
  money: number;
  energy: number; // 0-100
  hunger: number; // 0-100
  monthlyListeners: number;
  reputation: number; // 0-100
  totalSongsRecorded: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
  consecutiveMissedRents: number; // 3 = Game Over
}

export interface JobRecord {
  jobId: string;
  dayCompleted: number;
  moneyEarned: number;
  energySpent: number;
  location: string;
}

export interface PlayerState extends PlayerStats {
  songs: Song[];
  inventory: InventoryItem[];
  playerRef: any; // THREE.Group | null (para 3D)
  wallBoxes: any[]; // THREE.Box3[] (para colisiones)
  cameraMode: string;
}
