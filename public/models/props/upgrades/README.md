# Props de Mejoras - Upgrades del Apartamento

## 📋 Inventario (6 Upgrades)

Estos props se activan al comprar el item correspondiente en Purple Sound Shop. Reemplazan o se añaden sobre los props base en la escena del apartamento.

---

## 🟡 ALTA PRIORIDAD (Nivel 3-4)

### `prop_led_lights.glb`
- **Descripción:** Tiras de luz LED alrededor del estudio
- **Efecto:** Cambia el ambiente visual del apartamento (iluminación ambiental púrpura/cyan)
- **Activación:** Comprar "Iluminación LED" ($300) — Nivel 3
- **Implementación:** Agregar a la escena con `visible: false`, activar al comprar
- **Fuentes:**
  - Construir en Blender: tiras de tubo simples con material emisivo
  - [Sketchfab — "neon light"](https://sketchfab.com/search?q=neon+light&type=models&features=downloadable)

**Código de ejemplo:**
```typescript
const ledLights = useGLTF('/models/props/upgrades/prop_led_lights.glb');
ledLights.scene.visible = playerStore.inventory.includes('led_lights');

// Material emisivo
ledLights.scene.traverse((child) => {
  if (child.isMesh) {
    child.material.emissive.set('#9d4edd');
    child.material.emissiveIntensity = 1.5;
  }
});
```

---

### `prop_sofa_upgrade.glb`
- **Descripción:** Sofá cómodo (versión premium)
- **Efecto:** Reemplaza `prop_sofa.glb`, +5 energía al descansar (total: 25 en lugar de 20)
- **Activación:** Comprar "Sofá cómodo" ($800) — Nivel 3
- **Implementación:** Swap del modelo del sofá
- **Fuentes:**
  - [Sketchfab — "modern sofa"](https://sketchfab.com/search?q=modern+sofa&type=models&features=downloadable)
  - [PolyHaven](https://polyhaven.com/models)

**Código de ejemplo:**
```typescript
function Sofa() {
  const hasSofaUpgrade = playerStore.inventory.includes('sofa_upgrade');
  const modelPath = hasSofaUpgrade
    ? '/models/props/upgrades/prop_sofa_upgrade.glb'
    : '/models/props/interactables/prop_sofa.glb';
  
  const energyBonus = hasSofaUpgrade ? 25 : 20;
  
  return (
    <InteractableObject
      modelPath={modelPath}
      onInteract={() => playerStore.changeEnergy(energyBonus)}
    />
  );
}
```

---

### `prop_bed_upgrade.glb`
- **Descripción:** Cama nueva (versión premium)
- **Efecto:** Reemplaza `prop_bed.glb`, +10 energía al dormir (total: 60 en lugar de 50)
- **Activación:** Comprar "Cama nueva" ($1,200) — Nivel 4
- **Implementación:** Swap del modelo de la cama
- **Fuentes:**
  - [PolyHaven — bed](https://polyhaven.com/models)
  - [Sketchfab — "double bed"](https://sketchfab.com/search?q=double+bed&type=models&features=downloadable)

**Código de ejemplo:**
```typescript
function Bed() {
  const hasBedUpgrade = playerStore.inventory.includes('bed_upgrade');
  const modelPath = hasBedUpgrade
    ? '/models/props/upgrades/prop_bed_upgrade.glb'
    : '/models/props/interactables/prop_bed.glb';
  
  const energyBonus = hasBedUpgrade ? 60 : 50;
  
  return (
    <InteractableObject
      modelPath={modelPath}
      onInteract={() => {
        playerStore.changeEnergy(energyBonus);
        gameStore.advanceDay();
      }}
    />
  );
}
```

---

## 🟢 MEDIA PRIORIDAD (Nivel 4-5)

### `prop_studio_decor.glb`
- **Descripción:** Decoración del estudio (posters, paneles acústicos de colores, luz ambiental)
- **Efecto:** Se añade sobre el studio_basic, mejora visual del estudio
- **Activación:** Comprar "Decoración de estudio" ($500) — Nivel 4
- **Implementación:** Agregar a la escena con `visible: false`, activar al comprar
- **Fuentes:**
  - [Sketchfab — "acoustic panel"](https://sketchfab.com/search?q=acoustic+panel&type=models&features=downloadable)
  - Crear pósters como planos con textura personalizada en Blender (PNG con diseño propio)

**Contenido sugerido:**
- 2-3 pósters de artistas ficticios en las paredes
- Paneles acústicos de colores (púrpura, cyan)
- Luz ambiental de ambiente (LED strip detrás del escritorio)

---

### `prop_soundproofing.glb`
- **Descripción:** Paneles de insonorización en las paredes del estudio
- **Efecto:** Look profesional, +10% calidad de grabación (bonus en rhythmSystem)
- **Activación:** Comprar "Insonorización" ($2,000) — Nivel 5
- **Implementación:** Agregar a la escena, aplicar bonus en rhythmSystem
- **Fuentes:**
  - [Sketchfab — "soundproofing foam"](https://sketchfab.com/search?q=soundproofing+foam&type=models&features=downloadable)
  - Construir en Blender con un plano + normal map de foam acústico

**Código de ejemplo:**
```typescript
// En rhythmSystem.ts
const qualityBonus = playerStore.inventory.includes('soundproofing') ? 1.1 : 1.0;
const finalQuality = baseQuality * qualityBonus;
```

---

### `prop_motivational_poster.glb`
- **Descripción:** Póster motivacional en la pared del apartamento
- **Efecto:** Pequeño detalle visual, +2% reputación por canción
- **Activación:** Comprar "Póster motivacional" ($100) — Nivel 2
- **Implementación:** Agregar a la escena con `visible: false`, activar al comprar
- **Fuentes:**
  - Crear en Blender: plano rectangular con textura PNG personalizada
  - Menos de 10 minutos de trabajo

**Textos sugeridos para el póster:**
- "LEGENDS ARE MADE, NOT BORN"
- "PURPLE CITY NEVER SLEEPS"
- "HUSTLE HARD, SHINE HARDER"
- "FROM ZERO TO HERO"

**Código de ejemplo:**
```typescript
// Crear en Blender
// 1. Agregar plano (Shift+A > Mesh > Plane)
// 2. Escalar a proporción de póster (0.5 x 0.7)
// 3. Agregar material con textura PNG
// 4. Exportar como GLB

// En rhythmSystem.ts
const reputationBonus = playerStore.inventory.includes('motivational_poster') ? 1.02 : 1.0;
const finalReputation = baseReputation * reputationBonus;
```

---

## 🎨 Especificaciones Técnicas

### Requisitos Generales
- **Formato:** GLB
- **Tamaño:** < 500KB por prop (< 100KB para póster)
- **Materiales:** PBR para props físicos, emisivos para LEDs
- **Pivot:** En la base o centro según el tipo de objeto

### Materiales Emisivos (LEDs)
```typescript
// Para prop_led_lights.glb
material.emissive.set('#9d4edd'); // Color púrpura
material.emissiveIntensity = 1.5; // Intensidad
material.toneMapped = false; // Para que brille más
```

### Texturas Personalizadas (Pósters)
- **Resolución:** 512x512 o 1024x1024
- **Formato:** PNG con transparencia
- **Diseño:** Tipografía bold, colores púrpura/cyan/dorado
- **Herramientas:** Figma, Photoshop, Canva

---

## 🔧 Implementación en Three.js

### Sistema de Upgrades
```typescript
// En ApartmentScene.tsx
function ApartmentUpgrades() {
  const inventory = playerStore.inventory;
  
  return (
    <>
      {/* LED Lights */}
      {inventory.includes('led_lights') && (
        <primitive
          object={useGLTF('/models/props/upgrades/prop_led_lights.glb').scene}
          position={[0, 2.5, -3]}
        />
      )}
      
      {/* Studio Decor */}
      {inventory.includes('studio_decor') && (
        <primitive
          object={useGLTF('/models/props/upgrades/prop_studio_decor.glb').scene}
          position={[0, 0, -3]}
        />
      )}
      
      {/* Soundproofing */}
      {inventory.includes('soundproofing') && (
        <primitive
          object={useGLTF('/models/props/upgrades/prop_soundproofing.glb').scene}
          position={[0, 0, -3]}
        />
      )}
      
      {/* Motivational Poster */}
      {inventory.includes('motivational_poster') && (
        <primitive
          object={useGLTF('/models/props/upgrades/prop_motivational_poster.glb').scene}
          position={[-2, 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      )}
    </>
  );
}
```

### Iluminación Dinámica con LEDs
```typescript
// Cuando se activan los LEDs, cambiar la iluminación ambiental
function ApartmentLighting() {
  const hasLEDs = playerStore.inventory.includes('led_lights');
  
  return (
    <>
      <ambientLight
        color={hasLEDs ? '#9d4edd' : '#ffffff'}
        intensity={hasLEDs ? 0.6 : 0.5}
      />
      
      {hasLEDs && (
        <>
          <pointLight position={[0, 2.5, -3]} color="#9d4edd" intensity={1} distance={5} />
          <pointLight position={[2, 2.5, -3]} color="#00d9ff" intensity={1} distance={5} />
        </>
      )}
    </>
  );
}
```

### Bonus de Equipamiento
```typescript
// En rhythmSystem.ts
export function calculateSongQuality(rhythmScore: number): SongQuality {
  const inventory = playerStore.inventory;
  
  // Bonus de equipamiento
  let qualityMultiplier = 1.0;
  
  if (inventory.includes('soundproofing')) {
    qualityMultiplier += 0.1; // +10%
  }
  
  if (inventory.includes('studio_decor')) {
    qualityMultiplier += 0.05; // +5%
  }
  
  const finalScore = rhythmScore * qualityMultiplier;
  
  if (finalScore >= 90) return 'masterpiece';
  if (finalScore >= 70) return 'high';
  if (finalScore >= 50) return 'medium';
  return 'low';
}
```

---

## 📥 Proceso de Creación

### Para Props Físicos (Sofá, Cama, LEDs)
1. **Buscar en las fuentes recomendadas**
2. **Descargar en formato GLB o FBX**
3. **Abrir en Blender**
4. **Ajustar escala y pivot**
5. **Configurar materiales** (emisivos para LEDs)
6. **Exportar como GLB**
7. **Optimizar con gltfpack**
8. **Verificar en [gltf.report](https://gltf.report)**

### Para Pósters (Motivational Poster)
1. **Diseñar en Figma/Photoshop/Canva**
   - Tamaño: 1024x1024 px
   - Tipografía bold
   - Colores: púrpura (#9d4edd), cyan (#00d9ff), dorado (#ffd60a)
2. **Exportar como PNG**
3. **Abrir Blender**
4. **Agregar plano** (Shift+A > Mesh > Plane)
5. **Escalar** a proporción de póster (0.5 x 0.7)
6. **Agregar material** con textura PNG
7. **Exportar como GLB**

---

## 🎯 Guía de Diseño

### Estilo Visual
- **LEDs:** Neones púrpura y cyan, efecto glow
- **Sofá/Cama Upgrade:** Más moderno, colores oscuros con acentos
- **Studio Decor:** Paneles acústicos de colores, pósters de artistas ficticios
- **Soundproofing:** Foam acústico gris/negro, look profesional
- **Póster:** Tipografía bold, mensaje motivacional, colores de Purple City

### Coherencia Visual
Todos los upgrades deben seguir la paleta de Purple City:
- **Púrpura:** #9d4edd
- **Cyan:** #00d9ff
- **Dorado:** #ffd60a
- **Negro:** #1a1a1a
- **Gris oscuro:** #2c2c2c

---

## ✅ Checklist

- [ ] `prop_led_lights.glb` 🟡 ALTA
- [ ] `prop_sofa_upgrade.glb` 🟡 ALTA
- [ ] `prop_bed_upgrade.glb` 🟡 ALTA
- [ ] `prop_studio_decor.glb` 🟢 MEDIA
- [ ] `prop_soundproofing.glb` 🟢 MEDIA
- [ ] `prop_motivational_poster.glb` 🟢 MEDIA

---

*Responsable: Felipe (3D Engineer)*  
*Última actualización: Abril 26, 2026*
