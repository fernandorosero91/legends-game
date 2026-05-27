// Game types - Core game state types
// Autor: Fernando (Arquitecto de Sistemas)
// Sprint 1 - CRÍTICO: Todo el equipo depende de estos types

export type GamePhase = 
  | 'menu' 
  | 'playing' 
  | 'paused' 
  | 'dialogue' 
  | 'minigame'
  | 'rhythm_game'
  | 'working' 
  | 'shopping' 
  | 'gameover' 
  | 'game_over'
  | 'victory';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type SongQuality = 'masterpiece' | 'high' | 'medium' | 'low';

export interface Level {
  id: number;
  name: string;
  daysRange: [number, number];
  listenerGoal: number;
  unlocks: string[];
  difficultyMultiplier: number;
}

export interface GameState {
  currentDay: number; // 1-45
  currentLevel: number; // 1-6
  timeOfDay: TimeOfDay;
  gamePhase: GamePhase;
  isPaused: boolean;
}

export interface Statistics {
  daysPlayed: number;
  rentPaidTotal: number;
  onlineJobsCompleted: number;
  physicalJobsCompleted: number;
  perfectSongs: number;
  collaborationsCompleted: number;
  itemsPurchased: number;
  totalMoneyEarned: number;
  totalMoneySpent: number;
}

export interface GameSave {
  id: string;
  userId: string;
  slotName: string;
  createdAt: Date;
  updatedAt: Date;
  gameState: GameState;
  playerState: any; // Definido en player.ts
  songs: any[]; // Definido en player.ts
  inventory: any[]; // Definido en player.ts
  unlockedFeatures: string[];
  dialogueFlags: Record<string, boolean>;
  jobHistory: any[]; // Definido en jobs.ts
  statistics: Statistics;
}
