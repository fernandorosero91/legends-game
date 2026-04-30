# Environments - Entornos e Interiores

## 📋 Inventario (6 Entornos)

### 🔴 CRÍTICOS (Nivel 2)

#### `cafe_interior.glb`
- **Descripción:** Interior del Café Purple Beans
- **Contenido:** Mostrador largo, máquina de espresso, menú en pizarra, 2-3 mesas con sillas, ventana con vista a la ciudad
- **Estilo:** Café urbano cálido, tonos marrones y verdes
- **Iluminación:** Sin luces embebidas (Three.js maneja la iluminación)
- **Colisiones:** Embebidas como BoxCollider o mesh separado
- **Nivel de desbloqueo:** Nivel 2
- **Fuentes:** 
  - [Sketchfab — "cafe interior"](https://sketchfab.com/search?q=cafe+interior&type=models&features=downloadable)
  - [Kenney.nl — Furniture Pack](https://kenney.nl/assets) + Food Pack
  - [PolyHaven](https://polyhaven.com/models) — Props individuales

---

#### `store_interior.glb`
- **Descripción:** Interior del Almacén StreetWear
- **Contenido:** Estantes con ropa doblada, zapatillas en exhibición, caja registradora, espejos, letreros de neón con logos ficticios
- **Estilo:** Streetwear urbano, oscuro con acentos neón
- **Props visuales:** Ropa en exhibición, logos de marcas ficticias, ventana con vista a la ciudad
- **Nivel de desbloqueo:** Nivel 2
- **Fuentes:**
  - [Sketchfab — "clothing store interior"](https://sketchfab.com/search?q=clothing+store&type=models&features=downloadable)
  - [Kenney.nl — Furniture Kit](https://kenney.nl/assets/furniture-kit)

---

### 🟡 ALTA PRIORIDAD (Nivel 3-4)

#### `shop_interior.glb`
- **Descripción:** Interior de Purple Sound Shop (tienda de equipamiento musical)
- **Contenido:** Vitrinas con micrófonos y auriculares, estantes con equipos, pósters de artistas ficticios, mostrador de atención
- **Estilo:** Tienda de música urbana, paleta púrpura/dorado
- **Props:** Instrumentos, equipos de audio, pósters
- **Nivel de desbloqueo:** Nivel 3
- **Fuentes:**
  - [Sketchfab — "music store"](https://sketchfab.com/search?q=music+store&type=models&features=downloadable)
  - Props de instrumentos: [Sketchfab — "microphone"](https://sketchfab.com/search?q=microphone&type=models&features=downloadable)

---

#### `studio_pro.glb`
- **Descripción:** Estudio profesional / mejorado (versión premium del estudio básico)
- **Contenido:** Consola de mezcla, múltiples monitores de estudio, cabina de grabación visible, iluminación LED
- **Estilo:** Estudio profesional de grabación, high-end
- **Nivel de desbloqueo:** Nivel 4 (al comprar mejoras de apartamento)
- **Fuentes:**
  - [Sketchfab — "professional recording studio"](https://sketchfab.com/search?q=professional+recording+studio&type=models&features=downloadable)
  - [CGTrader — recording studio free](https://www.cgtrader.com/free-3d-models/interior/other/recording-studio)

---

### 🟢 MEDIA PRIORIDAD (Opcional)

#### `studio_basic.glb`
- **Descripción:** Zona de estudio de grabación básica (puede vivir dentro de house.glb)
- **Contenido:** Micrófono, audífonos colgados, espuma acústica básica en paredes, mesa con laptop
- **Estilo:** Setup de grabación casero, low-budget
- **Nivel de desbloqueo:** Desde el inicio
- **Nota:** Este puede ser parte de `house.glb` en lugar de un archivo separado
- **Fuentes:**
  - [Sketchfab — "recording studio"](https://sketchfab.com/search?q=recording+studio&type=models&features=downloadable)
  - Construir en Blender con props de [PolyHaven](https://polyhaven.com/models)

---

## 🎨 Especificaciones Técnicas

### Requisitos Generales
- **Formato:** GLB con colisiones embebidas
- **Tamaño:** < 5MB por escena
- **Iluminación:** Sin luces embebidas (Three.js maneja la iluminación dinámica)
- **Texturas:** Embebidas en el GLB o como archivos separados
- **Optimización:** Usar `gltfpack` antes de poner en `public/`

### Colisiones
Dos opciones para implementar colisiones:

**Opción 1: BoxColliders embebidos**
```typescript
// En Blender, crear objetos invisibles con nombre "Collider_*"
// En Three.js, detectarlos y usarlos para física
scene.traverse((child) => {
  if (child.name.startsWith('Collider_')) {
    // Usar como BoxCollider
  }
});
```

**Opción 2: Mesh de colisión separado**
```typescript
// Mesh simplificado con nombre "Collision"
const collisionMesh = scene.getObjectByName('Collision');
collisionMesh.visible = false; // Invisible pero con física
```

### Materiales
- **PBR Workflow:** Metallic-Roughness
- **Texturas recomendadas:** BaseColor, Normal, Metallic-Roughness
- **Resolución:** 1024x1024 o 2048x2048 máximo

---

## 🔧 Implementación en Three.js

### Carga de Entorno
```typescript
import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

function CafeInterior() {
  const { scene } = useGLTF('/models/environments/cafe_interior.glb');
  
  useEffect(() => {
    // Configurar sombras
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  
  return <primitive object={scene} />;
}
```

### Iluminación Dinámica por Turno
```typescript
const LIGHTING_BY_TIME = {
  morning: {
    ambientColor: '#fff5e0',
    ambientIntensity: 0.8,
    directionalColor: '#ffffff',
    directionalIntensity: 1.0,
    sunAngle: 30,
  },
  afternoon: {
    ambientColor: '#ffffff',
    ambientIntensity: 1.0,
    directionalColor: '#ffffff',
    directionalIntensity: 1.2,
    sunAngle: 60,
  },
  evening: {
    ambientColor: '#ff8c42',
    ambientIntensity: 0.6,
    directionalColor: '#ff6b35',
    directionalIntensity: 0.8,
    sunAngle: 10,
  },
  night: {
    ambientColor: '#1a1a3e',
    ambientIntensity: 0.2,
    directionalColor: '#4a5568',
    directionalIntensity: 0.3,
    sunAngle: -20,
  },
};

function DynamicLighting({ timeOfDay }) {
  const lighting = LIGHTING_BY_TIME[timeOfDay];
  
  return (
    <>
      <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />
      <directionalLight
        color={lighting.directionalColor}
        intensity={lighting.directionalIntensity}
        position={[10, 10, 5]}
        castShadow
      />
    </>
  );
}
```

### Acceso a Props Embebidos
```typescript
// Si el entorno tiene props nombrados dentro del GLB
const { scene } = useGLTF('/models/environments/cafe_interior.glb');

const counter = scene.getObjectByName('Counter');
const espressoMachine = scene.getObjectByName('EspressoMachine');
const menu = scene.getObjectByName('MenuBoard');

// Hacer interactuables
counter.userData.interactable = true;
counter.userData.action = 'work';
```

---

## 📥 Proceso de Descarga y Preparación

### Desde Sketchfab
1. **Buscar** el entorno deseado (ej: "cafe interior")
2. **Filtrar** por "Downloadable" y licencia CC-BY o gratuita
3. **Descargar** en formato GLB (preferido) o FBX
4. **Abrir en Blender** si es FBX
5. **Verificar escala** (1 unidad = 1 metro en Three.js)
6. **Agregar colisiones** (BoxColliders o mesh simplificado)
7. **Exportar como GLB**

### Desde Kenney.nl (Modular)
1. **Descargar** el pack completo (ej: Furniture Kit)
2. **Abrir en Blender**
3. **Construir la escena** combinando piezas modulares
4. **Agregar colisiones**
5. **Exportar como GLB**

### Optimización
```bash
# Comprimir con gltfpack
gltfpack -i cafe_interior.glb -o cafe_interior_optimized.glb -cc

# Verificar tamaño y stats
gltf-transform inspect cafe_interior_optimized.glb
```

---

## 🎯 Guía de Estilo Visual

### Café Purple Beans
- **Paleta:** Marrones cálidos, verdes suaves, madera natural
- **Ambiente:** Acogedor, iluminación cálida
- **Props clave:** Máquina de espresso (elemento central), menú en pizarra, plantas

### Almacén StreetWear
- **Paleta:** Negros, grises, neones (púrpura, cyan)
- **Ambiente:** Urbano, moderno, iluminación dramática
- **Props clave:** Zapatillas en exhibición, espejos, logos de marcas ficticias

### Purple Sound Shop
- **Paleta:** Púrpura oscuro, dorado, negro
- **Ambiente:** Tienda de música premium, iluminación focal en productos
- **Props clave:** Vitrinas con micrófonos, auriculares, pósters de artistas

### Estudio Profesional
- **Paleta:** Negros, grises oscuros, LEDs de colores
- **Ambiente:** High-tech, profesional, iluminación LED ambiental
- **Props clave:** Consola de mezcla, monitores de estudio, cabina de grabación

---

## ✅ Checklist

- [ ] `cafe_interior.glb` 🔴 CRÍTICO
- [ ] `store_interior.glb` 🔴 CRÍTICO
- [ ] `shop_interior.glb` 🟡 ALTA
- [ ] `studio_pro.glb` 🟡 ALTA
- [ ] `studio_basic.glb` 🟢 MEDIA (opcional)

---

*Responsable: Felipe (3D Engineer)*  
*Última actualización: Abril 26, 2026*
