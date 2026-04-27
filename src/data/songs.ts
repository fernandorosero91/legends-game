/**
 * 🎮 LEGENDS: Songs and Beats Data
 * Beats disponibles para grabar y metadatos narrativos
 * Autor: Yeraldin (Narrative Designer)
 */

export interface Beat {
  id: string;
  name: string;
  level: number;
  tempo: number;
  style: 'trap' | 'lofi' | 'hiphop' | 'drill' | 'boom_bap';
  audioFile: string;
  requiresSoftware?: boolean;
  description?: string;
}

// ===== BEATS DISPONIBLES POR NIVEL =====
export const AVAILABLE_BEATS: Beat[] = [
  {
    id: 'beat_01',
    name: 'Purple Rain Trap',
    level: 1,
    tempo: 140,
    style: 'trap',
    audioFile: '/audio/beats/purple_rain_trap.mp3',
    description: 'Un beat trap oscuro con 808s profundos y hi-hats rápidos',
  },
  {
    id: 'beat_02',
    name: 'Street Glow',
    level: 1,
    tempo: 90,
    style: 'lofi',
    audioFile: '/audio/beats/street_glow.mp3',
    description: 'Beat lo-fi relajado con samples de jazz y vinilo',
  },
  {
    id: 'beat_03',
    name: 'Midnight Hustle',
    level: 2,
    tempo: 120,
    style: 'hiphop',
    audioFile: '/audio/beats/midnight_hustle.mp3',
    description: 'Hip-hop clásico con boom bap y scratches',
  },
  {
    id: 'beat_04',
    name: 'City Lights Drill',
    level: 2,
    tempo: 145,
    style: 'drill',
    audioFile: '/audio/beats/city_lights_drill.mp3',
    description: 'Drill agresivo con slides de 808 y hi-hats sincopados',
  },
  {
    id: 'beat_05',
    name: 'Gold Chain Summer',
    level: 3,
    tempo: 95,
    style: 'boom_bap',
    audioFile: '/audio/beats/gold_chain_summer.mp3',
    description: 'Boom bap veraniego con samples de soul',
  },
  {
    id: 'beat_06',
    name: 'Premium Frequencies',
    level: 5,
    tempo: 130,
    style: 'trap',
    audioFile: '/audio/beats/premium_frequencies.mp3',
    requiresSoftware: true,
    description: 'Beat trap premium con producción profesional (requiere Software de Producción)',
  },
];

// ===== CALIDADES DE CANCIÓN =====
export type SongQuality = 'low' | 'medium' | 'high' | 'masterpiece';

export interface QualityThreshold {
  quality: SongQuality;
  minScore: number;
  maxScore: number;
  baseListeners: number;
  description: string;
}

export const QUALITY_THRESHOLDS: QualityThreshold[] = [
  {
    quality: 'masterpiece',
    minScore: 90,
    maxScore: 100,
    baseListeners: 500,
    description: 'Obra maestra - Precisión perfecta',
  },
  {
    quality: 'high',
    minScore: 70,
    maxScore: 89,
    baseListeners: 300,
    description: 'Alta calidad - Muy buena ejecución',
  },
  {
    quality: 'medium',
    minScore: 50,
    maxScore: 69,
    baseListeners: 150,
    description: 'Calidad media - Ejecución aceptable',
  },
  {
    quality: 'low',
    minScore: 0,
    maxScore: 49,
    baseListeners: 50,
    description: 'Baja calidad - Necesita mejorar (trigger El Crítico)',
  },
];

// ===== HELPER FUNCTIONS =====
export const getBeatById = (id: string): Beat | undefined => {
  return AVAILABLE_BEATS.find(beat => beat.id === id);
};

export const getAvailableBeats = (currentLevel: number, hasSoftware: boolean = false): Beat[] => {
  return AVAILABLE_BEATS.filter(beat => {
    if (beat.level > currentLevel) return false;
    if (beat.requiresSoftware && !hasSoftware) return false;
    return true;
  });
};

export const getQualityFromScore = (rhythmScore: number): SongQuality => {
  const threshold = QUALITY_THRESHOLDS.find(
    t => rhythmScore >= t.minScore && rhythmScore <= t.maxScore
  );
  return threshold?.quality || 'low';
};

export const getBaseListenersFromQuality = (quality: SongQuality): number => {
  const threshold = QUALITY_THRESHOLDS.find(t => t.quality === quality);
  return threshold?.baseListeners || 50;
};

export const getQualityDescription = (quality: SongQuality): string => {
  const threshold = QUALITY_THRESHOLDS.find(t => t.quality === quality);
  return threshold?.description || '';
};

// ===== TÍTULOS SUGERIDOS PARA CANCIONES =====
export const SONG_TITLE_SUGGESTIONS = [
  'Purple Dreams',
  'City Nights',
  'Hustle Hard',
  'Gold Chains',
  'Street Poetry',
  'Midnight Flow',
  'Urban Legend',
  'Rise Up',
  'No Sleep',
  'Purple City Anthem',
  'Struggle & Success',
  'From Zero',
  'The Climb',
  'Rent Money',
  'Studio Sessions',
  'Late Night Grind',
  'Purple Rain',
  'City Lights',
  'Underground King',
  'Legendary',
];

export const getRandomSongTitle = (): string => {
  return SONG_TITLE_SUGGESTIONS[Math.floor(Math.random() * SONG_TITLE_SUGGESTIONS.length)];
};
