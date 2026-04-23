# Legends Game

Un juego de simulación de vida con mecánicas de ritmo, desarrollado con React, Three.js y TypeScript.

## Estructura del Proyecto

```
LEGENDS-GAME/
├── node_modules/
├── public/
│   ├── models/          # Modelos 3D (.glb)
│   ├── audio/           # Archivos de audio (.mp3, .wav)
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── app/
│   │   └── App.tsx      # Componente principal de la aplicación
│   │
│   ├── assets/
│   │   ├── images/      # Imágenes y logos
│   │   ├── fonts/       # Fuentes personalizadas
│   │   └── textures/    # Texturas para 3D
│   │
│   ├── components/
│   │   ├── game/        # Componentes del juego 3D
│   │   ├── ui/          # Componentes de interfaz de usuario
│   │   └── rhythm/      # Componentes del juego de ritmo
│   │
│   ├── scenes/          # Escenas del juego
│   │   ├── MainScene.tsx
│   │   ├── ApartmentScene.tsx
│   │   ├── StudioScene.tsx
│   │   ├── CityScene.tsx
│   │   └── MenuScene.tsx
│   │
│   ├── store/           # Estado global con Zustand
│   │   ├── gameStore.ts
│   │   ├── uiStore.ts
│   │   ├── audioStore.ts
│   │   └── saveStore.ts
│   │
│   ├── systems/         # Sistemas de juego
│   │   ├── movementSystem.ts
│   │   ├── economySystem.ts
│   │   ├── rentSystem.ts
│   │   ├── hungerSystem.ts
│   │   ├── energySystem.ts
│   │   ├── rhythmSystem.ts
│   │   ├── levelSystem.ts
│   │   ├── reputationSystem.ts
│   │   ├── listenerSystem.ts
│   │   └── dialogueSystem.ts
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useKeyboard.ts
│   │   ├── usePlayerMovement.ts
│   │   ├── useDayCycle.ts
│   │   ├── useAudio.ts
│   │   ├── useCameraFollow.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── data/            # Datos del juego
│   │   ├── characters.ts
│   │   ├── levels.ts
│   │   ├── dialogues.ts
│   │   ├── songs.ts
│   │   └── events.ts
│   │
│   ├── styles/          # Estilos CSS
│   │   ├── globals.css
│   │   ├── animations.css
│   │   └── variables.css
│   │
│   ├── utils/           # Utilidades
│   │   ├── math.ts
│   │   ├── format.ts
│   │   ├── random.ts
│   │   └── constants.ts
│   │
│   ├── types/           # Definiciones de tipos TypeScript
│   │   ├── game.ts
│   │   ├── player.ts
│   │   └── ui.ts
│   │
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Tecnologías

- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Three.js** - Renderizado 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers para React Three Fiber
- **Zustand** - Gestión de estado
- **Howler.js** - Gestión de audio
- **Framer Motion** - Animaciones
- **Tailwind CSS** - Estilos
- **Vite** - Build tool

## Scripts

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview
npm run preview
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`
