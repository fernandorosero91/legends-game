/**
 * 🎮 LEGENDS: Mapa de modelos 3D de accesorios
 * Relaciona cada id de accesorio de la tienda con su archivo GLB.
 * Los GLB viven en public/models/ y se sirven con ruta absoluta "/models/...".
 */

// Ruta del GLB por id de accesorio. Si un id no está aquí, se usa el emoji.
export const ACCESSORY_MODELS: Record<string, string> = {
  basic_mic: '/models/basic_mic.glb',
  pro_mic: '/models/pro_mic.glb',
  studio_headphones: '/models/studio_headphones.glb',
  studio_monitor: '/models/studio_monitor.glb',
  audio_interface: '/models/audio_interface.glb',
  midi_controller: '/models/midi_controller.glb',
  beat_pack: '/models/beat_pack.glb',
  // production_software no tiene modelo 3D (es software) -> usa emoji
};

// Ajustes de escala y posición por modelo, para que todos se vean
// proporcionados en el visor 3D (cada GLB viene en su propia escala).
export interface ModelTransform {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

export const ACCESSORY_TRANSFORMS: Record<string, ModelTransform> = {
  basic_mic:         { scale: 1.0, position: [0, -0.5, 0], rotation: [0, 0, 0] },
  pro_mic:           { scale: 1.0, position: [0, -0.5, 0], rotation: [0, 0, 0] },
  studio_headphones: { scale: 1.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
  studio_monitor:    { scale: 1.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
  audio_interface:   { scale: 1.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
  midi_controller:   { scale: 1.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
  beat_pack:         { scale: 1.0, position: [0, 0, 0],    rotation: [0, 0, 0] },
};

const DEFAULT_TRANSFORM: ModelTransform = {
  scale: 1.0,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
};

export function getAccessoryModel(itemId: string): string | null {
  return ACCESSORY_MODELS[itemId] ?? null;
}

export function getAccessoryTransform(itemId: string): ModelTransform {
  return ACCESSORY_TRANSFORMS[itemId] ?? DEFAULT_TRANSFORM;
}

/* ------------------------------------------------------------------ */
/*  Posición de cada accesorio DENTRO de la habitación (room_level1)   */
/*  La mesa/escritorio está en x≈0.3, y≈1.44, z≈-5.0 (zona Grabar).    */
/*  Estas posiciones colocan cada modelo en un punto lógico del cuarto.*/
/* ------------------------------------------------------------------ */

export interface RoomPlacement {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export const ACCESSORY_ROOM_PLACEMENTS: Record<string, RoomPlacement> = {
  // 🎙️ Micrófonos: encima de la mesa
  basic_mic:         { position: [0.3, 1.5, -5.0],  rotation: [0, 0.4, 0],  scale: 1.0 },
  pro_mic:           { position: [0.3, 1.5, -5.0],  rotation: [0, 0.4, 0],  scale: 1.0 },
  // 🎧 Audífonos: en una esquina de la mesa
  studio_headphones: { position: [-0.8, 1.5, -5.0], rotation: [0, 0.2, 0],  scale: 1.0 },
  // 🔊 Monitores: sobre la mesa, hacia el fondo
  studio_monitor:    { position: [1.4, 1.5, -5.2],  rotation: [0, -0.3, 0], scale: 1.0 },
  // 🎛️ Interfaz de audio: sobre la mesa, al lado
  audio_interface:   { position: [-0.2, 1.5, -4.7], rotation: [0, 0, 0],    scale: 1.0 },
  // 🎹 Controlador MIDI: sobre la mesa, frente al jugador
  midi_controller:   { position: [0.6, 1.5, -4.6],  rotation: [0, 0, 0],    scale: 1.0 },
  // 🥁 Kit de beats (caja): en el suelo junto a la mesa
  beat_pack:         { position: [2.2, 0.3, -4.8],  rotation: [0, 0.5, 0],  scale: 1.0 },
};

export function getAccessoryRoomPlacement(itemId: string): RoomPlacement | null {
  return ACCESSORY_ROOM_PLACEMENTS[itemId] ?? null;
}