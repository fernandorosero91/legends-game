# 🎮 LEGENDS: The Music Career Simulator

Un simulador de carrera musical donde juegas como un rapero emergente en Purple City. Graba música, construye tu audiencia, paga la renta y alcanza los 10,000 oyentes mensuales en 45 días ficticios.

> "Si algo vale la pena, vale la pena la lucha."

## 📊 Progreso del Proyecto

**Estado General: 85% Completo**

### Por Desarrollador

| Desarrollador | Área | Progreso | Archivos |
|---|---|---|---|
| **Nicol** | UI/UX + Testing | 85% | 42 archivos |
| **Yeraldin** | Narrativa + Contenido | 100% ✅ | 7 archivos |
| **Felipe** | Sistemas + Lógica | 85% ✅ | 29 archivos |

### Detalles por Área

**Nicol (UI/UX):**
- ✅ 5 Átomos (Button, Badge, ProgressBar, Icon, Text)
- ✅ 5 Moléculas (ResourceBar, ItemCard, NotificationToast, DialogueBubble, StatRow)
- ✅ 3 Organismos (ShopGrid, JobSelector, InventoryPanel)
- ✅ 15 Pantallas UI completas
- ✅ 6 Tests unitarios
- ✅ Optimizaciones (Lazy Loading, Memoización, Code Splitting)
- ✅ Guía de accesibilidad WCAG AA

**Yeraldin (Narrativa):**
- ✅ 9 Personajes con arcos narrativos completos
- ✅ 6 Beats musicales con metadatos
- ✅ 50+ Diálogos organizados por actos
- ✅ 60+ Eventos narrativos
- ✅ 6 Niveles diseñados completamente
- ✅ 30+ Items de tienda
- ✅ 11 Trabajos (5 online + 6 físicos)

**Felipe (Sistemas):**
- ✅ 7 Stores de Zustand completos (gameStore, playerStore, uiStore, audioStore, shopStore, jobStore, saveStore)
- ✅ 13 Sistemas de juego funcionales (economy, energy, hunger, rhythm, rent, level, listener, dayCycle, job, shop, reputation, dialogue, movement)
- ✅ 8 Hooks personalizados completos (useGameLoop, useResources, useRhythmGame, useShop, useJobs, useLevelProgress, useAudio, usePlayerMovement)
- ✅ Integración completa con UI de Nicol (App.tsx funcional sin errores)
- ⏳ 4 Servicios InsForge pendientes

## 🎯 Características Principales

### Gameplay
- **45 días ficticios** divididos en 6 niveles progresivos
- **Minijuego rítmico** para grabar canciones (teclas A, S, D, F)
- **Sistema de recursos**: Dinero, Energía, Hambre, Oyentes, Reputación
- **Trabajos**: 5 online + 6 físicos para ganar dinero
- **Tienda**: 30+ items (equipamiento, comida, mejoras, ropa)
- **Renta diaria**: $1,000 obligatorios cada atardecer

### Narrativa
- **9 personajes** con arcos narrativos completos
- **50+ diálogos** organizados en 3 actos
- **60+ eventos** narrativos con triggers dinámicos
- **6 beats musicales** con diferentes estilos (trap, lo-fi, hip-hop, drill, boom bap)

### Progresión
- **Nivel 1**: El Primer Beat (0 → 500 oyentes)
- **Nivel 2**: Subsistir o Crear (500 → 1,000 oyentes)
- **Nivel 3**: La Prueba del Fuego (1,000 → 3,000 oyentes)
- **Nivel 4**: Momentum (3,000 → 5,000 oyentes)
- **Nivel 5**: La Recta Final (5,000 → 7,000 oyentes)
- **Nivel 6**: Leyenda (7,000 → 10,000 oyentes)

## 📁 Estructura del Proyecto

Ver [agents.md](./agents.md) para la especificación técnica completa.

```
legends-game/
├── src/
│   ├── components/
│   │   ├── atoms/          ✅ 5 componentes (Nicol)
│   │   ├── molecules/      ✅ 5 componentes (Nicol)
│   │   ├── organisms/      ✅ 3 componentes (Nicol)
│   │   ├── game/           ✅ 7 componentes (Nicol)
│   │   ├── rhythm/         ✅ 5 componentes (Nicol)
│   │   └── ui/             ✅ 17 componentes (Nicol)
│   │
│   ├── data/               ✅ 7 archivos (Yeraldin)
│   │   ├── characters.ts   ✅ 9 personajes
│   │   ├── songs.ts        ✅ 6 beats
│   │   ├── dialogues.ts    ✅ 50+ diálogos
│   │   ├── events.ts       ✅ 60+ eventos
│   │   ├── levels.ts       ✅ 6 niveles
│   │   ├── shopItems.ts    ✅ 30+ items
│   │   └── jobs.ts         ✅ 11 trabajos
│   │
│   ├── systems/            ✅ 13/13 archivos (Felipe)
│   ├── store/              ✅ 7/7 archivos (Felipe)
│   ├── hooks/              ✅ 8/8 archivos (Felipe)
│   ├── app/                ✅ 2/2 archivos (Felipe + Nicol)
│   └── services/           ⏳ 0/4 archivos (Felipe)
│
├── public/
│   ├── audio/              📦 4 archivos de audio
│   └── models/             📦 2 modelos 3D (.glb)
│
└── docs/
    ├── nicol-progress.md       ✅ 85% completo
    ├── yeraldin-progress.md    ✅ 100% completo
    ├── felipe-progress.md      ✅ 70% completo
    └── accessibility-guide.md  ✅ Guía completa
```

## 🛠️ Tecnologías

### Frontend
- **React 19** - Framework de UI
- **TypeScript 6** - Tipado estático
- **Three.js 0.184** - Motor 3D
- **@react-three/fiber 9** - React renderer para Three.js
- **@react-three/drei 10** - Helpers 3D
- **Tailwind CSS 4** - Sistema de diseño
- **Zustand 5** - Estado global
- **Framer Motion 12** - Animaciones UI
- **Howler.js 2** - Audio y música
- **Vite 8** - Bundler y dev server

### Backend / Persistencia
- **InsForge** - Base de datos en la nube
- **InsForge OSS** - Almacenamiento de assets

### Testing
- **Vitest** - Test runner
- **@testing-library/react** - Testing de componentes
- **@testing-library/jest-dom** - Matchers personalizados

## 📚 Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Tests
npm test

# Tests con UI
npm run test:ui

# Lint
npm run lint
```

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📖 Documentación

- **[agents.md](./agents.md)** - Especificación técnica completa del juego
- **[PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md)** - Resumen de progreso del proyecto
- **[.kiro/devs/nicol-progress.md](./.kiro/devs/nicol-progress.md)** - Progreso de UI/UX (85%)
- **[.kiro/devs/yeraldin-progress.md](./.kiro/devs/yeraldin-progress.md)** - Progreso de Narrativa (100%)
- **[.kiro/devs/felipe-progress.md](./.kiro/devs/felipe-progress.md)** - Progreso de Sistemas (85%)
- **[.kiro/devs/accessibility-guide.md](./.kiro/devs/accessibility-guide.md)** - Guía de accesibilidad WCAG AA

## 🎮 Personajes Principales

1. **El Jugador** - Rapero emergente (protagonista)
2. **El de la Renta** - Cobrador diario (antagonista principal)
3. **DJ Sonic** - Mentor y guía
4. **Luna** - Primer fan y representación de la comunidad
5. **El Crítico** - Crítico musical (antagonista secundario)
6. **Mamá** - Apoyo emocional
7. **Vendedor** - NPC de Purple Sound Shop
8. **Marco** - Jefe del Café Purple Beans
9. **Daniela** - Jefa del Almacén StreetWear

## 🎵 Beats Disponibles

1. **Purple Rain Trap** (Nivel 1, Trap, 140 BPM)
2. **Street Glow** (Nivel 1, Lo-fi, 90 BPM)
3. **Midnight Hustle** (Nivel 2, Hip-hop, 120 BPM)
4. **City Lights Drill** (Nivel 2, Drill, 145 BPM)
5. **Gold Chain Summer** (Nivel 3, Boom Bap, 95 BPM)
6. **Premium Frequencies** (Nivel 5, Trap, 130 BPM)

## 💼 Trabajos Disponibles

### Online (desde el apartamento)
- Redacción de correos ($200)
- Fichas técnicas ($350)
- Diseño de logos ($500)
- Edición de video ($700)
- Desarrollo web ($1,000)

### Físicos (en Purple City)
- Barista - Café Purple Beans ($300)
- Cajero - Almacén StreetWear ($350)
- Mesero - Restaurante La Esquina ($400)
- Repartidor - Delivery Express ($500)
- DJ en bar - Bar Neon Nights ($600)
- Instructor de música - Academia SoundWave ($800)

## 🏪 Tienda: Purple Sound Shop

### Categorías
- **Equipamiento Musical** (8 items): Micrófonos, audífonos, monitores, software
- **Comida y Energía** (6 items): Ramen, sandwiches, café, bebidas energéticas
- **Mejoras del Apartamento** (6 items): Posters, iluminación, sofá, cama, insonorización
- **Ropa y Estilo** (5 items): Camisetas, zapatillas, cadenas, outfits, gafas

## 🎯 Próximos Pasos

### Felipe (Sistemas de Juego) - EN PROGRESO ✅
1. ✅ Implementar stores de Zustand (7/7 completos)
2. ✅ Implementar sistemas core (10/13 completos)
3. ⏳ Implementar sistemas restantes (dialogueSystem, movementSystem)
4. ⏳ Desarrollar hooks personalizados en `src/hooks/`
5. ⏳ Integrar servicios de InsForge en `src/services/`
6. ⏳ Conectar datos narrativos con lógica de juego

### Nicol (Finalización UI)
1. Completar componentes de juego 3D restantes
2. Pulir animaciones y transiciones
3. Optimizar rendimiento
4. Testing adicional

## 📝 Licencia

Este proyecto es parte de un ejercicio de desarrollo de videojuegos.

---

**Desarrollado por:** Nicol (UI/UX), Yeraldin (Narrativa), Felipe (Sistemas)  
**Fecha:** Abril 2026  
**Estado:** 72% Completo
