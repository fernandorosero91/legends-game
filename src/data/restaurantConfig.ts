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

/** Punto de aparición de los clientes (un par de pasos atrás de la puerta). */
export const CUSTOMER_SPAWN: Vec3 = [-7, 0, -8];

/** Compatibilidad — alias del primer slot de la puerta. */
export const CUSTOMER_WAIT: Vec3 = [-6, 0, -5];

/** Punto al que caminan los clientes cuando salen del restaurante. */
export const CUSTOMER_EXIT: Vec3 = [-6, 0, -10];

/**
 * Slots de la FILA de espera. Los clientes hacen una fila ordenada de 2:
 *
 *   slot 0 — al frente, listo para ser asignado a una silla.
 *   slot 1 — detrás, esperando su turno.
 *
 * Cuando el del slot 0 sale (lo mandan a una silla), el del slot 1 AVANZA
 * automáticamente al slot 0 y entonces puede entrar otro cliente nuevo
 * directamente al slot 1. De esta forma siempre hay 2 personas máximo
 * frente a la puerta y la entrada es ordenada (una a la vez sustituye al
 * que se va).
 */
export const DOOR_QUEUE_SLOTS: Vec3[] = [
  [-6, 0, -5],   // slot 0 — al frente de la puerta
  [-6, 0, -7],   // slot 1 — atrás
];

/** Cantidad máxima de clientes esperando junto a la puerta. */
export const MAX_WAITING_AT_DOOR = DOOR_QUEUE_SLOTS.length;

/** Radio del cuerpo de colisión de los NPCs (vs paredes y vs otros NPCs). */
export const NPC_COLLISION_RADIUS = 0.5;

/**
 * Prefijos de IDs de wallBox que los NPCs pueden ATRAVESAR.
 * Los NPCs deben acercarse a las mesas para sentarse, así que las mesas
 * son sólidas SOLO para el Player. Las paredes y la barra siguen sólidas
 * para todos.
 */
export const NPC_PASSABLE_BOX_PREFIXES = ['table-'];

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
 * Coordenadas obtenidas de public/data/restaurant.json y escaladas × 0.8
 * (porque el grupo del restaurante usa scale={0.8}).
 *
 * Y se deja en 0 — los modelos tienen el pivote en los pies, así que
 * "y = 0" significa que el NPC está parado sobre el suelo. La animación
 * `sit_down` baja la cadera hasta la altura del banquillo automáticamente,
 * por eso no hay que pre-elevar al cliente. Si poníamos `y = 0.5` antes,
 * el NPC quedaba "flotando encima" del banco, que es exactamente lo que
 * estabas viendo.
 *
 * Mesa 1 (derecha) centro: bar_mesh.019_lev1 → (3.37, y, 3.94)
 * Mesa 2 (izquierda) centro: bar_mesh.014_lev1 → (-3.80, y, 3.94)
 *
 * rotationY apunta hacia el centro de la mesa más cercana.
 */
export const RESTAURANT_SEATS: SeatConfig[] = [
  // ----- Mesa 1 (derecha) -----
  { id: 'seat-1', position: [1.45, 0, 3.82],  rotationY: Math.atan2(3.37 - 1.45,  3.94 - 3.82) },   // bar_mesh.021_lev1 — izquierda de mesa 1
  { id: 'seat-2', position: [2.98, 0, 2.05],  rotationY: Math.atan2(3.37 - 2.98,  3.94 - 2.05) },   // bar_mesh.020_lev1 — frente/abajo de mesa 1
  { id: 'seat-3', position: [5.06, 0, 3.97],  rotationY: Math.atan2(3.37 - 5.06,  3.94 - 3.97) },   // bar_mesh.018_lev1 — derecha de mesa 1
  { id: 'seat-4', position: [2.82, 0, 5.71],  rotationY: Math.atan2(3.37 - 2.82,  3.94 - 5.71) },   // bar_mesh.017_lev1 — atrás de mesa 1

  // ----- Mesa 2 (izquierda) -----
  { id: 'seat-5', position: [-4.13, 0, 5.70], rotationY: Math.atan2(-3.80 - (-4.13), 3.94 - 5.70) }, // bar_mesh.012_lev1 — atrás de mesa 2
  { id: 'seat-6', position: [-2.12, 0, 3.96], rotationY: Math.atan2(-3.80 - (-2.12), 3.94 - 3.96) }, // bar_mesh.009_lev1 — derecha de mesa 2
  { id: 'seat-7', position: [-4.19, 0, 2.05], rotationY: Math.atan2(-3.80 - (-4.19), 3.94 - 2.05) }, // bar_mesh.007_lev1 — frente/abajo de mesa 2
  { id: 'seat-8', position: [-5.96, 0, 3.90], rotationY: Math.atan2(-3.80 - (-5.96), 3.94 - 3.90) }, // bar_mesh.004_lev1 — izquierda de mesa 2
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

/**
 * Waypoints del corredor principal del restaurante.
 * Los NPCs usan estos puntos intermedios para no atravesar mesas ni barra.
 * La lógica de path calcula: pos_actual → waypoint más cercano al destino → destino.
 */
export const RESTAURANT_WAYPOINTS: Vec3[] = [
  [0, 0.5, 6],    // Zona de la puerta
  [0, 0.5, 2],    // Centro del restaurante (pasillo entre mesas)
  [0, 0.5, -1],   // Frente a la barra
  [4, 0.5, 2],    // Pasillo derecho (acceso mesa 1)
  [-4, 0.5, 2],   // Pasillo izquierdo (acceso mesa 2)
];

/**
 * Calcula un path simple con waypoints para que el NPC no atraviese obstáculos.
 * Retorna un array de puntos intermedios (sin incluir start ni end).
 * Algoritmo simple: si el destino requiere cruzar la barra (z < -1 a z > 2),
 * o cruzar una mesa, pasamos por el waypoint del pasillo central primero.
 */
export function calculateNPCPath(start: Vec3, end: Vec3): Vec3[] {
  const [sx, sy, sz] = start;
  const [ex, , ez] = end;

  // Si el NPC está en la zona de espera (z > 5) y va a una silla (z entre 2 y 6),
  // pasamos por el pasillo central para evitar mesas.
  const waypoints: Vec3[] = [];

  // Detección simple: si hay una mesa en medio, añadir waypoint.
  const crossesTable1 = (sx > 2 || ex > 2) && sz > 5 && ez < 5.5;
  const crossesTable2 = (sx < -2 || ex < -2) && sz > 5 && ez < 5.5;
  const crossesBar = (sz > -1 && ez < -1) || (sz < -1 && ez > -1);

  if (crossesBar) {
    // Pasar por frente de la barra
    waypoints.push([0, sy, -1]);
  } else if (crossesTable1 || crossesTable2) {
    // Primero al pasillo central, luego al lado correspondiente
    waypoints.push([0, sy, 2]);
    if (ex > 2) waypoints.push([4, sy, 2]);   // Mesa 1 por la derecha
    if (ex < -2) waypoints.push([-4, sy, 2]); // Mesa 2 por la izquierda
  } else if (Math.abs(sz - ez) > 3 || Math.abs(sx - ex) > 4) {
    // Si hay mucha distancia diagonal, pasamos por el centro
    waypoints.push([0, sy, 2]);
  }

  return waypoints;
}

/**
 * Modelos GLB disponibles para clientes (se alternan al spawnar).
 *
 * ───── DÓNDE TUNEAR EL TAMAÑO Y ROTACIÓN DE LOS NPCs ─────
 *  - `scale`     → tamaño del modelo en escena. El Player usa 2.2 sobre
 *                  player1.glb como referencia. Si el GLB sale enorme,
 *                  baja a ~1.6–2.0; si sale chiquito, sube hacia 2.0–2.5.
 *  - `rotationY` → rotación BASE del modelo (radianes). Algunos GLB se
 *                  exportan mirando -Z, +X, etc. Se aplica como offset
 *                  sobre la rotación dinámica que calcula el sistema de
 *                  movimiento, así puedes "calibrar" hacia dónde mira el
 *                  modelo cuando camina hacia su destino.
 *  - `offsetY`   → ajuste vertical (si el pivote no está en los pies).
 *  - `anims`     → nombres EXACTOS de los clips dentro del GLB
 *                  (verifícalos en Blender o con un visor GLTF).
 *                  Si no coinciden, el modelo se renderiza pero queda
 *                  estático.
 * ───────────────────────────────────────────────────────────
 */
export const CUSTOMER_MODELS: {
  file: string;
  scale: number;
  offsetY: number;
  /** Ajuste vertical aplicado SÓLO mientras el NPC está sentado. Sirve
   *  para corregir si la animación sit_down deja al modelo flotando sobre
   *  la silla o demasiado abajo. Negativo = baja, positivo = sube. */
  seatYOffset: number;
  /** Rotación Y base del modelo, en radianes (calibración por GLB). */
  rotationY: number;
  anims: { walk: string; sit: string };
}[] = [
  {
    // Modelo: Lit Killah (Mixamo). Calibrado a estatura humana ~1.8u.
    file: '/models/npcs/lit_killah_animado.glb',
    scale: 2,
    offsetY: 0,
    seatYOffset: -0.5,
    rotationY: 0,
    anims: { walk: 'walking2', sit: 'sit_down' },
  },
  {
    // Modelo: hombre joven con celular. Mismo rig/escala que litkillah.
    // Clips dentro del GLB: 'walking_phone', 'sit_down'.
    file: '/models/npcs/hombre_npc_animado_cel.glb',
    scale: 0.9,
    offsetY: 0,
    seatYOffset: -0.5,
    rotationY: 0,
    anims: { walk: 'walking_phone', sit: 'sit_down' },
  },
  {
    // Modelo: hombre con caminado tipo mujer. Mismo rig/escala que litkillah.
    // Clips dentro del GLB: 'walking_girl', 'sit_down'.
    file: '/models/npcs/hombre_caminando_como_mujer.glb',
    scale: 1.3,
    offsetY: 0,
    seatYOffset: -0.5,
    rotationY: 0,
    anims: { walk: 'walking_girl', sit: 'sit_down' },
  },
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
  /** Cantidad máxima de clientes simultáneos en escena (esperando + sentados). */
  MAX_CUSTOMERS: 8,
  /** Intervalo (ms) entre intentos de spawn. Si hay slot libre, entra otro. */
  SPAWN_INTERVAL_MS: 2000,
  /** Separación (unidades) entre clientes en la fila de espera. */
  QUEUE_SPACING: 1.5,

  /**
   * Modo de calibración de escalas. Si está activo, los clientes que
   * llegan a la puerta se reciclan automáticamente cada AUTO_RECYCLE_MS
   * para ver distintos modelos sin asignarlos a sillas.
   * Mantenlo en `false` para gameplay normal.
   */
  AUTO_RECYCLE_AT_DOOR: false,
  AUTO_RECYCLE_MS: 4000,
};
