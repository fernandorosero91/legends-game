# Props Interactuables - Objetos del Apartamento

## 📋 Inventario (4 Props)

Estos props viven dentro del apartamento y son puntos de interacción clave para el jugador.

### 🔴 CRÍTICOS

#### `prop_bed.glb`
- **Descripción:** Cama individual estilo urbano
- **Interacción:** Dormir (+50 energía, avanza día)
- **Tecla:** E (al acercarse)
- **Swap:** Reemplazar por `prop_bed_upgrade.glb` al comprar "Cama nueva" en tienda
- **Nivel de desbloqueo:** Desde el inicio
- **Fuentes:**
  - [Kenney.nl — Furniture Kit](https://kenney.nl/assets/furniture-kit)
  - [PolyHaven — bed](https://polyhaven.com/models)
  - [Sketchfab — "bed low poly"](https://sketchfab.com/search?q=bed+low+poly&type=models&features=downloadable)

---

#### `prop_computer.glb`
- **Descripción:** Computador de escritorio o laptop sobre mesa
- **Interacción:** Acceso a trabajos online desde Nivel 2
- **Tecla:** E (abre JobScreen de trabajos online)
- **Nivel de desbloqueo:** Desde el inicio (funcional desde Nivel 2)
- **Fuentes:**
  - [Kenney.nl — Furniture Kit](https://kenney.nl/assets/furniture-kit)
  - [Sketchfab — "laptop low poly"](https://sketchfab.com/search?q=laptop+low+poly&type=models&features=downloadable)
  - [PolyHaven](https://polyhaven.com/models)

---

#### `prop_mic_stand.glb`
- **Descripción:** Micrófono con pedestal o setup de grabación
- **Interacción:** Grabar canciones (dispara el minijuego rítmico)
- **Tecla:** E (inicia RhythmGame)
- **Variantes:** `prop_mic_basic.glb` (Niveles 1-3), se mejora visualmente con compras de equipamiento
- **Nivel de desbloqueo:** Desde el inicio
- **Fuentes:**
  - [Sketchfab — "microphone stand"](https://sketchfab.com/search?q=microphone+stand&type=models&features=downloadable)
  - [CGTrader — microphone free](https://www.cgtrader.com/free-3d-models/electronics/audio)
  - [PolyHaven](https://polyhaven.com/models)

---

### 🟢 MEDIA PRIORIDAD (Opcional)

#### `prop_sofa.glb`
- **Descripción:** Sofá básico
- **Interacción:** Descansar (+20 energía)
- **Tecla:** E
- **Swap:** Reemplazar por `prop_sofa_upgrade.glb` al comprar "Sofá cómodo"
- **Nivel de desbloqueo:** Desde el inicio
- **Nota:** Puede vivir dentro de `house.glb` en lugar de ser un archivo separado
- **Fuentes:**
  - [Kenney.nl — Furniture Kit](https://kenney.nl/assets/furniture-kit)
  - [PolyHaven — couch](https://polyhaven.com/models)
  - [Sketchfab — "sofa low poly"](https://sketchfab.com/search?q=sofa+low+poly&type=models&features=downloadable)

---

## 🎨 Especificaciones Técnicas

### Requisitos Generales
- **Formato:** GLB individual por objeto
- **Tamaño:** < 500KB por prop
- **Pivot:** En la base del objeto para facilitar posicionamiento
- **Materiales:** PBR (Metallic-Roughness workflow)
- **Colisiones:** BoxCollider simple (puede ser un cubo invisible)

### Interacción
Todos los props interactuables deben tener:
- **Zona de interacción:** Radio de 1.5 unidades desde el centro del objeto
- **Indicador visual:** Ícono [E] flotante cuando el jugador está cerca
- **Feedback:** Animación o efecto visual al interactuar

---

## 🔧 Implementación en Three.js

### Componente Base: InteractableObject
```typescript
import { useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { Vector3 } from 'three';

interface InteractableObjectProps {
  id: string;
  modelPath: string;
  position: Vector3;
  interactionLabel: string; // "Dormir", "Trabajar", "Grabar", "Descansar"
  onInteract: () => void;
  isAvailable: boolean; // Deshabilitar si energía < 10, etc.
  levelRequired?: number;
}

function InteractableObject({
  id,
  modelPath,
  position,
  interactionLabel,
  onInteract,
  isAvailable,
  levelRequired = 1,
}: InteractableObjectProps) {
  const { scene } = useGLTF(modelPath);
  const [isNear, setIsNear] = useState(false);
  const playerPos = playerStore.position;
  
  useFrame(() => {
    // Detectar proximidad del jugador
    const distance = playerPos.distanceTo(position);
    setIsNear(distance < 1.5);
  });
  
  useEffect(() => {
    if (isNear && isAvailable) {
      // Mostrar indicador [E] en HUD (avisar a Nicol)
      uiStore.showInteractionPrompt(interactionLabel);
    } else {
      uiStore.hideInteractionPrompt();
    }
  }, [isNear, isAvailable, interactionLabel]);
  
  // Detectar tecla E
  useKeyboard('e', () => {
    if (isNear && isAvailable) {
      onInteract();
    }
  });
  
  return (
    <group position={position}>
      <primitive object={scene} />
      
      {/* Outline cuando está cerca */}
      {isNear && isAvailable && (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial color="#9d4edd" wireframe opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}
```

### Uso en ApartmentScene
```typescript
function ApartmentScene() {
  const handleSleep = () => {
    playerStore.changeEnergy(50);
    gameStore.advanceDay();
    audioStore.playSFX('sleep');
  };
  
  const handleWork = () => {
    if (gameStore.currentLevel >= 2) {
      uiStore.setScreen('job');
    } else {
      uiStore.addNotification('Desbloquea trabajos en Nivel 2');
    }
  };
  
  const handleRecord = () => {
    gameStore.setGamePhase('minigame');
    audioStore.playMusic('beat_purple_rain_trap');
  };
  
  const handleRest = () => {
    playerStore.changeEnergy(20);
    audioStore.playSFX('rest');
  };
  
  return (
    <>
      {/* Cama */}
      <InteractableObject
        id="bed"
        modelPath="/models/props/interactables/prop_bed.glb"
        position={new Vector3(-3, 0, 2)}
        interactionLabel="Dormir"
        onInteract={handleSleep}
        isAvailable={playerStore.energy < 100}
      />
      
      {/* Computador */}
      <InteractableObject
        id="computer"
        modelPath="/models/props/interactables/prop_computer.glb"
        position={new Vector3(2, 0.8, -1)}
        interactionLabel="Trabajar Online"
        onInteract={handleWork}
        isAvailable={gameStore.currentLevel >= 2 && playerStore.energy >= 20}
        levelRequired={2}
      />
      
      {/* Micrófono */}
      <InteractableObject
        id="mic"
        modelPath="/models/props/interactables/prop_mic_stand.glb"
        position={new Vector3(0, 0, -3)}
        interactionLabel="Grabar Canción"
        onInteract={handleRecord}
        isAvailable={playerStore.energy >= 30}
      />
      
      {/* Sofá */}
      <InteractableObject
        id="sofa"
        modelPath="/models/props/interactables/prop_sofa.glb"
        position={new Vector3(-2, 0, 0)}
        interactionLabel="Descansar"
        onInteract={handleRest}
        isAvailable={playerStore.energy < 100}
      />
    </>
  );
}
```

### Swap de Props (Upgrades)
```typescript
// Cuando el jugador compra una mejora, reemplazar el modelo
function Bed() {
  const hasBedUpgrade = playerStore.inventory.includes('bed_upgrade');
  const modelPath = hasBedUpgrade
    ? '/models/props/upgrades/prop_bed_upgrade.glb'
    : '/models/props/interactables/prop_bed.glb';
  
  const energyBonus = hasBedUpgrade ? 60 : 50; // +10 con upgrade
  
  return (
    <InteractableObject
      id="bed"
      modelPath={modelPath}
      position={new Vector3(-3, 0, 2)}
      interactionLabel="Dormir"
      onInteract={() => {
        playerStore.changeEnergy(energyBonus);
        gameStore.advanceDay();
      }}
      isAvailable={playerStore.energy < 100}
    />
  );
}
```

---

## 🎯 Indicador de Interacción (HUD)

### Componente de Indicador [E]
```typescript
// Este componente debe ser implementado por Nicol en el HUD
function InteractionPrompt() {
  const prompt = uiStore.interactionPrompt;
  
  if (!prompt) return null;
  
  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-lg px-6 py-3 rounded-full border-2 border-purple-500 flex items-center gap-3">
        <kbd className="px-3 py-1 bg-purple-600 rounded text-white font-bold">E</kbd>
        <span className="text-white font-medium">{prompt}</span>
      </div>
    </div>
  );
}
```

---

## 📥 Proceso de Descarga

1. **Buscar en las fuentes recomendadas**
2. **Descargar en formato GLB** (preferido) o FBX
3. **Abrir en Blender** si es FBX
4. **Verificar escala** (debe ser proporcional al jugador)
5. **Ajustar pivot** (debe estar en la base del objeto)
6. **Exportar como GLB**
   - ✅ Geometry > Apply Modifiers
   - ✅ Compression > Draco (opcional)
7. **Optimizar con gltfpack**:
   ```bash
   gltfpack -i prop_bed.glb -o prop_bed_optimized.glb
   ```
8. **Verificar en [gltf.report](https://gltf.report)**
9. **Colocar en `public/models/props/interactables/`**

---

## ✅ Checklist

- [ ] `prop_bed.glb` 🔴 CRÍTICO
- [ ] `prop_computer.glb` 🔴 CRÍTICO
- [ ] `prop_mic_stand.glb` 🔴 CRÍTICO
- [ ] `prop_sofa.glb` 🟢 MEDIA (opcional)

---

*Responsable: Felipe (3D Engineer)*  
*Última actualización: Abril 26, 2026*
