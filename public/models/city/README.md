# City - Purple City Exterior

## 📋 Inventario (1 Entorno)

### 🔴 CRÍTICO (Nivel 2)

#### `city_purple.glb`
- **Descripción:** Purple City exterior — Mapa principal de la ciudad
- **Contenido:** Calles, edificios de fondo, fachadas de los 6 lugares de trabajo y la tienda
- **Estilo visual:** Urbano nocturno, neones, paleta púrpura oscura
- **Nivel de desbloqueo:** Nivel 2 (cuando se habilitan trabajos físicos)

---

## 🏙️ Lugares que Deben Estar en el Mapa

La ciudad debe tener fachadas reconocibles para los siguientes lugares:

| Lugar | Nivel | Descripción Visual |
|-------|-------|-------------------|
| 🏠 **Apartamento del jugador** | 1 | Edificio residencial, punto de inicio/retorno |
| ☕ **Café Purple Beans** | 2 | Fachada de café con letrero, ventanas grandes |
| 👕 **Almacén StreetWear** | 2 | Tienda urbana con maniquíes en vitrina, neones |
| 🍽️ **Restaurante La Esquina** | 3 | Fachada de restaurante, mesas exteriores |
| 📦 **Delivery Express** | 3 | Oficina de delivery, logo de empresa |
| 🎵 **Bar Neon Nights** | 4 | Bar nocturno con neones brillantes |
| 🎸 **Academia SoundWave** | 5 | Escuela de música, letrero profesional |
| 🎧 **Purple Sound Shop** | 3 | Tienda de equipamiento musical, vitrinas con productos |

---

## 🎨 Especificaciones Técnicas

### Requisitos Generales
- **Formato:** GLB
- **Tamaño:** < 10MB (puede ser más grande que otros entornos)
- **Estilo:** Low-poly estilizado o semi-realista
- **Iluminación:** Sin luces embebidas (Three.js maneja la iluminación nocturna)
- **Colisiones:** Opcionales si la navegación es por menú/transición

### Paleta de Colores
```typescript
const CITY_PALETTE = {
  buildings: '#2c2c3e',      // Edificios oscuros
  streets: '#1a1a2e',        // Calles negras
  neonPurple: '#9d4edd',     // Neones púrpura
  neonCyan: '#00d9ff',       // Neones cyan
  neonPink: '#ff006e',       // Neones rosa
  windows: '#ffd60a',        // Ventanas iluminadas (amarillo cálido)
  sky: '#0f0f1e',            // Cielo nocturno
};
```

### Elementos Visuales Clave
- **Neones:** Letreros brillantes en cada fachada
- **Ventanas iluminadas:** En edificios de fondo para dar vida
- **Calles:** Con líneas de tráfico, postes de luz
- **Atmósfera:** Niebla sutil, partículas de lluvia (opcional)

---

## 🚶 Mecánica de Desplazamiento

### Opción 1: Navegación por Menú (Recomendada)
```typescript
// El jugador selecciona el lugar desde un menú/mapa
// Transición directa a la escena del lugar
// No requiere colisiones complejas en la ciudad

function CityMap() {
  const locations = [
    { id: 'cafe', name: 'Café Purple Beans', level: 2, position: [10, 0, 5] },
    { id: 'store', name: 'Almacén StreetWear', level: 2, position: [20, 0, 10] },
    // ...
  ];
  
  return (
    <div className="city-map">
      {locations.map(loc => (
        <LocationMarker
          key={loc.id}
          location={loc}
          onClick={() => goToLocation(loc.id)}
        />
      ))}
    </div>
  );
}
```

### Opción 2: Navegación 3D (Avanzada)
```typescript
// El jugador camina por la ciudad (WASD)
// Al llegar a un lugar: transición a la escena del lugar
// Caminar consume 1 turno si el lugar está lejos
// Requiere colisiones y pathfinding

function CityScene() {
  const { scene } = useGLTF('/models/city/city_purple.glb');
  
  // Detectar proximidad a lugares
  useFrame(() => {
    const playerPos = playerStore.position;
    locations.forEach(loc => {
      const distance = playerPos.distanceTo(loc.position);
      if (distance < 2) {
        // Mostrar indicador [E] para entrar
        uiStore.showInteractionPrompt(loc.name);
      }
    });
  });
  
  return <primitive object={scene} />;
}
```

---

## 🔧 Implementación en Three.js

### Carga de la Ciudad
```typescript
import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

function CityPurple() {
  const { scene } = useGLTF('/models/city/city_purple.glb');
  
  useEffect(() => {
    // Configurar sombras
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Activar neones (materiales emisivos)
    scene.traverse((child) => {
      if (child.name.includes('Neon')) {
        child.material.emissive.set('#9d4edd');
        child.material.emissiveIntensity = 2;
      }
    });
  }, [scene]);
  
  return <primitive object={scene} />;
}
```

### Iluminación Nocturna
```typescript
function CityLighting() {
  return (
    <>
      {/* Luz ambiental oscura */}
      <ambientLight color="#1a1a3e" intensity={0.3} />
      
      {/* Luz direccional suave (luna) */}
      <directionalLight
        color="#4a5568"
        intensity={0.5}
        position={[20, 50, 20]}
        castShadow
      />
      
      {/* Luces puntuales en postes de luz */}
      <pointLight position={[5, 5, 5]} color="#ffd60a" intensity={1} distance={10} />
      <pointLight position={[15, 5, 5]} color="#ffd60a" intensity={1} distance={10} />
      <pointLight position={[25, 5, 5]} color="#ffd60a" intensity={1} distance={10} />
      
      {/* Niebla para atmósfera */}
      <fog attach="fog" args={['#0f0f1e', 10, 100]} />
    </>
  );
}
```

### Marcadores de Lugares
```typescript
// Marcadores 3D flotantes sobre cada lugar
function LocationMarker({ position, name, icon, isUnlocked }) {
  return (
    <group position={position}>
      {/* Ícono flotante */}
      <sprite scale={[2, 2, 1]}>
        <spriteMaterial
          map={useTexture(`/icons/${icon}.png`)}
          opacity={isUnlocked ? 1 : 0.3}
        />
      </sprite>
      
      {/* Texto del nombre */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color={isUnlocked ? '#ffffff' : '#666666'}
      >
        {name}
      </Text>
      
      {/* Indicador de distancia */}
      {!isUnlocked && (
        <Text position={[0, 2.5, 0]} fontSize={0.3} color="#ff6b6b">
          Nivel {requiredLevel}
        </Text>
      )}
    </group>
  );
}
```

### Mini-mapa (HUD)
```typescript
// Mini-mapa 2D en la esquina de la pantalla
function MiniMap() {
  const playerPos = playerStore.position;
  
  return (
    <div className="fixed top-4 right-4 w-48 h-48 bg-black/80 rounded-lg border-2 border-purple-500">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Calles */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#333" strokeWidth="2" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#333" strokeWidth="2" />
        
        {/* Lugares */}
        {locations.map(loc => (
          <circle
            key={loc.id}
            cx={loc.mapX}
            cy={loc.mapY}
            r="4"
            fill={loc.isUnlocked ? '#9d4edd' : '#666'}
          />
        ))}
        
        {/* Jugador */}
        <circle
          cx={playerPos.x * 10}
          cy={playerPos.z * 10}
          r="3"
          fill="#00d9ff"
        />
      </svg>
    </div>
  );
}
```

---

## 📥 Fuentes de Descarga

### Ciudades Completas
- **[Kenney.nl — City Kit](https://kenney.nl/assets/city-kit-commercial)** — Gratuito, modular, perfecto para construir la ciudad por bloques
- **[Quaternius — Town Pack](https://quaternius.com/packs/ultimatetown.html)** — Gratuito, low-poly, incluye edificios y calles
- **[Sketchfab — "city low poly"](https://sketchfab.com/search?q=city+low+poly&type=models&features=downloadable)** — Buscar con licencia CC-BY

### Construcción Modular
Si no encuentras una ciudad completa, puedes construirla en Blender:

1. **Descargar packs modulares:**
   - [Kenney.nl — City Kit](https://kenney.nl/assets/city-kit-commercial)
   - [PolyHaven — Urban Assets](https://polyhaven.com/models)

2. **Construir en Blender:**
   - Colocar edificios en una cuadrícula
   - Agregar calles con planos texturizados
   - Colocar postes de luz, señales, etc.
   - Agregar neones con materiales emisivos

3. **Exportar como GLB**

---

## 🎯 Guía de Diseño

### Layout Sugerido
```
        [Academia SoundWave]
                |
    [Bar Neon Nights] ---- [Apartamento] ---- [Purple Sound Shop]
                |                |
        [Delivery Express]   [Café Purple Beans]
                |                |
        [Restaurante]      [Almacén StreetWear]
```

### Distancias
- **Apartamento ↔ Café/Almacén:** Cerca (no consume turno)
- **Apartamento ↔ Restaurante/Delivery:** Media (consume 1 turno)
- **Apartamento ↔ Bar/Academia:** Lejos (consume 1 turno)

### Atmósfera
- **Hora:** Siempre nocturna (Purple City nunca duerme)
- **Clima:** Puede tener lluvia ligera (opcional)
- **Tráfico:** NPCs caminando en las calles (opcional, para dar vida)
- **Sonido:** Ambiente urbano nocturno (tráfico lejano, música de bares)

---

## ✅ Checklist

- [ ] `city_purple.glb` 🔴 CRÍTICO
- [ ] Fachadas de 8 lugares reconocibles
- [ ] Neones funcionando (materiales emisivos)
- [ ] Calles y aceras definidas
- [ ] Postes de luz colocados
- [ ] Edificios de fondo para profundidad
- [ ] Optimizado (< 10MB)
- [ ] Verificado en [gltf.report](https://gltf.report)

---

*Responsable: Felipe (3D Engineer)*  
*Última actualización: Abril 26, 2026*
