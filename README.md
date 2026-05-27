# 🎮 LEGENDS: The Music Career Simulator

Un simulador de carrera musical ambientado en **Purple City, 2015**. Asume el rol de un rapero emergente que debe grabar música, construir su audiencia y pagar la renta a tiempo — sin contratos, sin productoras, sin red de seguridad.

> "Si algo vale la pena, vale la pena la lucha."

🌐 **Demo en vivo:** [legends.gestionxpress.app](https://legends.gestionxpress.app)

---

## 🎯 ¿De qué se trata?

El jugador tiene **45 días ficticios** divididos en 6 niveles para alcanzar **10,000 oyentes mensuales** y desbloquear el Estudio Profesional. Cada día tiene 4 turnos (mañana, tarde, atardecer, noche) donde debe decidir entre grabar canciones, trabajar para ganar dinero o descansar para recuperar energía.

### Mecánicas principales
- **Minijuego rítmico** — Graba canciones presionando A, S, D, F al ritmo
- **Gestión de recursos** — Dinero, energía, hambre, oyentes y reputación
- **Trabajos** — 5 online + 6 físicos con preguntas generadas por IA
- **Tienda** — 30+ items (equipamiento musical, comida, mejoras, ropa)
- **Renta diaria** — $1,000 obligatorios cada atardecer (3 días sin pagar = Game Over)
- **Narrativa** — 9 personajes con arcos, 50+ diálogos, eventos dinámicos

### Progresión por niveles

| Nivel | Nombre | Meta |
|-------|--------|------|
| 1 | El Primer Beat | 0 → 500 oyentes |
| 2 | Subsistir o Crear | 500 → 1,000 oyentes |
| 3 | La Prueba del Fuego | 1,000 → 3,000 oyentes |
| 4 | Momentum | 3,000 → 5,000 oyentes |
| 5 | La Recta Final | 5,000 → 7,000 oyentes |
| 6 | Leyenda | 7,000 → 10,000 oyentes |

---

## 🛠️ Tecnologías

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| UI | React | 19.x | Framework de interfaz |
| Tipado | TypeScript | 6.x | Tipado estático |
| 3D | Three.js | 0.184.x | Motor de renderizado 3D |
| 3D React | @react-three/fiber | 9.x | React renderer para Three.js |
| 3D Helpers | @react-three/drei | 10.x | Utilidades 3D (modelos GLB, animaciones) |
| Estilos | Tailwind CSS | 4.x | Sistema de diseño |
| Estado | Zustand | 5.x | Estado global por dominio |
| Animaciones | Framer Motion | 12.x | Animaciones de interfaz |
| Audio | Howler.js | 2.x | Música y efectos de sonido |
| Bundler | Vite | 8.x | Build y dev server |
| Backend | InsForge | - | Base de datos, autenticación, IA |
| Despliegue | Docker + Nginx | - | Containerización y servidor estático |
| Proxy | Traefik | - | Routing y SSL automático |

---

## 🚀 Instalación y ejecución

### Requisitos previos
- Node.js 20+
- npm 10+

### Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/fernandorosero91/legends-game.git
cd legends-game

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de InsForge

# Iniciar servidor de desarrollo
npm run dev
```

El juego estará disponible en `http://localhost:5173`

### Variables de entorno

```env
VITE_INSFORGE_BASE_URL=https://tu-proyecto.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=tu-anon-key
VITE_INSFORGE_PROJECT_ID=tu-project-id
VITE_INSFORGE_PROJECT_NAME=legends_game
VITE_INSFORGE_REGION=us-east
VITE_APP_NAME=LEGENDS
VITE_APP_VERSION=1.0.0
```

### Build de producción

```bash
npm run build    # Genera /dist con archivos estáticos
npm run preview  # Preview local del build
```

---

## 🐳 Despliegue con Docker

El proyecto incluye configuración lista para desplegar con Docker Compose (probado en Dokploy con Traefik):

```bash
# Build y ejecución manual
docker compose up --build
```

### Archivos de despliegue
- `Dockerfile` — Multi-stage build (Node 22 → Nginx Alpine)
- `docker-compose.yml` — Servicio con build args para variables de entorno
- `nginx.conf` — Servidor estático con gzip, cache y SPA fallback

### En Dokploy
1. Crear servicio tipo **Compose**
2. Conectar repositorio GitHub (branch `develop`)
3. Agregar variables de entorno (`VITE_INSFORGE_BASE_URL`, `VITE_INSFORGE_ANON_KEY`, etc.)
4. Configurar dominio (Container Port: 80)
5. Desplegar

---

## 📂 Estructura del proyecto

```
legends-game/
├── public/
│   ├── audio/          # Música (beats, SFX)
│   ├── data/           # JSON de configuración de niveles
│   ├── models/         # Modelos 3D GLB (personajes, escenarios)
│   └── images_dishes/  # Imágenes del restaurante
├── src/
│   ├── app/            # Componente raíz (App.tsx)
│   ├── components/
│   │   ├── atoms/      # Button, Badge, ProgressBar, Icon, Text
│   │   ├── molecules/  # ResourceBar, ItemCard, DialogueBubble
│   │   ├── organisms/  # TopBar, InventoryPanel, ShopGrid
│   │   ├── game/       # Player, Room, NPCs, objetos 3D
│   │   ├── rhythm/     # Minijuego rítmico (4 carriles)
│   │   ├── jobs/       # Trabajos online con IA
│   │   └── ui/         # Pantallas (MainMenu, HUD, Shop, etc.)
│   ├── data/           # Datos estáticos (personajes, diálogos, niveles)
│   ├── hooks/          # Custom hooks (useGameLoop, useAudio, etc.)
│   ├── scenes/         # Escenas 3D (Apartamento, Ciudad, Restaurante)
│   ├── services/       # InsForge SDK (auth, saves, leaderboard)
│   ├── store/          # Zustand stores (game, player, ui, audio, shop, job)
│   ├── systems/        # Lógica pura (economía, energía, renta, ritmo)
│   ├── types/          # TypeScript types
│   └── utils/          # Utilidades (constantes, formateo, math)
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vite.config.ts
└── package.json
```

---

## 📋 Comandos disponibles

```bash
npm run dev              # Servidor de desarrollo (localhost:5173)
npm run build            # Build de producción
npm run preview          # Preview del build
npm test                 # Tests unitarios
npm run test:ui          # Tests con interfaz visual
npm run lint             # Linting con ESLint
npm run setup:insforge   # Inicializar esquema de BD
npm run verify:insforge  # Verificar conexión InsForge
```

---

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| W / ↑ | Caminar arriba |
| S / ↓ | Caminar abajo |
| A / ← | Caminar izquierda |
| D / → | Caminar derecha |
| E | Interactuar con objetos/NPCs |
| A, S, D, F | Notas en minijuego rítmico |
| Espacio | Avanzar diálogo |
| Esc | Menú de pausa |

---

## 📝 Licencia

Proyecto académico de desarrollo de videojuegos web.

## Autores 

Feranndo Rosero
Nicol Muñoz
Yeraldin Araujo
Felipe Narvaez
