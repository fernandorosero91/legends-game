/**
 * 🎮 LEGENDS: Characters Data
 * Definición completa de todos los personajes del juego
 * Autor: Yeraldin (Narrative Designer)
 */

export interface Character {
  id: string;
  name: string;
  age?: string | number;
  role: 'protagonist' | 'main_antagonist' | 'secondary_antagonist' | 'mentor' | 'fan' | 'emotional_support' | 'shop_npc' | 'job_npc';
  portrait?: string;
  model?: string;
  appearanceMode?: 'scene' | 'text_message' | 'soundcloud_comment' | 'auto_evening';
  location?: string;
  unlockLevel?: number;
  jobId?: string;
  narrativeArc: NarrativePhase[];
}

export interface NarrativePhase {
  phase: string;
  levels?: number[];
  listeners?: [number, number];
  avgQuality?: [number, number];
  tone?: 'aggressive' | 'threatening' | 'neutral' | 'curious' | 'encouraging' | 'supportive' | 'proud' | 'harsh' | 'challenging' | 'respectful';
}

// ===== PERSONAJE 1: EL JUGADOR (PROTAGONISTA) =====
export const PLAYER_CHARACTER: Character = {
  id: 'player',
  name: 'El Rapero',
  age: '22-28',
  role: 'protagonist',
  model: 'player1.glb',
  narrativeArc: [
    { phase: 'Esperanza', levels: [1, 2] },
    { phase: 'Duda', levels: [3] },
    { phase: 'Perseverancia', levels: [4, 5] },
    { phase: 'Triunfo', levels: [6] },
  ],
};

// ===== PERSONAJE 2: EL DE LA RENTA (ANTAGONISTA PRINCIPAL) =====
export const RENT_COLLECTOR: Character = {
  id: 'rent_collector',
  name: 'El de la Renta',
  age: '40-50',
  role: 'main_antagonist',
  portrait: '/portraits/rent_collector.png',
  appearanceMode: 'auto_evening',
  narrativeArc: [
    { phase: 'Amenazante', levels: [1, 2], tone: 'aggressive' },
    { phase: 'Presión máxima', levels: [3], tone: 'threatening' },
    { phase: 'Respeto', levels: [4], tone: 'neutral' },
    { phase: 'Curiosidad', levels: [5, 6], tone: 'curious' },
  ],
};

// ===== PERSONAJE 3: DJ SONIC (MENTOR) =====
export const DJ_SONIC: Character = {
  id: 'dj_sonic',
  name: 'DJ Sonic',
  age: 32,
  role: 'mentor',
  portrait: '/portraits/dj_sonic.png',
  appearanceMode: 'text_message',
  narrativeArc: [
    { phase: 'Introductor', levels: [1], tone: 'encouraging' },
    { phase: 'Motivador', levels: [2, 3], tone: 'supportive' },
    { phase: 'Amigo', levels: [4, 5, 6], tone: 'proud' },
  ],
};

// ===== PERSONAJE 4: LUNA (FAN / COMUNIDAD) =====
export const LUNA: Character = {
  id: 'luna',
  name: 'Luna',
  role: 'fan',
  portrait: '/portraits/luna.png',
  appearanceMode: 'soundcloud_comment',
  narrativeArc: [
    { phase: 'Ausente', listeners: [0, 499] },
    { phase: 'Primer oyente', listeners: [500, 999] },
    { phase: 'Comunidad creciente', listeners: [1000, 99999] },
  ],
};

// ===== PERSONAJE 5: EL CRÍTICO (ANTAGONISTA SECUNDARIO) =====
export const THE_CRITIC: Character = {
  id: 'the_critic',
  name: 'El Crítico',
  role: 'secondary_antagonist',
  portrait: '/portraits/critic.png',
  narrativeArc: [
    { phase: 'Crítico destructivo', avgQuality: [0, 39], tone: 'harsh' },
    { phase: 'Desafiador', avgQuality: [40, 69], tone: 'challenging' },
    { phase: 'Reconocedor', avgQuality: [70, 100], tone: 'respectful' },
  ],
};

// ===== PERSONAJE 6: MAMÁ DEL JUGADOR (APOYO EMOCIONAL) =====
export const MOM: Character = {
  id: 'mom',
  name: 'Mamá',
  role: 'emotional_support',
  portrait: '/portraits/mom.png',
  appearanceMode: 'text_message',
  narrativeArc: [
    { phase: 'Preocupada', levels: [1, 2, 3] },
    { phase: 'Orgullosa', levels: [4, 5] },
    { phase: 'Celebradora', levels: [6] },
  ],
};

// ===== PERSONAJE 7: VENDEDOR PURPLE SOUND SHOP =====
export const SHOP_VENDOR: Character = {
  id: 'shop_vendor',
  name: 'Vendedor',
  role: 'shop_npc',
  portrait: '/portraits/vendor.png',
  location: 'purple_sound_shop',
  unlockLevel: 3,
  narrativeArc: [
    { phase: 'Comerciante', levels: [3, 4, 5, 6] },
  ],
};

// ===== PERSONAJE 8: MARCO (JEFE CAFÉ PURPLE BEANS) =====
export const CAFE_BOSS: Character = {
  id: 'cafe_boss',
  name: 'Marco',
  role: 'job_npc',
  location: 'cafe_purple_beans',
  portrait: '/portraits/cafe_boss.png',
  jobId: 'barista',
  unlockLevel: 2,
  narrativeArc: [
    { phase: 'Jefe amigable', levels: [2, 3, 4, 5, 6] },
  ],
};

// ===== PERSONAJE 9: DANIELA (JEFE ALMACÉN STREETWEAR) =====
export const STORE_BOSS: Character = {
  id: 'store_boss',
  name: 'Daniela',
  role: 'job_npc',
  location: 'store_streetwear',
  portrait: '/portraits/store_boss.png',
  jobId: 'cashier',
  unlockLevel: 2,
  narrativeArc: [
    { phase: 'Jefa profesional', levels: [2, 3, 4, 5, 6] },
  ],
};

// ===== EXPORTAR TODOS LOS PERSONAJES =====
export const ALL_CHARACTERS: Character[] = [
  PLAYER_CHARACTER,
  RENT_COLLECTOR,
  DJ_SONIC,
  LUNA,
  THE_CRITIC,
  MOM,
  SHOP_VENDOR,
  CAFE_BOSS,
  STORE_BOSS,
];

// ===== HELPER FUNCTIONS =====
export const getCharacterById = (id: string): Character | undefined => {
  return ALL_CHARACTERS.find(char => char.id === id);
};

export const getCharactersByRole = (role: Character['role']): Character[] => {
  return ALL_CHARACTERS.filter(char => char.role === role);
};

export const getCharacterPhase = (
  character: Character,
  currentLevel: number,
  listeners: number,
  avgQuality: number
): NarrativePhase | undefined => {
  return character.narrativeArc.find(phase => {
    if (phase.levels) {
      return phase.levels.includes(currentLevel);
    }
    if (phase.listeners) {
      return listeners >= phase.listeners[0] && listeners <= phase.listeners[1];
    }
    if (phase.avgQuality) {
      return avgQuality >= phase.avgQuality[0] && avgQuality <= phase.avgQuality[1];
    }
    return false;
  });
};
