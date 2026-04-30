// Shop types - Store and inventory types
// Autor: Fernando (Arquitecto de Sistemas)
// Sprint 1 - CRÍTICO: Todo el equipo depende de estos types

export type ItemCategory = 'equipment' | 'food' | 'apartment' | 'clothing';

export type EffectType = 
  | 'quality_bonus' 
  | 'energy' 
  | 'hunger' 
  | 'reputation' 
  | 'unlock' 
  | 'cosmetic'
  | 'rhythm_bonus'
  | 'rest_bonus'
  | 'sleep_bonus'
  | 'combo';

export interface ItemEffect {
  type: EffectType;
  value: number | string;
  permanent: boolean;
  hunger?: number; // Para items tipo 'combo'
  energy?: number; // Para items tipo 'combo'
}

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  price: number;
  levelRequired: number;
  icon: string;
  effect: ItemEffect;
  maxStock?: number;
  owned?: boolean;
}

export interface PurchaseResult {
  success: boolean;
  item?: ShopItem;
  message: string;
  moneySpent: number;
}
