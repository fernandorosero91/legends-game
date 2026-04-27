/**
 * 🎮 LEGENDS: Levels Data
 * Configuración completa de los 6 niveles del juego
 * Autor: Yeraldin (Narrative Designer)
 */

export interface Level {
  id: number;
  name: string;
  days: [number, number];
  listenerGoal: [number, number];
  description: string;
  challenge: string;
  unlocks: string[];
  narrativeMilestone: string;
  rhythmDifficulty: 'easy' | 'medium' | 'medium-high' | 'high' | 'very-high' | 'max';
  listenerMultiplier: number;
  rentAmount: number;
}

// ===== CONFIGURACIÓN DE LOS 6 NIVELES =====

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'El Primer Beat',
    days: [1, 5],
    listenerGoal: [0, 500],
    description: 'Aprende las mecánicas básicas y graba tus primeras canciones',
    challenge: 'Aprender mecánicas, pagar primera renta',
    unlocks: ['rhythm_game', 'basic_recording'],
    narrativeMilestone: 'Luna (primer fan)',
    rhythmDifficulty: 'easy',
    listenerMultiplier: 1.0,
    rentAmount: 1000,
  },
  {
    id: 2,
    name: 'Subsistir o Crear',
    days: [6, 12],
    listenerGoal: [500, 1000],
    description: 'Equilibra trabajos con grabaciones para sobrevivir',
    challenge: 'Equilibrar trabajos con grabaciones',
    unlocks: ['online_jobs', 'physical_jobs', 'collaboration_mode'],
    narrativeMilestone: 'Aparición de El Crítico',
    rhythmDifficulty: 'medium',
    listenerMultiplier: 1.2,
    rentAmount: 1000,
  },
  {
    id: 3,
    name: 'La Prueba del Fuego',
    days: [13, 20],
    listenerGoal: [1000, 3000],
    description: 'Supera el punto de quiebre económico y narrativo',
    challenge: 'Punto de quiebre económico',
    unlocks: ['reputation_system', 'purple_sound_shop', 'music_equipment'],
    narrativeMilestone: 'Mensaje de DJ Sonic en la crisis',
    rhythmDifficulty: 'medium-high',
    listenerMultiplier: 1.5,
    rentAmount: 1000,
  },
  {
    id: 4,
    name: 'Momentum',
    days: [21, 30],
    listenerGoal: [3000, 5000],
    description: 'Mantén la consistencia creativa y construye tu audiencia',
    challenge: 'Mantener consistencia creativa',
    unlocks: ['improved_studio', 'premium_items', 'advanced_jobs'],
    narrativeMilestone: 'Mensaje de Mamá + Cambio de tono de El de la Renta',
    rhythmDifficulty: 'high',
    listenerMultiplier: 1.8,
    rentAmount: 1000,
  },
  {
    id: 5,
    name: 'La Recta Final',
    days: [31, 40],
    listenerGoal: [5000, 7000],
    description: 'Graba canciones de alta calidad bajo presión máxima',
    challenge: 'Canciones de alta calidad bajo presión máxima',
    unlocks: ['virtual_tour_event', 'production_software', 'premium_beats'],
    narrativeMilestone: 'El Crítico cambia de tono',
    rhythmDifficulty: 'very-high',
    listenerMultiplier: 2.2,
    rentAmount: 1000,
  },
  {
    id: 6,
    name: 'Leyenda',
    days: [41, 45],
    listenerGoal: [7000, 10000],
    description: 'Usa todas las herramientas para alcanzar la meta final',
    challenge: 'Usar todas las herramientas simultáneamente',
    unlocks: ['professional_studio', 'victory_screen'],
    narrativeMilestone: 'Reconocimientos finales de todos los personajes',
    rhythmDifficulty: 'max',
    listenerMultiplier: 2.5,
    rentAmount: 1000,
  },
];

// ===== CONFIGURACIÓN DE DIFICULTAD DEL MINIJUEGO POR NIVEL =====

export interface RhythmDifficultyConfig {
  level: number;
  noteSpeed: number;
  notesPerBeat: number;
  laneCount: 4;
  perfectWindow: number;
  goodWindow: number;
  okWindow: number;
  patterns: string[];
}

export const RHYTHM_DIFFICULTY_CONFIGS: RhythmDifficultyConfig[] = [
  {
    level: 1,
    noteSpeed: 2.0,
    notesPerBeat: 1,
    laneCount: 4,
    perfectWindow: 100,
    goodWindow: 150,
    okWindow: 200,
    patterns: ['single', 'double'],
  },
  {
    level: 2,
    noteSpeed: 2.5,
    notesPerBeat: 1.5,
    laneCount: 4,
    perfectWindow: 90,
    goodWindow: 140,
    okWindow: 190,
    patterns: ['single', 'double', 'triple'],
  },
  {
    level: 3,
    noteSpeed: 3.0,
    notesPerBeat: 2,
    laneCount: 4,
    perfectWindow: 80,
    goodWindow: 130,
    okWindow: 180,
    patterns: ['single', 'double', 'triple', 'quad'],
  },
  {
    level: 4,
    noteSpeed: 3.5,
    notesPerBeat: 2.5,
    laneCount: 4,
    perfectWindow: 70,
    goodWindow: 120,
    okWindow: 170,
    patterns: ['single', 'double', 'triple', 'quad', 'syncopated'],
  },
  {
    level: 5,
    noteSpeed: 4.0,
    notesPerBeat: 3,
    laneCount: 4,
    perfectWindow: 60,
    goodWindow: 110,
    okWindow: 160,
    patterns: ['double', 'triple', 'quad', 'syncopated', 'complex'],
  },
  {
    level: 6,
    noteSpeed: 4.5,
    notesPerBeat: 3.5,
    laneCount: 4,
    perfectWindow: 50,
    goodWindow: 100,
    okWindow: 150,
    patterns: ['triple', 'quad', 'syncopated', 'complex', 'expert'],
  },
];

// ===== HELPER FUNCTIONS =====

export const getLevelById = (id: number): Level | undefined => {
  return LEVELS.find(level => level.id === id);
};

export const getLevelByDay = (day: number): Level | undefined => {
  return LEVELS.find(level => day >= level.days[0] && day <= level.days[1]);
};

export const getCurrentLevel = (day: number): number => {
  const level = getLevelByDay(day);
  return level?.id || 1;
};

export const isLevelComplete = (currentLevel: number, listeners: number): boolean => {
  const level = getLevelById(currentLevel);
  if (!level) return false;
  return listeners >= level.listenerGoal[1];
};

export const getProgressInLevel = (currentLevel: number, listeners: number): number => {
  const level = getLevelById(currentLevel);
  if (!level) return 0;
  
  const [min, max] = level.listenerGoal;
  const progress = ((listeners - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, progress));
};

export const getRhythmDifficulty = (level: number): RhythmDifficultyConfig | undefined => {
  return RHYTHM_DIFFICULTY_CONFIGS.find(config => config.level === level);
};

export const getNextLevel = (currentLevel: number): Level | undefined => {
  return getLevelById(currentLevel + 1);
};

export const getPreviousLevel = (currentLevel: number): Level | undefined => {
  return getLevelById(currentLevel - 1);
};

export const getAllUnlocks = (upToLevel: number): string[] => {
  return LEVELS
    .filter(level => level.id <= upToLevel)
    .flatMap(level => level.unlocks);
};

export const isFeatureUnlocked = (feature: string, currentLevel: number): boolean => {
  const unlocks = getAllUnlocks(currentLevel);
  return unlocks.includes(feature);
};

// ===== MENSAJES DE NIVEL =====

export const LEVEL_UP_MESSAGES: Record<number, string> = {
  2: '¡Nivel 2 desbloqueado! Ahora puedes trabajar para ganar dinero.',
  3: '¡Nivel 3 desbloqueado! El sistema de reputación y la tienda están disponibles.',
  4: '¡Nivel 4 desbloqueado! Tu estudio ha mejorado y hay nuevos items en la tienda.',
  5: '¡Nivel 5 desbloqueado! Acceso a software de producción y beats premium.',
  6: '¡Nivel 6 desbloqueado! La recta final hacia los 10,000 oyentes.',
};

export const getLevelUpMessage = (level: number): string => {
  return LEVEL_UP_MESSAGES[level] || `¡Nivel ${level} desbloqueado!`;
};

// ===== ESTADÍSTICAS DE NIVEL =====

export interface LevelStats {
  level: number;
  daysInLevel: number;
  listenersGained: number;
  songsRecorded: number;
  moneyEarned: number;
  moneySpent: number;
  jobsCompleted: number;
}

export const calculateLevelStats = (
  level: number,
  startDay: number,
  endDay: number,
  startListeners: number,
  endListeners: number,
  songs: number,
  earned: number,
  spent: number,
  jobs: number
): LevelStats => {
  return {
    level,
    daysInLevel: endDay - startDay + 1,
    listenersGained: endListeners - startListeners,
    songsRecorded: songs,
    moneyEarned: earned,
    moneySpent: spent,
    jobsCompleted: jobs,
  };
};
