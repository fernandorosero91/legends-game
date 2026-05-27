/**
 * 🎮 LEGENDS: Dialogue Types
 * Types para el sistema de diálogos
 * Autor: Yeraldin (Narrative Designer)
 */

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  portrait?: string;
  triggerType?: 'scene' | 'text_message' | 'soundcloud_comment' | 'auto_evening';
  options?: DialogueOption[];
  nextDialogueId?: string;
  effects?: DialogueEffect[];
}

export interface DialogueOption {
  id: string;
  text: string;
  nextDialogueId?: string;
  effects?: DialogueEffect[];
  disabled?: boolean;
}

export interface DialogueEffect {
  type: 'reputation' | 'money' | 'energy' | 'flag' | 'unlock';
  value: number | string | boolean;
  target?: string;
}

export interface DialogueTrigger {
  id: string;
  dialogueId: string;
  condition: TriggerCondition;
  once: boolean;
  priority: number;
}

export type TriggerCondition =
  | 'first_recording'
  | 'evening_auto'
  | 'listeners_gte_500'
  | 'listeners_gte_1000'
  | 'listeners_gte_5000'
  | 'listeners_gte_10000'
  | 'level_2_start'
  | 'level_3_complete'
  | 'level_4_day_28'
  | 'avg_quality_lt_40_x3'
  | 'avg_quality_gte_70'
  | 'cant_pay_rent'
  | 'day_specific'
  | 'interact_npc';

export interface DialogueFlags {
  [key: string]: boolean;
}

export interface NarrativeEvent {
  id: string;
  day?: number;
  level?: number;
  triggerCondition: TriggerCondition;
  type: 'dialogue' | 'unlock' | 'notification' | 'scene_change';
  payload: string;
  once: boolean;
  priority?: number;
}
