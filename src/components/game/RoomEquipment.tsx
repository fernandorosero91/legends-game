/**
 * LEGENDS: RoomEquipment — Renders purchased equipment as 3D models in rooms.
 *
 * Positions come from InsForge DB (table: equipment_positions):
 * - DEFAULT positions: configured by admin, apply to ALL users
 * - User positions: personal overrides when a user moves an item
 *
 * Priority: user override > DEFAULT
 *
 * Press P to enter edit mode:
 * - Click item = grab (follows mouse on surfaces)
 * - Click again = drop & save to DB as user override
 * - Scroll = height
 * - R / T = rotate CW / CCW
 * - + / - = scale
 * - P = exit edit mode
 */

import { Suspense, useMemo, useState, useCallback, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { insforge } from '../../services/insforge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Placement {
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

type RoomPlacements = Record<string, Placement>;

// ─── Equipment config ────────────────────────────────────────────────────────

interface EquipmentConfig {
  model: string;
  defaultScale: number;
}

const EQUIPMENT_MODELS: Record<string, EquipmentConfig> = {
  usb_mic:           { model: '/models/shop/usb_mic.glb',           defaultScale: 0.3 },
  basic_mic:         { model: '/models/shop/basic_mic.glb',         defaultScale: 0.3 },
  pro_mic:           { model: '/models/shop/pro_mic.glb',           defaultScale: 0.1 },
  studio_headphones: { model: '/models/shop/studio_headphones.glb', defaultScale: 0.3 },
  studio_monitor:    { model: '/models/shop/studio_monitor.glb',    defaultScale: 0.5 },
  audio_interface:   { model: '/models/shop/audio_interface.glb',   defaultScale: 0.25 },
  midi_controller:   { model: '/models/shop/midi_controller.glb',   defaultScale: 0.02 },
  beat_pack:         { model: '/models/shop/beat_pack.glb',         defaultScale: 0.3 },
};

// ─── DB Service ──────────────────────────────────────────────────────────────

/**
 * Loads placements for a room. Merges DEFAULT + user overrides.
 * User overrides take priority over DEFAULT.
 */
async function loadPlacements(userId: string | null, roomKey: string): Promise<RoomPlacements> {
  try {
    // Load DEFAULT positions (apply to everyone)
    const { data: defaults } = await insforge.database
      .from('equipment_positions')
      .select('*')
      .eq('user_id', 'DEFAULT')
      .eq('room_key', roomKey);

    // Load user-specific overrides (if logged in)
    let userOverrides: any[] = [];
    if (userId) {
      const { data } = await insforge.database
        .from('equipment_positions')
        .select('*')
        .eq('user_id', userId)
        .eq('room_key', roomKey);
      userOverrides = data || [];
    }

    // Merge: start with defaults, override with user positions
    const placements: RoomPlacements = {};

    for (const row of (defaults || [])) {
      placements[row.item_id] = {
        position: [row.position_x, row.position_y, row.position_z],
        rotationY: row.rotation_y,
        scale: row.scale,
      };
    }

    for (const row of userOverrides) {
      placements[row.item_id] = {
        position: [row.position_x, row.position_y, row.position_z],
        rotationY: row.rotation_y,
        scale: row.scale,
      };
    }

    return placements;
  } catch (err) {
    console.error('[RoomEquipment] DB load error:', err);
    return {};
  }
}

/**
 * Saves a user's custom position override to DB.
 */
async function saveUserPosition(userId: string, roomKey: string, itemId: string, placement: Placement): Promise<void> {
  try {
    await insforge.database
      .from('equipment_positions')
      .upsert([{
        user_id: userId,
        room_key: roomKey,
        item_id: itemId,
        position_x: placement.position[0],
        position_y: placement.position[1],
        position_z: placement.position[2],
        rotation_y: placement.rotationY,
        scale: placement.scale,
        updated_at: new Date().toISOString(),
      }], { onConflict: 'user_id,room_key,item_id' });
  } catch (err) {
    console.error('[RoomEquipment] DB save error:', err);
  }
}

// ─── Equipment Model ─────────────────────────────────────────────────────────

function EquipmentModel({ modelPath, position, rotationY, scale, highlight }: {
  modelPath: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  highlight: boolean;
}) {
  const { scene } = useGLTF(modelPath);
  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.name = `__equip_${child.name}`;
      }
    });
    return c;
  }, [scene]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={clone} />
      {highlight && (
        <mesh position={[0, 0.5, 0]}>
          <ringGeometry args={[0.2, 0.3, 16]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RoomEquipment() {
  const inventory = usePlayerStore((s) => s.inventory);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const user = useAuthStore((s) => s.user);

  const [editMode, setEditMode] = useState(false);
  const [grabbedItem, setGrabbedItem] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<[number, number, number]>([0, 1, 0]);
  const [cursorRotation, setCursorRotation] = useState(0);
  const [cursorScale, setCursorScale] = useState(0.3);
  const [placements, setPlacements] = useState<RoomPlacements>({});
  const [loaded, setLoaded] = useState(false);
  const { gl } = useThree();

  const roomKey = `${currentRoom}_lv${currentLevel}`;
  const userId = user?.id || null;

  // Load positions from DB (DEFAULT + user overrides)
  useEffect(() => {
    setLoaded(false);
    loadPlacements(userId, roomKey).then((data) => {
      setPlacements(data);
      setLoaded(true);
    });
  }, [userId, roomKey]);

  // Equipment items from inventory that have a 3D model
  const equipmentItems = useMemo(() => {
    return inventory.filter((item) => EQUIPMENT_MODELS[item.itemId] !== undefined);
  }, [inventory]);

  // Save placement (user override)
  const savePlacement = useCallback((itemId: string, placement: Placement) => {
    setPlacements((prev) => ({ ...prev, [itemId]: placement }));
    if (userId) {
      saveUserPosition(userId, roomKey, itemId, placement);
    }
  }, [userId, roomKey]);

  // ─── Keyboard & scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setEditMode((prev) => { if (prev) setGrabbedItem(null); return !prev; });
        return;
      }
      if (!editMode || !grabbedItem) return;
      if (e.key === 'r' || e.key === 'R') setCursorRotation((r) => r + Math.PI / 12);
      if (e.key === 't' || e.key === 'T') setCursorRotation((r) => r - Math.PI / 12);
      if (e.key === '+' || e.key === '=') setCursorScale((s) => +(s + 0.05).toFixed(3));
      if (e.key === '-' || e.key === '_') setCursorScale((s) => Math.max(0.01, +(s - 0.05).toFixed(3)));
    };

    const handleWheel = (e: WheelEvent) => {
      if (!editMode || !grabbedItem) return;
      e.preventDefault();
      setCursorPos((prev) => [prev[0], Math.max(0, prev[1] + (e.deltaY > 0 ? -0.1 : 0.1)), prev[2]]);
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [editMode, grabbedItem]);

  // ─── Mouse tracking: snap to surfaces ──────────────────────────────────────
  useFrame(({ pointer, camera, scene: r3fScene }) => {
    if (!editMode || !grabbedItem) return;

    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);

    const intersectables: THREE.Object3D[] = [];
    r3fScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && !obj.name.startsWith('__equip_')) {
        intersectables.push(obj);
      }
    });

    const hits = ray.intersectObjects(intersectables, false);
    if (hits.length > 0) {
      setCursorPos([hits[0].point.x, hits[0].point.y, hits[0].point.z]);
    }
  });

  // ─── Click: grab or drop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!editMode) return;
    const handleClick = () => {
      if (grabbedItem) {
        savePlacement(grabbedItem, { position: cursorPos, rotationY: cursorRotation, scale: cursorScale });
        setGrabbedItem(null);
      }
    };
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [editMode, grabbedItem, cursorPos, cursorRotation, cursorScale, savePlacement, gl]);

  // ─── Grab handler ──────────────────────────────────────────────────────────
  const handleGrab = useCallback((itemId: string, e: any) => {
    if (!editMode || grabbedItem) return;
    e.stopPropagation();
    const existing = placements[itemId];
    const config = EQUIPMENT_MODELS[itemId];
    setCursorPos(existing?.position ?? [0, 1, 0]);
    setCursorRotation(existing?.rotationY ?? 0);
    setCursorScale(existing?.scale ?? config?.defaultScale ?? 0.3);
    setGrabbedItem(itemId);
  }, [editMode, grabbedItem, placements]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (equipmentItems.length === 0 || !loaded) return null;

  return (
    <Suspense fallback={null}>
      {equipmentItems.map((item) => {
        const config = EQUIPMENT_MODELS[item.itemId]!;
        const saved = placements[item.itemId];

        // Currently grabbed — follows cursor
        if (grabbedItem === item.itemId) {
          return (
            <EquipmentModel
              key={item.itemId}
              modelPath={config.model}
              position={cursorPos}
              rotationY={cursorRotation}
              scale={cursorScale}
              highlight={true}
            />
          );
        }

        // Has a position (from DEFAULT or user override) — render in place
        if (saved) {
          return (
            <group key={item.itemId} onPointerDown={(e) => handleGrab(item.itemId, e)}>
              <EquipmentModel
                modelPath={config.model}
                position={saved.position}
                rotationY={saved.rotationY}
                scale={saved.scale}
                highlight={editMode}
              />
            </group>
          );
        }

        // No position at all — only show in edit mode for placement
        if (editMode) {
          const idx = equipmentItems.indexOf(item);
          return (
            <group key={item.itemId} onPointerDown={(e) => handleGrab(item.itemId, e)}>
              <EquipmentModel
                modelPath={config.model}
                position={[idx * 1.2 - 2, 0.5, 5]}
                rotationY={0}
                scale={config.defaultScale}
                highlight={true}
              />
            </group>
          );
        }

        return null;
      })}
    </Suspense>
  );
}
