# 🎮 LEGENDS: The Music Career Simulator
## Inventario de Assets 3D (GLB)

> **Total:** 18 archivos GLB necesarios  
> **Estado:** En desarrollo — Descargar según prioridad  
> **Referencia completa:** Ver `glb-assets-legends.md` en la raíz del proyecto

---

## 📁 Estructura de Carpetas

```
public/models/
├── player1.glb                    ✅ Protagonista (YA EXISTE)
├── house.glb                      ✅ Apartamento interior (YA EXISTE)
├── npcs/                          🔴 7 personajes NPCs
│   ├── npc_rent_collector.glb
│   ├── npc_dj_sonic.glb
│   ├── npc_marco.glb
│   ├── npc_daniela.glb
│   ├── npc_shop_vendor.glb
│   └── npc_generic_worker.glb
├── environments/                  🔴 6 entornos/escenas
│   ├── studio_basic.glb
│   ├── studio_pro.glb
│   ├── cafe_interior.glb
│   ├── store_interior.glb
│   └── shop_interior.glb
├── city/                          🔴 1 ciudad exterior
│   └── city_purple.glb
└── props/                         🔴 10 props interactuables + mejoras
    ├── interactables/
    │   ├── prop_bed.glb
    │   ├── prop_computer.glb
    │   ├── prop_sofa.glb
    │   └── prop_mic_stand.glb
    └── upgrades/
        ├── prop_led_lights.glb
        ├── prop_sofa_upgrade.glb
        ├── prop_bed_upgrade.glb
        ├── prop_studio_decor.glb
        ├── prop_soundproofing.glb
        └── prop_motivational_poster.glb
```

---

## 🎯 Prioridad de Descarga

### CRÍTICA (Nivel 1-2) — Necesarios para MVP
- ✅ `player1.glb` — Protagonista (YA EXISTE)
- ✅ `house.glb` — Apartamento (YA EXISTE)
- 🔴 `npcs/npc_rent_collector.glb` — El de la Renta (aparece desde día 1)
- 🔴 `npcs/npc_dj_sonic.glb` — DJ Sonic, mentor (aparece desde día 1)
- 🔴 `npcs/npc_marco.glb` — Jefe del Café (Nivel 2)
- 🔴 `npcs/npc_daniela.glb` — Jefa del Almacén (Nivel 2)
- 🔴 `city/city_purple.glb` — Purple City exterior (Nivel 2)
- 🔴 `environments/cafe_interior.glb` — Interior del Café (Nivel 2)
- 🔴 `environments/store_interior.glb` — Interior del Almacén (Nivel 2)
- 🔴 `props/interactables/prop_bed.glb` — Cama (dormir)
- 🔴 `props/interactables/prop_computer.glb` — Computador (trabajos online)
- 🔴 `props/interactables/prop_mic_stand.glb` — Micrófono (grabar canciones)

### ALTA (Nivel 3-4)
- 🟡 `npcs/npc_shop_vendor.glb` — Vendedor de Purple Sound Shop (Nivel 3)
- 🟡 `npcs/npc_generic_worker.glb` — NPC reutilizable para 4 trabajos (Nivel 3-5)
- 🟡 `environments/shop_interior.glb` — Interior de Purple Sound Shop (Nivel 3)
- 🟡 `environments/studio_pro.glb` — Estudio profesional mejorado (Nivel 4)
- 🟡 `props/upgrades/prop_led_lights.glb` — Iluminación LED (Nivel 3)
- 🟡 `props/upgrades/prop_sofa_upgrade.glb` — Sofá cómodo (Nivel 3)
- 🟡 `props/upgrades/prop_bed_upgrade.glb` — Cama nueva (Nivel 4)

### MEDIA (Nivel 5-6 + Opcionales)
- 🟢 `environments/studio_basic.glb` — Estudio básico (opcional, puede vivir dentro de house.glb)
- 🟢 `props/interactables/prop_sofa.glb` — Sofá básico (opcional, puede vivir dentro de house.glb)
- 🟢 `props/upgrades/prop_studio_decor.glb` — Decoración de estudio (Nivel 4)
- 🟢 `props/upgrades/prop_soundproofing.glb` — Insonorización (Nivel 5)
- 🟢 `props/upgrades/prop_motivational_poster.glb` — Póster motivacional (Nivel 2)

---

## 📥 Fuentes de Descarga Recomendadas

### Personajes con Animaciones
- **[Mixamo](https://www.mixamo.com)** — Personajes 3D + animaciones (GRATIS con cuenta Adobe)
- **[Quaternius](https://quaternius.com)** — Low-poly characters con animaciones (GRATIS)
- **[Ready Player Me](https://readyplayer.me)** — Avatares personalizados exportables (GRATIS)

### Entornos y Props
- **[Kenney.nl](https://kenney.nl/assets)** — Packs completos de muebles, habitaciones, ciudad (CC0 — GRATIS)
- **[PolyHaven](https://polyhaven.com/models)** — Props y materiales de alta calidad (CC0 — GRATIS)
- **[Sketchfab](https://sketchfab.com/search?features=downloadable)** — Enorme variedad (filtrar por licencia CC-BY o gratuita)

### Herramientas de Conversión
- **[Blender](https://www.blender.org)** — Convertir FBX/OBJ a GLB, retocar modelos
- **[gltf.report](https://gltf.report)** — Verificar y optimizar archivos GLB
- **[Three.js Editor](https://threejs.org/editor/)** — Vista previa de GLB en el browser

---

## 🎨 Especificaciones Técnicas

### Personajes (NPCs + Player)
- **Formato:** GLB con armature humanoid
- **Animaciones requeridas:** Idle, Walk, Talk (mínimo)
- **Tamaño recomendado:** < 2MB por personaje
- **Texturas:** Embebidas en el GLB o como archivos separados

### Entornos
- **Formato:** GLB con colisiones embebidas (BoxCollider o mesh separado)
- **Iluminación:** Sin luces embebidas (Three.js maneja la iluminación dinámica)
- **Tamaño recomendado:** < 5MB por escena
- **Optimización:** Usar `gltfpack` antes de poner en `public/`

### Props
- **Formato:** GLB individual por objeto
- **Tamaño recomendado:** < 500KB por prop
- **Pivot:** En la base del objeto para facilitar posicionamiento
- **Materiales:** PBR (Metallic-Roughness workflow)

---

## 🔧 Notas de Implementación

### Carga de Modelos en Three.js
```typescript
import { useGLTF } from '@react-three/drei';

// Ejemplo: Cargar el jugador
const { scene, animations } = useGLTF('/models/player1.glb');

// Ejemplo: Cargar NPC
const { scene: npcScene } = useGLTF('/models/npcs/npc_marco.glb');

// Ejemplo: Cargar prop
const { scene: bedScene } = useGLTF('/models/props/interactables/prop_bed.glb');
```

### Props Reutilizables
Los props que viven dentro de `house.glb` pueden accederse con:
```typescript
const bed = scene.getObjectByName('Bed');
const computer = scene.getObjectByName('Computer');
```

### Mejoras Visuales (Upgrades)
Instanciar con `visible: false` desde el inicio y activar al comprar:
```typescript
const ledLights = useGLTF('/models/props/upgrades/prop_led_lights.glb');
ledLights.scene.visible = playerStore.inventory.includes('led_lights');
```

### NPC Genérico Reutilizable
`npc_generic_worker.glb` se usa para 4 trabajos diferentes cambiando materiales:
```typescript
// Mesero: material con delantal blanco
// Repartidor: material con chaqueta de delivery
// DJ en bar: material con ropa oscura + auriculares
// Instructor: material con ropa formal
```

---

## 📝 Checklist de Assets

### Personajes (7)
- [ ] `player1.glb` ✅ (YA EXISTE)
- [ ] `npcs/npc_rent_collector.glb` 🔴 CRÍTICO
- [ ] `npcs/npc_dj_sonic.glb` 🔴 CRÍTICO
- [ ] `npcs/npc_marco.glb` 🔴 CRÍTICO
- [ ] `npcs/npc_daniela.glb` 🔴 CRÍTICO
- [ ] `npcs/npc_shop_vendor.glb` 🟡 ALTA
- [ ] `npcs/npc_generic_worker.glb` 🟡 ALTA

### Entornos (7)
- [ ] `house.glb` ✅ (YA EXISTE)
- [ ] `city/city_purple.glb` 🔴 CRÍTICO
- [ ] `environments/cafe_interior.glb` 🔴 CRÍTICO
- [ ] `environments/store_interior.glb` 🔴 CRÍTICO
- [ ] `environments/shop_interior.glb` 🟡 ALTA
- [ ] `environments/studio_basic.glb` 🟢 MEDIA (opcional)
- [ ] `environments/studio_pro.glb` 🟡 ALTA

### Props Interactuables (4)
- [ ] `props/interactables/prop_bed.glb` 🔴 CRÍTICO
- [ ] `props/interactables/prop_computer.glb` 🔴 CRÍTICO
- [ ] `props/interactables/prop_sofa.glb` 🟢 MEDIA (opcional)
- [ ] `props/interactables/prop_mic_stand.glb` 🔴 CRÍTICO

### Props de Mejoras (6)
- [ ] `props/upgrades/prop_led_lights.glb` 🟡 ALTA
- [ ] `props/upgrades/prop_sofa_upgrade.glb` 🟡 ALTA
- [ ] `props/upgrades/prop_bed_upgrade.glb` 🟡 ALTA
- [ ] `props/upgrades/prop_studio_decor.glb` 🟢 MEDIA
- [ ] `props/upgrades/prop_soundproofing.glb` 🟢 MEDIA
- [ ] `props/upgrades/prop_motivational_poster.glb` 🟢 MEDIA

---

## 🚀 Próximos Pasos

1. **Descargar assets críticos** (marcados con 🔴) desde las fuentes recomendadas
2. **Convertir a GLB** si vienen en FBX/OBJ usando Blender
3. **Optimizar** con `gltfpack` para reducir tamaño
4. **Verificar** con [gltf.report](https://gltf.report) o [Three.js Editor](https://threejs.org/editor/)
5. **Colocar** en las carpetas correspondientes según esta estructura
6. **Actualizar** este README marcando los assets completados

---

*Documento actualizado: Abril 26, 2026*  
*Responsable: Felipe (3D Engineer)*  
*Referencia completa: `glb-assets-legends.md`*
