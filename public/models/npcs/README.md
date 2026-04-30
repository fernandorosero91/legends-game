# NPCs - Personajes No Jugables

## 📋 Inventario (7 NPCs)

### 🔴 CRÍTICOS (Nivel 1-2)

#### `npc_rent_collector.glb`
- **Descripción:** El de la Renta — Antagonista principal
- **Apariencia:** Hombre 40-50 años, aspecto intimidante, traje deteriorado
- **Animaciones requeridas:** `Idle`, `Walk`, `Talk`, `Angry_Idle`
- **Aparición:** Automática cada atardecer (evento del sistema)
- **Nivel de desbloqueo:** Desde el inicio
- **Fuentes:** [Mixamo](https://www.mixamo.com) — Y Bot con animaciones angry

---

#### `npc_dj_sonic.glb`
- **Descripción:** DJ Sonic — Mentor del jugador
- **Apariencia:** Hombre 32 años, estilo DJ/productor, auriculares, ropa urbana
- **Animaciones requeridas:** `Idle`, `Talk`, `Wave`, `DJ_Scratch`
- **Aparición:** En el estudio y como avatar de mensajes de texto
- **Nivel de desbloqueo:** Desde el inicio
- **Fuentes:** [Mixamo](https://www.mixamo.com) + agregar auriculares en Blender

---

#### `npc_marco.glb`
- **Descripción:** Marco — Jefe del Café Purple Beans
- **Apariencia:** Hombre adulto, delantal de barista, aspecto amigable
- **Animaciones requeridas:** `Idle`, `Talk`, `Work_Counter` (preparar café)
- **Nivel de desbloqueo:** Nivel 2
- **Fuentes:** [Mixamo](https://www.mixamo.com) + agregar delantal en Blender

---

#### `npc_daniela.glb`
- **Descripción:** Daniela — Jefa del Almacén StreetWear
- **Apariencia:** Mujer adulta, look urbano/streetwear
- **Animaciones requeridas:** `Idle`, `Talk`, `Work_Register` (caja registradora)
- **Nivel de desbloqueo:** Nivel 2
- **Fuentes:** [Mixamo](https://www.mixamo.com) — Personaje femenino + animación Typing

---

### 🟡 ALTA PRIORIDAD (Nivel 3-5)

#### `npc_shop_vendor.glb`
- **Descripción:** Vendedor de Purple Sound Shop
- **Apariencia:** Hombre, aspecto de tienda de música, ropa oscura
- **Animaciones requeridas:** `Idle`, `Talk`, `Gesture_Show`
- **Nivel de desbloqueo:** Nivel 3
- **Fuentes:** [Mixamo](https://www.mixamo.com) — Reutilizar base de Marco con diferentes texturas

---

#### `npc_generic_worker.glb`
- **Descripción:** NPC genérico reutilizable para 4 trabajos diferentes
- **Trabajos:** Mesero (restaurante), Repartidor, DJ en bar, Instructor de música
- **Estrategia:** Un solo GLB, 4 variantes de material/texturas
- **Animaciones requeridas:** `Idle`, `Talk`, `Work_Generic`
- **Nivel de desbloqueo:** Nivel 3 (mesero/repartidor), Nivel 4 (DJ bar), Nivel 5 (instructor)
- **Fuentes:** [Quaternius — RPG Character Pack](https://quaternius.com/packs/ultimaterpgpack.html)

**Variantes de material:**
```typescript
// Mesero: delantal blanco, camisa negra
// Repartidor: chaqueta de delivery con logo ficticio
// DJ en bar: ropa oscura + auriculares
// Instructor: ropa formal, aspecto profesional
```

---

## 🎨 Especificaciones Técnicas

### Requisitos Generales
- **Formato:** GLB con armature humanoid
- **Tamaño:** < 2MB por personaje
- **Texturas:** Embebidas en el GLB
- **Rig:** Compatible con Mixamo (65 bones standard)

### Animaciones Mínimas
Todos los NPCs deben tener al menos:
- `Idle` — Animación de espera
- `Talk` — Animación de hablar (movimiento de boca/gestos)
- `Walk` — Caminar (opcional, para NPCs que se mueven)

### Animaciones Específicas
- **El de la Renta:** `Angry_Idle` (brazos cruzados, postura amenazante)
- **DJ Sonic:** `DJ_Scratch` (movimiento de manos en tornamesa)
- **Marco:** `Work_Counter` (preparar café, limpiar mostrador)
- **Daniela:** `Work_Register` (teclear en caja registradora)
- **Vendedor:** `Gesture_Show` (mostrar productos con las manos)

---

## 🔧 Implementación en Three.js

### Carga de NPC
```typescript
import { useGLTF, useAnimations } from '@react-three/drei';

function NPC({ modelPath, position, animation = 'Idle' }) {
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);
  
  useEffect(() => {
    actions[animation]?.play();
  }, [animation, actions]);
  
  return <primitive object={scene} position={position} />;
}

// Uso:
<NPC 
  modelPath="/models/npcs/npc_marco.glb" 
  position={[2, 0, 3]} 
  animation="Work_Counter" 
/>
```

### NPC Genérico con Variantes
```typescript
const WORKER_MATERIALS = {
  waiter: { uniform: 'white_apron', color: '#ffffff' },
  delivery: { uniform: 'delivery_jacket', color: '#ff6b35' },
  dj: { uniform: 'dark_clothes', color: '#1a1a1a' },
  instructor: { uniform: 'formal_wear', color: '#2c3e50' },
};

function GenericWorker({ job, position }) {
  const { scene } = useGLTF('/models/npcs/npc_generic_worker.glb');
  const material = WORKER_MATERIALS[job];
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(material.color);
      }
    });
  }, [job, scene]);
  
  return <primitive object={scene} position={position} />;
}
```

---

## 📥 Proceso de Descarga

1. **Ir a [Mixamo](https://www.mixamo.com)**
2. **Seleccionar personaje** según descripción
3. **Agregar animaciones** (Idle, Talk, Walk, etc.)
4. **Descargar en formato FBX** (sin skin, con animaciones)
5. **Abrir en Blender**
6. **Exportar como GLB** (File > Export > glTF 2.0)
   - ✅ Include > Animations
   - ✅ Geometry > Apply Modifiers
   - ✅ Compression > Draco (opcional, reduce tamaño)
7. **Optimizar con gltfpack** (opcional):
   ```bash
   gltfpack -i npc_marco.glb -o npc_marco_optimized.glb
   ```
8. **Verificar en [gltf.report](https://gltf.report)**
9. **Colocar en `public/models/npcs/`**

---

## ✅ Checklist

- [ ] `npc_rent_collector.glb` 🔴 CRÍTICO
- [ ] `npc_dj_sonic.glb` 🔴 CRÍTICO
- [ ] `npc_marco.glb` 🔴 CRÍTICO
- [ ] `npc_daniela.glb` 🔴 CRÍTICO
- [ ] `npc_shop_vendor.glb` 🟡 ALTA
- [ ] `npc_generic_worker.glb` 🟡 ALTA

---

*Responsable: Felipe (3D Engineer)*  
*Última actualización: Abril 26, 2026*
