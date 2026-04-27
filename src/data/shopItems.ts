/**
 * 🎮 LEGENDS: Shop Items Data
 * Catálogo completo de items de Purple Sound Shop
 * Autor: Yeraldin (Narrative Designer)
 */

import type { ShopItem } from '../types/shop';

// ===== CATEGORÍA: EQUIPAMIENTO MUSICAL =====

export const EQUIPMENT_ITEMS: ShopItem[] = [
  {
    id: 'basic_mic',
    name: 'Micrófono Básico',
    category: 'equipment',
    description: 'Un micrófono de condensador básico para grabaciones caseras',
    price: 600,
    levelRequired: 3,
    icon: '/icons/mic_basic.svg',
    effect: {
      type: 'quality_bonus',
      value: 8,
      permanent: true,
    },
  },
  {
    id: 'pro_mic',
    name: 'Micrófono Profesional',
    category: 'equipment',
    description: 'Micrófono de estudio profesional con respuesta de frecuencia plana',
    price: 2200,
    levelRequired: 4,
    icon: '/icons/mic_pro.svg',
    effect: {
      type: 'quality_bonus',
      value: 18,
      permanent: true,
    },
  },
  {
    id: 'studio_headphones',
    name: 'Audífonos de Estudio',
    category: 'equipment',
    description: 'Audífonos cerrados con aislamiento acústico para monitoreo preciso',
    price: 900,
    levelRequired: 3,
    icon: '/icons/headphones.svg',
    effect: {
      type: 'quality_bonus',
      value: 10,
      permanent: true,
    },
  },
  {
    id: 'studio_monitor',
    name: 'Monitor de Estudio',
    category: 'equipment',
    description: 'Altavoz de monitoreo activo para mezcla profesional',
    price: 1600,
    levelRequired: 4,
    icon: '/icons/monitor.svg',
    effect: {
      type: 'quality_bonus',
      value: 14,
      permanent: true,
    },
  },
  {
    id: 'audio_interface',
    name: 'Tarjeta de Sonido',
    category: 'equipment',
    description: 'Interfaz de audio USB con preamplificadores de alta calidad',
    price: 2800,
    levelRequired: 5,
    icon: '/icons/audio_interface.svg',
    effect: {
      type: 'quality_bonus',
      value: 20,
      permanent: true,
    },
  },
  {
    id: 'production_software',
    name: 'Software de Producción',
    category: 'equipment',
    description: 'DAW profesional con plugins premium incluidos',
    price: 3500,
    levelRequired: 5,
    icon: '/icons/software.svg',
    effect: {
      type: 'unlock',
      value: 0,
      permanent: true,
    },
  },
  {
    id: 'beat_pack',
    name: 'Kit de Beats Exclusivos',
    category: 'equipment',
    description: 'Paquete de 5 beats premium producidos por DJ Sonic',
    price: 800,
    levelRequired: 3,
    icon: '/icons/beats.svg',
    maxStock: 3,
    effect: {
      type: 'unlock',
      value: 0,
      permanent: false,
    },
  },
  {
    id: 'midi_controller',
    name: 'Controlador MIDI',
    category: 'equipment',
    description: 'Teclado MIDI de 49 teclas con pads y controles',
    price: 1900,
    levelRequired: 4,
    icon: '/icons/midi.svg',
    effect: {
      type: 'quality_bonus',
      value: 12,
      permanent: true,
    },
  },
];

// ===== CATEGORÍA: COMIDA Y ENERGÍA =====

export const FOOD_ITEMS: ShopItem[] = [
  {
    id: 'instant_ramen',
    name: 'Ramen Instantáneo',
    category: 'food',
    description: 'Comida rápida y económica para sobrevivir',
    price: 40,
    levelRequired: 1,
    icon: '/icons/ramen.svg',
    effect: {
      type: 'hunger',
      value: 20,
      permanent: false,
    },
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    category: 'food',
    description: 'Sandwich de jamón y queso, más sustancioso que el ramen',
    price: 80,
    levelRequired: 1,
    icon: '/icons/sandwich.svg',
    effect: {
      type: 'hunger',
      value: 30,
      permanent: false,
    },
  },
  {
    id: 'home_cooked',
    name: 'Comida Casera',
    category: 'food',
    description: 'Comida casera nutritiva y deliciosa',
    price: 150,
    levelRequired: 1,
    icon: '/icons/home_food.svg',
    effect: {
      type: 'hunger',
      value: 50,
      permanent: false,
    },
  },
  {
    id: 'coffee',
    name: 'Café',
    category: 'food',
    description: 'Café negro para mantenerte despierto',
    price: 25,
    levelRequired: 1,
    icon: '/icons/coffee.svg',
    effect: {
      type: 'energy',
      value: 12,
      permanent: false,
    },
  },
  {
    id: 'energy_drink',
    name: 'Bebida Energética',
    category: 'food',
    description: 'Bebida energética con cafeína y taurina',
    price: 60,
    levelRequired: 2,
    icon: '/icons/energy_drink.svg',
    effect: {
      type: 'energy',
      value: 25,
      permanent: false,
    },
  },
  {
    id: 'gourmet_meal',
    name: 'Comida Gourmet',
    category: 'food',
    description: 'Comida de restaurante de alta calidad',
    price: 350,
    levelRequired: 4,
    icon: '/icons/gourmet.svg',
    effect: {
      type: 'hunger',
      value: 70,
      permanent: false,
    },
  },
];

// ===== CATEGORÍA: MEJORAS DEL APARTAMENTO =====

export const APARTMENT_ITEMS: ShopItem[] = [
  {
    id: 'motivational_poster',
    name: 'Poster Motivacional',
    category: 'apartment',
    description: '"Si algo vale la pena, vale la pena la lucha" - Decoración inspiradora',
    price: 100,
    levelRequired: 2,
    icon: '/icons/poster.svg',
    effect: {
      type: 'reputation',
      value: 2,
      permanent: true,
    },
  },
  {
    id: 'led_lights',
    name: 'Iluminación LED',
    category: 'apartment',
    description: 'Luces LED RGB para darle ambiente al estudio',
    price: 300,
    levelRequired: 3,
    icon: '/icons/led.svg',
    effect: {
      type: 'cosmetic',
      value: 0,
      permanent: true,
    },
  },
  {
    id: 'comfy_couch',
    name: 'Sofá Cómodo',
    category: 'apartment',
    description: 'Sofá ergonómico para descansar entre sesiones',
    price: 800,
    levelRequired: 3,
    icon: '/icons/couch.svg',
    effect: {
      type: 'energy',
      value: 5,
      permanent: true,
    },
  },
  {
    id: 'new_bed',
    name: 'Cama Nueva',
    category: 'apartment',
    description: 'Colchón ortopédico para mejor descanso',
    price: 1200,
    levelRequired: 4,
    icon: '/icons/bed.svg',
    effect: {
      type: 'energy',
      value: 10,
      permanent: true,
    },
  },
  {
    id: 'studio_decor',
    name: 'Decoración de Estudio',
    category: 'apartment',
    description: 'Cuadros, plantas y decoración profesional',
    price: 500,
    levelRequired: 4,
    icon: '/icons/decor.svg',
    effect: {
      type: 'reputation',
      value: 3,
      permanent: true,
    },
  },
  {
    id: 'soundproofing',
    name: 'Insonorización',
    category: 'apartment',
    description: 'Paneles acústicos para aislar el sonido',
    price: 2000,
    levelRequired: 5,
    icon: '/icons/soundproof.svg',
    effect: {
      type: 'quality_bonus',
      value: 10,
      permanent: true,
    },
  },
];

// ===== CATEGORÍA: ROPA Y ESTILO =====

export const CLOTHING_ITEMS: ShopItem[] = [
  {
    id: 'urban_tshirt',
    name: 'Camiseta Urbana',
    category: 'clothing',
    description: 'Camiseta de marca streetwear con diseño exclusivo',
    price: 150,
    levelRequired: 2,
    icon: '/icons/tshirt.svg',
    effect: {
      type: 'reputation',
      value: 2,
      permanent: true,
    },
  },
  {
    id: 'brand_sneakers',
    name: 'Zapatillas de Marca',
    category: 'clothing',
    description: 'Zapatillas de edición limitada',
    price: 400,
    levelRequired: 3,
    icon: '/icons/sneakers.svg',
    effect: {
      type: 'reputation',
      value: 3,
      permanent: true,
    },
  },
  {
    id: 'gold_chain',
    name: 'Cadena Dorada',
    category: 'clothing',
    description: 'Cadena de oro de 18k con colgante personalizado',
    price: 800,
    levelRequired: 4,
    icon: '/icons/chain.svg',
    effect: {
      type: 'reputation',
      value: 5,
      permanent: true,
    },
  },
  {
    id: 'complete_outfit',
    name: 'Outfit Completo',
    category: 'clothing',
    description: 'Conjunto completo de ropa de diseñador',
    price: 1500,
    levelRequired: 5,
    icon: '/icons/outfit.svg',
    effect: {
      type: 'reputation',
      value: 8,
      permanent: true,
    },
  },
  {
    id: 'premium_sunglasses',
    name: 'Gafas de Sol Premium',
    category: 'clothing',
    description: 'Gafas de sol de marca reconocida',
    price: 600,
    levelRequired: 3,
    icon: '/icons/sunglasses.svg',
    effect: {
      type: 'reputation',
      value: 4,
      permanent: true,
    },
  },
];

// ===== EXPORTAR TODOS LOS ITEMS =====

export const ALL_SHOP_ITEMS: ShopItem[] = [
  ...EQUIPMENT_ITEMS,
  ...FOOD_ITEMS,
  ...APARTMENT_ITEMS,
  ...CLOTHING_ITEMS,
];

// ===== HELPER FUNCTIONS =====

export const getItemById = (id: string): ShopItem | undefined => {
  return ALL_SHOP_ITEMS.find(item => item.id === id);
};

export const getItemsByCategory = (category: ShopItem['category']): ShopItem[] => {
  return ALL_SHOP_ITEMS.filter(item => item.category === category);
};

export const getAvailableItems = (currentLevel: number): ShopItem[] => {
  return ALL_SHOP_ITEMS.filter(item => item.levelRequired <= currentLevel);
};

export const getItemPrice = (itemId: string): number => {
  const item = getItemById(itemId);
  return item?.price || 0;
};

export const canAffordItem = (itemId: string, playerMoney: number): boolean => {
  const price = getItemPrice(itemId);
  return playerMoney >= price;
};

export const isItemUnlocked = (itemId: string, currentLevel: number): boolean => {
  const item = getItemById(itemId);
  if (!item) return false;
  return currentLevel >= item.levelRequired;
};

export const getItemEffect = (itemId: string): ShopItem['effect'] | undefined => {
  const item = getItemById(itemId);
  return item?.effect;
};

export const getTotalQualityBonus = (ownedEquipment: string[]): number => {
  return ownedEquipment.reduce((total, itemId) => {
    const item = getItemById(itemId);
    if (item?.effect.type === 'quality_bonus' && typeof item.effect.value === 'number') {
      return total + item.effect.value;
    }
    return total;
  }, 0);
};

export const getTotalReputationBonus = (ownedItems: string[]): number => {
  return ownedItems.reduce((total, itemId) => {
    const item = getItemById(itemId);
    if (item?.effect.type === 'reputation' && typeof item.effect.value === 'number') {
      return total + item.effect.value;
    }
    return total;
  }, 0);
};

export const getEnergyBonus = (ownedItems: string[]): number => {
  return ownedItems.reduce((total, itemId) => {
    const item = getItemById(itemId);
    if (item?.effect.type === 'energy' && item.effect.permanent && typeof item.effect.value === 'number') {
      return total + item.effect.value;
    }
    return total;
  }, 0);
};

// ===== CATEGORÍAS PARA UI =====

export const SHOP_CATEGORIES = [
  { id: 'equipment', name: 'Equipamiento Musical', icon: '/icons/music.svg' },
  { id: 'food', name: 'Comida y Energía', icon: '/icons/food.svg' },
  { id: 'apartment', name: 'Mejoras del Apartamento', icon: '/icons/home.svg' },
  { id: 'clothing', name: 'Ropa y Estilo', icon: '/icons/clothing.svg' },
] as const;

export const getCategoryName = (category: ShopItem['category']): string => {
  const cat = SHOP_CATEGORIES.find(c => c.id === category);
  return cat?.name || category;
};

export const getCategoryIcon = (category: ShopItem['category']): string => {
  const cat = SHOP_CATEGORIES.find(c => c.id === category);
  return cat?.icon || '/icons/default.svg';
};
