/**
 * LEGENDS: Restaurante La Esquina — Configuración estática del nivel.
 *
 * Coordenadas en mundo (Three.js). Importante: los stools del restaurante están
 * dentro de un <group scale={0.8}> en RestaurantLevel1, por lo que las posiciones
 * útiles para gameplay (jugador, NPCs, sillas) se calculan ya escaladas.
 */

export type Vec3 = [number, number, number];

export interface SeatConfig {
  id: string;
  /** Coordenada en mundo donde se "sienta" / parquea el cliente. */
  position: Vec3;
  /** Hacia dónde mira el cliente al sentarse (rad). */
  rotationY: number;
}

/** Punto de aparición de los clientes (dos pasos detrás de la puerta hacia el interior). */
export const CUSTOMER_SPAWN: Vec3 = [-6, 0.5, -5];

/** Punto donde esperan los clientes "sin mesa" antes de ser seleccionados. */
export const CUSTOMER_WAIT: Vec3 = [-6, 0.5, -5];

/** Punto al que caminan los clientes cuando salen del restaurante. */
export const CUSTOMER_EXIT: Vec3 = [-6, 1, -10];

/**
 * Rotación Y (radianes) del NPC en cada estado de reposo.
 * 0 = mirando hacia +Z (cámara/puerta).
 * Math.PI = mirando hacia -Z (barra/chef).
 * Math.PI / 2 = mirando hacia +X (derecha).
 * -Math.PI / 2 = mirando hacia -X (izquierda).
 */
export const CUSTOMER_ROTATIONS = {
  /** Cuando está esperando junto a la puerta. */
  waiting_door: 0,
  /** Cuando está sentado en la barra (mirando al chef). */
  seated: Math.PI,
  /** Cuando está comiendo. */
  eating: Math.PI,
};

/**
 * Sillas disponibles para clientes (mesas del restaurante).
 *
 * Coordenadas calculadas de los GLBs × 0.8 (escala del grupo).
 * rotationY apunta hacia el centro de la mesa más cercana.
 *
 * Mesa 1 centro: (3.37, y, 3.94) — bar_mesh.019_lev1
 * Mesa 2 centro: (-3.80, y, 3.94) — bar_mesh.014_lev1
 */
export const RESTAURANT_SEATS: SeatConfig[] = [
  // --- Mesa 1 (derecha) ---
  { id: 'seat-1', position: [1.45, 0.5, 3.82],  rotationY: Math.atan2(3.37 - 1.45, 3.94 - 3.82) },   // bar_mesh.021 — izquierda de mesa 1
  { id: 'seat-2', position: [2.98, 0.5, 2.05],  rotationY: Math.atan2(3.37 - 2.98, 3.94 - 2.05) },   // bar_mesh.020 — frente/abajo de mesa 1
  { id: 'seat-3', position: [5.06, 0.5, 3.97],  rotationY: Math.atan2(3.37 - 5.06, 3.94 - 3.97) },   // bar_mesh.018 — derecha de mesa 1
  { id: 'seat-4', position: [2.82, 0.5, 5.71],  rotationY: Math.atan2(3.37 - 2.82, 3.94 - 5.71) },   // bar_mesh.017 — atrás de mesa 1

  // --- Mesa 2 (izquierda) ---
  { id: 'seat-5', position: [-4.12, 0.5, 5.70], rotationY: Math.atan2(-3.80 - (-4.12), 3.94 - 5.70) }, // bar_mesh.012 — atrás de mesa 2
  { id: 'seat-6', position: [-2.12, 0.5, 3.96], rotationY: Math.atan2(-3.80 - (-2.12), 3.94 - 3.96) }, // bar_mesh.009 — derecha de mesa 2
  { id: 'seat-7', position: [-4.19, 0.5, 2.05], rotationY: Math.atan2(-3.80 - (-4.19), 3.94 - 2.05) }, // bar_mesh.007 — frente/abajo de mesa 2
  { id: 'seat-8', position: [-5.96, 0.5, 3.90], rotationY: Math.atan2(-3.80 - (-5.96), 3.94 - 3.90) }, // bar_mesh.004 — izquierda de mesa 2
];

/**
 * Catálogo de platos que pueden pedir los clientes.
 * Cada plato vincula:
 *  - dishId: identificador interno
 *  - imageUrl: imagen mostrada en la burbuja del cliente
 *  - modelFile: GLB que aparece en la barra del chef cuando está listo
 *  - dropPosition: posición donde aparece el plato sobre la barra (mismo
 *    sitio que tus dishes actuales — los apilo en el mismo punto a propósito,
 *    porque sólo habrá un plato listo a la vez por cliente).
 */
export interface DishCatalogEntry {
  dishId: string;
  name: string;
  imageUrl: string;
  modelFile: string;
  modelScale: number;
}

export const DISH_CATALOG: DishCatalogEntry[] = [
  {
    dishId: 'hamburguesa',
    name: 'Hamburguesa',
    imageUrl: '/images_dishes/hamburguesa.jpeg',
    modelFile: 'hamburguesa.glb',
    modelScale: 0.09,
  },
  {
    dishId: 'bandeja_paisa',
    name: 'Bandeja Paisa',
    imageUrl: '/images_dishes/bandeja_paisa.jpeg',
    modelFile: 'bandeja_paisa.glb',
    modelScale: 0.09,
  },
  {
    dishId: 'hot_dog',
    name: 'Perro Caliente',
    imageUrl: '/images_dishes/got_dog.jpeg',
    modelFile: 'perro caliente.glb',
    modelScale: 0.09,
  },
];

/** Punto en la barra del chef donde aparecen los platos listos. */
export const CHEF_COUNTER_POSITION: Vec3 = [0.9, 2.35, -2];

/** Modelos GLB disponibles para clientes (los voy alternando al spawnar). */
export const CUSTOMER_MODELS: { file: string; scale: number; offsetY: number }[] = [
  { file: '/models/hombre_de_55_anos.glb', scale: 2, offsetY: 0 },
  { file: '/models/flexin_personaje-_litkillah_con_textura.glb', scale: 0.02, offsetY: 0 },
];

/** Configuración numérica del flujo. */
export const RESTAURANT_CONFIG = {
  /** Tiempo (ms) que el cliente "piensa" antes de mostrar la burbuja del pedido. */
  THINK_BEFORE_ORDER_MS: 2500,
  /** Tiempo (ms) que el chef tarda en preparar un plato. */
  CHEF_COOK_TIME_MS: 15000,
  /** Tiempo (ms) que el cliente está comiendo antes de irse. */
  EATING_TIME_MS: 5000,
  /** Velocidad de caminado de los clientes (unidades/seg). */
  CUSTOMER_WALK_SPEED: 1.8,
  /** Propina que paga cada cliente atendido. */
  TIP_PER_CUSTOMER: 250,
  /** Cantidad máxima de clientes simultáneos en escena. */
  MAX_CUSTOMERS: 3,
  /** Intervalo (ms) entre spawns de clientes. */
  SPAWN_INTERVAL_MS: 8000,
  /** Separación (unidades) entre clientes en la fila de espera. */
  QUEUE_SPACING: 1.5,
};
