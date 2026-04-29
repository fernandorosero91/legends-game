// Jobs types - Work system types
// Autor: Fernando (Arquitecto de Sistemas)
// Sprint 1 - CRÍTICO: Todo el equipo depende de estos types

export type JobLocation = 
  | 'online' 
  | 'cafe' 
  | 'store' 
  | 'restaurant' 
  | 'delivery' 
  | 'bar' 
  | 'academy';

export type JobType = 'online' | 'physical';

export interface Job {
  id: string;
  name: string;
  location: JobLocation;
  type: JobType;
  description: string;
  pay: number;
  energyCost: number;
  turnsCost: number;
  levelRequired: number;
  icon: string;
  npcName?: string;
  npcDialogue?: string;
}

export interface JobResult {
  success: boolean;
  moneyEarned: number;
  energySpent: number;
  turnsSpent: number;
  message: string;
}

export interface JobProgress {
  jobId: string;
  progress: number; // 0-100
  startedAt: number; // timestamp
}
