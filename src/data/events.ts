/**
 * 🎮 LEGENDS: Narrative Events Data
 * Eventos narrativos organizados por día y triggers
 * Autor: Yeraldin (Narrative Designer)
 */

import type { NarrativeEvent } from '../types/dialogue';

// ===== EVENTOS DEL ACTO I (DÍAS 1-5) =====

export const ACT1_EVENTS: NarrativeEvent[] = [
  {
    id: 'tutorial_rhythm',
    day: 1,
    triggerCondition: 'first_recording',
    type: 'dialogue',
    payload: 'day1_rhythm_tutorial',
    once: true,
    priority: 100,
  },
  {
    id: 'first_rent',
    day: 1,
    triggerCondition: 'evening_auto',
    type: 'dialogue',
    payload: 'day1_rent_arrive',
    once: true,
    priority: 90,
  },
  {
    id: 'luna_first_comment',
    day: 5,
    triggerCondition: 'listeners_gte_500',
    type: 'dialogue',
    payload: 'day5_luna_first',
    once: true,
    priority: 80,
  },
];

// ===== EVENTOS DEL ACTO II (DÍAS 6-20) =====

export const ACT2_EVENTS: NarrativeEvent[] = [
  {
    id: 'jobs_unlock',
    day: 6,
    level: 2,
    triggerCondition: 'level_2_start',
    type: 'dialogue',
    payload: 'day6_jobs_unlock',
    once: true,
    priority: 95,
  },
  {
    id: 'critic_trigger',
    day: 8,
    triggerCondition: 'avg_quality_lt_40_x3',
    type: 'dialogue',
    payload: 'critic_first',
    once: true,
    priority: 70,
  },
  {
    id: 'crisis_point',
    day: 13,
    triggerCondition: 'cant_pay_rent',
    type: 'dialogue',
    payload: 'day13_rent_crisis',
    once: true,
    priority: 100,
  },
  {
    id: 'dj_support_crisis',
    day: 13,
    triggerCondition: 'cant_pay_rent',
    type: 'dialogue',
    payload: 'day13_dj_support',
    once: true,
    priority: 85,
  },
  {
    id: 'shop_unlock',
    day: 15,
    level: 3,
    triggerCondition: 'level_3_complete',
    type: 'unlock',
    payload: 'purple_sound_shop',
    once: true,
    priority: 90,
  },
  {
    id: 'shop_intro',
    day: 15,
    triggerCondition: 'level_3_complete',
    type: 'dialogue',
    payload: 'day15_shop_unlock',
    once: true,
    priority: 85,
  },
];

// ===== EVENTOS DEL ACTO III (DÍAS 21-45) =====

export const ACT3_EVENTS: NarrativeEvent[] = [
  {
    id: 'thousand_listeners',
    day: 21,
    triggerCondition: 'listeners_gte_1000',
    type: 'dialogue',
    payload: 'day21_milestone',
    once: true,
    priority: 90,
  },
  {
    id: 'mom_message',
    day: 28,
    level: 4,
    triggerCondition: 'level_4_day_28',
    type: 'dialogue',
    payload: 'day28_mom',
    once: true,
    priority: 85,
  },
  {
    id: 'rent_tone_change',
    day: 30,
    triggerCondition: 'listeners_gte_5000',
    type: 'dialogue',
    payload: 'day30_rent_change',
    once: true,
    priority: 80,
  },
  {
    id: 'critic_tone_change',
    day: 35,
    triggerCondition: 'avg_quality_gte_70',
    type: 'dialogue',
    payload: 'day35_critic_change',
    once: true,
    priority: 75,
  },
  {
    id: 'luna_community',
    day: 40,
    triggerCondition: 'listeners_gte_5000',
    type: 'dialogue',
    payload: 'day40_luna_community',
    once: true,
    priority: 70,
  },
  {
    id: 'victory',
    day: 45,
    triggerCondition: 'listeners_gte_10000',
    type: 'dialogue',
    payload: 'victory_dj_1',
    once: true,
    priority: 100,
  },
];

// ===== EVENTOS ESPECIALES (NO ATADOS A DÍAS ESPECÍFICOS) =====

export const SPECIAL_EVENTS: NarrativeEvent[] = [
  {
    id: 'first_masterpiece',
    triggerCondition: 'day_specific',
    type: 'notification',
    payload: 'first_masterpiece',
    once: true,
    priority: 85,
  },
  {
    id: 'first_collaboration',
    triggerCondition: 'day_specific',
    type: 'notification',
    payload: 'first_collab',
    once: true,
    priority: 80,
  },
  {
    id: 'first_equipment_purchase',
    triggerCondition: 'day_specific',
    type: 'dialogue',
    payload: 'first_equipment',
    once: true,
    priority: 75,
  },
  {
    id: 'gameover_rent',
    triggerCondition: 'cant_pay_rent',
    type: 'dialogue',
    payload: 'gameover_rent',
    once: false,
    priority: 100,
  },
];

// ===== EVENTOS DE RENTA DIARIA =====

export const DAILY_RENT_EVENTS: NarrativeEvent[] = Array.from({ length: 45 }, (_, i) => ({
  id: `rent_day_${i + 1}`,
  day: i + 1,
  triggerCondition: 'evening_auto',
  type: 'dialogue',
  payload: i + 1 === 1 ? 'day1_rent_arrive' : 
           i + 1 === 13 ? 'day13_rent_crisis' :
           i + 1 === 30 ? 'day30_rent_change' :
           i + 1 === 45 ? 'victory_rent_final' :
           'rent_generic',
  once: false,
  priority: 90,
}));

// ===== EXPORTAR TODOS LOS EVENTOS =====

/** Story-driven narrative events (excludes generic daily rent — handled by RentSystem) */
export const ALL_NARRATIVE_EVENTS: NarrativeEvent[] = [
  ...ACT1_EVENTS,
  ...ACT2_EVENTS,
  ...ACT3_EVENTS,
  ...SPECIAL_EVENTS,
];

/** All events including daily rent (for reference/stats only) */
export const ALL_EVENTS_WITH_RENT: NarrativeEvent[] = [
  ...ALL_NARRATIVE_EVENTS,
  ...DAILY_RENT_EVENTS,
];

// ===== HELPER FUNCTIONS =====

export const getEventsByDay = (day: number): NarrativeEvent[] => {
  return ALL_NARRATIVE_EVENTS.filter(event => event.day === day);
};

export const getEventsByLevel = (level: number): NarrativeEvent[] => {
  return ALL_NARRATIVE_EVENTS.filter(event => event.level === level);
};

export const getEventById = (id: string): NarrativeEvent | undefined => {
  return ALL_NARRATIVE_EVENTS.find(event => event.id === id);
};

export const getEventsByPriority = (): NarrativeEvent[] => {
  return [...ALL_NARRATIVE_EVENTS].sort((a, b) => (b.priority || 0) - (a.priority || 0));
};

// ===== TRIGGERS DE EVENTOS POR CONDICIÓN =====

export const EVENT_TRIGGERS = {
  first_recording: ['tutorial_rhythm'],
  evening_auto: ['first_rent', ...DAILY_RENT_EVENTS.map(e => e.id)],
  listeners_gte_500: ['luna_first_comment'],
  listeners_gte_1000: ['thousand_listeners'],
  listeners_gte_5000: ['rent_tone_change', 'luna_community'],
  listeners_gte_10000: ['victory'],
  level_2_start: ['jobs_unlock'],
  level_3_complete: ['shop_unlock', 'shop_intro'],
  level_4_day_28: ['mom_message'],
  avg_quality_lt_40_x3: ['critic_trigger'],
  avg_quality_gte_70: ['critic_tone_change'],
  cant_pay_rent: ['crisis_point', 'dj_support_crisis', 'gameover_rent'],
};
