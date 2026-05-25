/**
 * LEGENDS: Goals/Metas — Configuración de metas del juego
 * Agregar nuevas metas es tan simple como añadir un objeto al array.
 */

export interface GoalReward {
  type: 'money' | 'energy' | 'listeners' | 'badge';
  value: number;
  label: string;
}

export interface GoalDefinition {
  id: string;
  name: string;
  description: string;
  target: number;
  stat: 'money' | 'listeners' | 'days' | 'level' | 'songs' | 'energy' | 'jobs_completed';
  reward: GoalReward;
}

/**
 * Pool de metas disponibles — ordenadas por dificultad.
 * El sistema selecciona las siguientes 3 no completadas.
 */
export const GOALS_POOL: GoalDefinition[] = [
  // ─── Tier 1 (Fáciles) ─────────────────────────────
  {
    id: 'money_1000',
    name: 'Primeros ahorros',
    description: 'Acumula $1,000 en total',
    target: 1000,
    stat: 'money',
    reward: { type: 'energy', value: 30, label: '+30 energía' },
  },
  {
    id: 'listeners_50',
    name: 'Primeros fans',
    description: 'Alcanza 50 oyentes',
    target: 50,
    stat: 'listeners',
    reward: { type: 'money', value: 300, label: '+$300' },
  },
  {
    id: 'days_3',
    name: 'Sobreviviente',
    description: 'Sobrevive 3 días',
    target: 3,
    stat: 'days',
    reward: { type: 'money', value: 500, label: '+$500' },
  },

  // ─── Tier 2 (Medias) ──────────────────────────────
  {
    id: 'money_5000',
    name: 'Cuenta sana',
    description: 'Acumula $5,000 en total',
    target: 5000,
    stat: 'money',
    reward: { type: 'listeners', value: 25, label: '+25 oyentes' },
  },
  {
    id: 'listeners_200',
    name: 'Creciendo',
    description: 'Alcanza 200 oyentes',
    target: 200,
    stat: 'listeners',
    reward: { type: 'money', value: 800, label: '+$800' },
  },
  {
    id: 'days_7',
    name: 'Una semana en pie',
    description: 'Sobrevive 7 días',
    target: 7,
    stat: 'days',
    reward: { type: 'energy', value: 50, label: '+50 energía' },
  },
  {
    id: 'level_2',
    name: 'Siguiente capítulo',
    description: 'Llega al nivel 2',
    target: 2,
    stat: 'level',
    reward: { type: 'money', value: 1000, label: '+$1,000' },
  },
  {
    id: 'songs_3',
    name: 'Trilogía',
    description: 'Graba 3 canciones',
    target: 3,
    stat: 'songs',
    reward: { type: 'listeners', value: 50, label: '+50 oyentes' },
  },

  // ─── Tier 3 (Difíciles) ────────────────────────────
  {
    id: 'money_10000',
    name: 'Diez mil',
    description: 'Acumula $10,000 en total',
    target: 10000,
    stat: 'money',
    reward: { type: 'listeners', value: 100, label: '+100 oyentes' },
  },
  {
    id: 'listeners_500',
    name: 'Medio millar',
    description: 'Alcanza 500 oyentes',
    target: 500,
    stat: 'listeners',
    reward: { type: 'money', value: 1500, label: '+$1,500' },
  },
  {
    id: 'level_3',
    name: 'La prueba del fuego',
    description: 'Llega al nivel 3',
    target: 3,
    stat: 'level',
    reward: { type: 'money', value: 2000, label: '+$2,000' },
  },
  {
    id: 'days_14',
    name: 'Dos semanas',
    description: 'Sobrevive 14 días',
    target: 14,
    stat: 'days',
    reward: { type: 'listeners', value: 75, label: '+75 oyentes' },
  },
  {
    id: 'songs_7',
    name: 'Discografía',
    description: 'Graba 7 canciones',
    target: 7,
    stat: 'songs',
    reward: { type: 'money', value: 2000, label: '+$2,000' },
  },

  // ─── Tier 4 (Muy difíciles) ────────────────────────
  {
    id: 'listeners_1000',
    name: 'Mil oyentes',
    description: 'Alcanza 1,000 oyentes',
    target: 1000,
    stat: 'listeners',
    reward: { type: 'money', value: 3000, label: '+$3,000' },
  },
  {
    id: 'money_25000',
    name: 'Veinticinco mil',
    description: 'Acumula $25,000 en total',
    target: 25000,
    stat: 'money',
    reward: { type: 'listeners', value: 200, label: '+200 oyentes' },
  },
  {
    id: 'level_5',
    name: 'La recta final',
    description: 'Llega al nivel 5',
    target: 5,
    stat: 'level',
    reward: { type: 'money', value: 5000, label: '+$5,000' },
  },
  {
    id: 'listeners_5000',
    name: 'Cinco mil fans',
    description: 'Alcanza 5,000 oyentes',
    target: 5000,
    stat: 'listeners',
    reward: { type: 'money', value: 5000, label: '+$5,000' },
  },
  {
    id: 'listeners_10000',
    name: 'Leyenda',
    description: 'Alcanza 10,000 oyentes',
    target: 10000,
    stat: 'listeners',
    reward: { type: 'badge', value: 1, label: '🏆 Título: Leyenda' },
  },
];
