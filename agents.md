# LEGENDS: The Music Career Simulator — Especificacion Tecnica Completa

---

## 1. Vision General del Proyecto

**Nombre:** LEGENDS: The Music Career Simulator
**Genero:** Simulacion de gestion de recursos + Narrativa RPG + Minijuego ritmico
**Ambientacion:** Purple City, 2015
**Plataforma:** Web (React + Three.js + Tailwind CSS)
**Backend/Persistencia:** InsForge (API REST, base de datos en la nube)
**Duracion de partida:** 45 dias ficticios divididos en 6 niveles
**Objetivo final:** Alcanzar 10.000 oyentes mensuales y desbloquear el Estudio Profesional

### Premisa
El jugador es un rapero emergente (22-28 anos) en Purple City que debe grabar musica, crecer su audiencia y pagar la renta a tiempo. Sin contratos, sin productoras, sin red de seguridad.

### Mensaje Central
> "Si algo vale la pena, vale la pena la lucha."

---

## 2. Stack Tecnologico y Arquitectura

### 2.1 Frontend
| Tecnologia | Version | Proposito |
|---|---|---|
| React | 19.x | UI Framework principal |
| TypeScript | 6.x | Tipado estatico |
| Three.js | 0.184.x | Motor 3D para escenas del apartamento |
| @react-three/fiber | 9.x | React renderer para Three.js |
| @react-three/drei | 10.x | Helpers 3D (modelos GLB, animaciones) |
| Tailwind CSS | 4.x | Sistema de diseno y estilos |
| Zustand | 5.x | Estado global (stores) |
| Framer Motion | 12.x | Animaciones UI |
| Howler.js | 2.x | Audio y musica |
| Vite | 8.x | Bundler y dev server |

### 2.2 Backend / Persistencia
| Servicio | Proposito |
|---|---|
| InsForge | Base de datos en la nube, autenticacion, API REST |
| InsForge OSS | Almacenamiento de assets (audio, imagenes) |

### 2.3 Diagrama de Arquitectura
```
CLIENTE (Browser)
  React UI + Three.js 3D Scene + Tailwind CSS Design System
    -> Zustand Stores (gameStore, playerStore, uiStore, audioStore)
      -> Game Systems (economy, energy, hunger, rhythm, reputation, rent, level, listener, dialogue, movement, jobs, shop)
        -> InsForge Client SDK (Auth, Database, Storage)
          -> InsForge Cloud (Auth Service, NoSQL Database, Object Storage)
```

---

## 3. Patrones de Software

### 3.1 Patrones Arquitectonicos
- **Component-Based Architecture (React):** Cada elemento de UI es un componente reutilizable
- **Store Pattern (Zustand):** Estado global centralizado por dominio
- **System Pattern (ECS-like):** Logica de juego separada en sistemas independientes
- **Observer Pattern:** Los stores notifican cambios a los componentes suscritos
- **Strategy Pattern:** Diferentes estrategias de calculo segun nivel/dificultad
- **State Machine:** Gestion de estados del juego (menu, jugando, pausa, dialogo, minijuego, trabajando, comprando)
- **Command Pattern:** Acciones del jugador encapsuladas (grabar, trabajar, dormir, comer, comprar)

### 3.2 Patrones de Diseno UI
- **Atomic Design:** Atomos -> Moleculas -> Organismos -> Templates -> Paginas
- **Responsive Design:** Mobile-first con Tailwind breakpoints
- **Dark Theme Primary:** Paleta oscura con acentos purpura (Purple City)
- **Micro-interactions:** Feedback visual inmediato con Framer Motion
- **Progressive Disclosure:** Informacion revelada gradualmente segun nivel

### 3.3 Principios SOLID
- **S:** Cada system tiene una unica responsabilidad
- **O:** Los niveles son extensibles sin modificar el core
- **L:** Los personajes implementan una interfaz comun de NPC
- **I:** Interfaces segregadas por dominio
- **D:** Los systems dependen de abstracciones (stores), no de implementaciones concretas

---

## 4. Estructura de Datos

### 4.1 InsForge Collections

**Collection: users**
- id, username, email, avatarUrl, createdAt, totalGamesPlayed, bestScore

**Collection: game_saves**
- id, userId, slotName, createdAt, updatedAt
- gameState: { currentDay (1-45), currentLevel (1-6), timeOfDay }
- playerState: { money, energy, hunger, monthlyListeners, reputation, totalSongsRecorded, totalMoneyEarned, totalMoneySpent }
- songs: Song[]
- inventory: InventoryItem[]
- unlockedFeatures: string[]
- dialogueFlags: Record<string, boolean>
- jobHistory: JobRecord[]
- statistics: { daysPlayed, rentPaidTotal, onlineJobsCompleted, physicalJobsCompleted, perfectSongs, collaborationsCompleted, itemsPurchased }

**Collection: songs**
- id, gameId, title, quality (low/medium/high/masterpiece), rhythmScore (0-100), listenersGenerated, revenueGenerated, dayRecorded, level, isCollaboration

**Collection: leaderboard**
- id, userId, username, finalListeners, finalDay, totalSongs, won, completedAt

### 4.2 Zustand Stores

**gameStore:** currentDay, currentLevel, timeOfDay, gamePhase, isPaused + acciones
**playerStore:** money, energy, hunger, monthlyListeners, reputation, songs, inventory, playerRef, wallBoxes + acciones
**uiStore:** currentScreen, menuOpen, dialogueActive, notificationQueue, currentDialogue + acciones
**audioStore:** masterVolume, musicVolume, sfxVolume, muted, currentTrack + acciones
**shopStore:** availableItems, cart, purchaseItem, getItemsByCategory + acciones
**jobStore:** availableJobs, currentJob, jobProgress, startJob, completeJob + acciones

---

## 5. Personajes — Especificacion Tecnica

### 5.1 El Jugador (Protagonista)
- **Rol:** Protagonista controlable
- **Edad:** 22-28 anos
- **Modelo 3D:** player1.glb (con armature y 24 animaciones)
- **Animaciones disponibles:** Idle, Idle_Neutral, Walk, Run, Run_Back, Run_Left, Run_Right, Interact, Wave, Kick_Left, Kick_Right, Punch_Left, Punch_Right, Roll, Sword_Slash, Death, Gun_Shoot, HitRecieve, HitRecieve_2, Idle_Gun, Idle_Gun_Pointing, Idle_Gun_Shoot, Idle_Sword, Run_Shoot
- **Animaciones usadas en juego:** Idle_Neutral (reposo), Walk (caminar), Run (correr), Interact (interactuar con objetos/NPCs), Wave (saludar)
- **Arco narrativo:** Esperanza -> Duda -> Perseverancia -> Triunfo
- **Recursos iniciales:** $5,000 dinero, 100% energia, 100% hambre

### 5.2 El de la Renta (Antagonista Principal)
- **Rol:** Cobrador de renta diario
- **Edad:** 40-50 anos
- **Aparicion:** Cada atardecer (automatico)
- **Mecanica:** Cobra $1,000 diarios sin excepcion
- **Arco narrativo:** Amenazante -> Comico -> Respeto mutuo
- **Dialogos clave por nivel:**
  - Nivel 1-2: Amenazante y exigente
  - Nivel 3: Presion maxima (punto de quiebre)
  - Nivel 4: "Veo que las cosas te van bien. Sigue asi."
  - Nivel 5-6: Curiosidad genuina sobre la musica

### 5.3 DJ Sonic (Mentor)
- **Rol:** Mentor y guia
- **Edad:** 32 anos
- **Aparicion:** Mensajes de texto + encuentros en estudio
- **Mecanica:** Introduce mecanicas, celebra hitos, motiva en crisis
- **Arco narrativo:** Introductor -> Motivador -> Amigo/Colega
- **Dialogos clave:**
  - Dia 1: Introduce el juego y el minijuego ritmico
  - Nivel 3: Mensaje de aliento en el punto de quiebre
  - Nivel 6: Bienvenida al Estudio Profesional

### 5.4 Luna (Fan / Comunidad)
- **Rol:** Representacion de la audiencia
- **Aparicion:** Comentarios en SoundCloud (notificaciones)
- **Mecanica:** Aparece al alcanzar hitos de oyentes
- **Arco narrativo:** Ausente -> Oyente -> Comunidad creciente
- **Trigger:** Primer comentario al alcanzar 500 oyentes (Nivel 1)

### 5.5 El Critico (Antagonista Secundario)
- **Rol:** Critico musical
- **Aparicion:** Cuando la calidad de canciones es baja consistentemente
- **Mecanica:** Penaliza reputacion si la calidad es baja, reconoce mejora
- **Arco narrativo:** Critico destructivo -> Desafiador -> Reconocedor
- **Trigger:** Calidad promedio < 40% en ultimas 3 canciones

### 5.6 Mama del Jugador (Apoyo Emocional)
- **Rol:** Ancla emocional
- **Aparicion:** Mensajes de texto esporadicos
- **Mecanica:** No afecta gameplay, solo narrativa emocional
- **Arco narrativo:** Preocupada -> Orgullosa -> Celebradora
- **Trigger:** Mensaje de orgullo al alcanzar Nivel 4

---

## 6. Arquitectura de Niveles

### Nivel 1: El Primer Beat
- **Dias:** 1-5
- **Meta:** 0 -> 500 oyentes
- **Desafio:** Aprender mecanicas, pagar primera renta
- **Desbloqueo al completar:** Trabajos online
- **Hito narrativo:** Luna (primer fan)
- **Dificultad minijuego:** Facil (notas lentas, pocas teclas)

### Nivel 2: Subsistir o Crear
- **Dias:** 6-12
- **Meta:** 500 -> 1,000 oyentes
- **Desafio:** Equilibrar trabajos con grabaciones
- **Desbloqueo al completar:** Modo Colaboracion + Trabajos fisicos (cafeteria, almacen)
- **Hito narrativo:** Aparicion de El Critico
- **Dificultad minijuego:** Media

### Nivel 3: La Prueba del Fuego
- **Dias:** 13-20
- **Meta:** 1,000 -> 3,000 oyentes
- **Desafio:** Punto de quiebre economico
- **Desbloqueo al completar:** Sistema de Reputacion + Tienda de Musica
- **Hito narrativo:** Mensaje de DJ Sonic en la crisis
- **Dificultad minijuego:** Media-Alta

### Nivel 4: Momentum
- **Dias:** 21-30
- **Meta:** 3,000 -> 5,000 oyentes
- **Desafio:** Mantener consistencia creativa
- **Desbloqueo al completar:** Estudio Mejorado + Nuevos items en tienda
- **Hito narrativo:** Mensaje de Mama + Cambio de tono de El de la Renta
- **Dificultad minijuego:** Alta

### Nivel 5: La Recta Final
- **Dias:** 31-40
- **Meta:** 5,000 -> 7,000 oyentes
- **Desafio:** Canciones de alta calidad bajo presion maxima
- **Desbloqueo al completar:** Gira Virtual (evento de 3 dias)
- **Hito narrativo:** El Critico cambia de tono
- **Dificultad minijuego:** Muy Alta

### Nivel 6: Leyenda
- **Dias:** 41-45
- **Meta:** 7,000 -> 10,000 oyentes
- **Desafio:** Usar todas las herramientas simultaneamente
- **Recompensa final:** Estudio Profesional + Pantalla de Victoria
- **Hito narrativo:** Reconocimientos finales de todos los personajes
- **Dificultad minijuego:** Maxima

---

## 7. Sistema de Trabajos

El jugador puede ganar dinero de dos formas: trabajos online (desde el apartamento) y trabajos fisicos (saliendo a Purple City). Cada trabajo consume energia y tiempo pero genera ingresos inmediatos.

### 7.1 Trabajos Online (Disponibles desde Nivel 2)
Se realizan desde el computador del apartamento. El jugador interactua con el objeto "Computer" en la escena 3D.

| Trabajo | Pago | Energia | Tiempo | Nivel Requerido |
|---|---|---|---|---|
| Redaccion de correos | $200 | -15 | 1 turno | 2 |
| Fichas tecnicas | $350 | -20 | 1 turno | 2 |
| Diseno de logos | $500 | -25 | 2 turnos | 3 |
| Edicion de video | $700 | -30 | 2 turnos | 4 |
| Desarrollo web freelance | $1,000 | -40 | 3 turnos | 5 |

### 7.2 Trabajos Fisicos (Disponibles desde Nivel 2)
El jugador sale del apartamento y camina a los establecimientos en Purple City. Cada lugar tiene un NPC que ofrece el trabajo. Se activan con la tecla de interaccion (E) al acercarse.

| Trabajo | Lugar | Pago | Energia | Tiempo | Nivel Requerido |
|---|---|---|---|---|---|
| Barista | Cafe Purple Beans | $300 | -20 | 1 turno | 2 |
| Cajero | Almacen StreetWear | $350 | -20 | 1 turno | 2 |
| Mesero | Restaurante La Esquina | $400 | -25 | 1 turno | 3 |
| Repartidor | Delivery Express | $500 | -30 | 2 turnos | 3 |
| DJ en bar | Bar Neon Nights | $600 | -25 | 2 turnos | 4 |
| Instructor de musica | Academia SoundWave | $800 | -20 | 2 turnos | 5 |

### 7.3 Mecanica de Trabajos
- Cada dia tiene 4 turnos: Manana, Tarde, Atardecer, Noche
- Trabajar consume turnos y energia
- No se puede trabajar con energia < 10
- No se puede trabajar y grabar en el mismo turno
- Los trabajos fisicos requieren caminar hasta el lugar (consume 1 turno extra de desplazamiento si esta lejos)
- Al completar un trabajo se muestra una animacion de progreso y se recibe el pago

### 7.4 Estructura de Datos - Jobs
```typescript
interface Job {
  id: string;
  name: string;
  location: 'online' | 'cafe' | 'store' | 'restaurant' | 'delivery' | 'bar' | 'academy';
  description: string;
  pay: number;
  energyCost: number;
  turnsCost: number;
  levelRequired: number;
  icon: string;
  npcName?: string;
  npcDialogue?: string;
}

interface JobRecord {
  jobId: string;
  dayCompleted: number;
  moneyEarned: number;
}
```

---

## 8. Sistema de Tienda

La tienda permite al jugador comprar equipamiento musical, comida, y mejoras para su apartamento/estudio. Se desbloquea en el Nivel 3.

### 8.1 Tienda de Musica: "Purple Sound Shop"
Ubicada en Purple City. El jugador camina hasta la tienda e interactua con el NPC vendedor.

#### Categoria: Equipamiento Musical
| Item | Precio | Efecto | Nivel Requerido |
|---|---|---|---|
| Microfono basico | $500 | +5% calidad de grabacion | 3 |
| Microfono profesional | $2,000 | +15% calidad de grabacion | 4 |
| Audifonos de estudio | $800 | +8% calidad de grabacion | 3 |
| Monitor de estudio | $1,500 | +12% calidad de grabacion | 4 |
| Tarjeta de sonido | $2,500 | +18% calidad de grabacion | 5 |
| Software de produccion | $3,000 | Desbloquea beats premium | 5 |
| Kit de beats exclusivos | $1,000 | 5 beats nuevos para grabar | 3 |
| Controlador MIDI | $1,800 | +10% precision en minijuego | 4 |

#### Categoria: Comida y Energia
| Item | Precio | Efecto | Nivel Requerido |
|---|---|---|---|
| Ramen instantaneo | $50 | +15 hambre | 1 |
| Sandwich | $100 | +25 hambre | 1 |
| Comida casera | $200 | +40 hambre | 1 |
| Cafe | $30 | +10 energia | 1 |
| Bebida energetica | $80 | +20 energia | 2 |
| Comida gourmet | $500 | +60 hambre, +10 energia | 4 |

#### Categoria: Mejoras del Apartamento
| Item | Precio | Efecto | Nivel Requerido |
|---|---|---|---|
| Poster motivacional | $100 | +2% reputacion por cancion | 2 |
| Iluminacion LED | $300 | Mejora estetica del estudio | 3 |
| Sofa comodo | $800 | +5 energia al descansar | 3 |
| Cama nueva | $1,200 | +10 energia al dormir | 4 |
| Decoracion de estudio | $500 | +3% reputacion por cancion | 4 |
| Insonorizacion | $2,000 | +10% calidad de grabacion | 5 |

#### Categoria: Ropa y Estilo
| Item | Precio | Efecto | Nivel Requerido |
|---|---|---|---|
| Camiseta urbana | $150 | +2% reputacion | 2 |
| Zapatillas de marca | $400 | +3% reputacion | 3 |
| Cadena dorada | $800 | +5% reputacion | 4 |
| Outfit completo | $1,500 | +8% reputacion | 5 |
| Gafas de sol premium | $600 | +4% reputacion | 3 |

### 8.2 Mecanica de Tienda
- La tienda tiene un NPC vendedor con dialogos contextuales
- Los items se guardan en el inventario del jugador
- Los equipos musicales se aplican automaticamente al grabar
- La comida se consume manualmente desde el inventario
- Las mejoras del apartamento son permanentes y visibles en la escena 3D
- La ropa cambia la apariencia del jugador (si hay modelos disponibles) o suma stats
- Algunos items tienen stock limitado por dia

### 8.3 Estructura de Datos - Shop
```typescript
interface ShopItem {
  id: string;
  name: string;
  category: 'equipment' | 'food' | 'apartment' | 'clothing';
  description: string;
  price: number;
  levelRequired: number;
  icon: string;
  effect: {
    type: 'quality_bonus' | 'energy' | 'hunger' | 'reputation' | 'unlock' | 'cosmetic';
    value: number;
    permanent: boolean;
  };
  maxStock?: number;
  owned?: boolean;
}

interface InventoryItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
}
```

---

## 9. Sistemas de Juego

### 9.1 Sistema de Recursos
- **Dinero ($):** Inicia en $5,000. Se gana con trabajos e ingresos pasivos de oyentes. Se gasta en renta ($1,000/dia), comida y tienda.
- **Energia (0-100):** Se consume al grabar (-30), trabajar (variable), caminar (-5). Se recupera al dormir (+50), comer (+variable), descansar (+20).
- **Hambre (0-100):** Baja -10 por turno automaticamente. Si llega a 0, la energia baja el doble de rapido. Se recupera comiendo.
- **Formula de ingresos pasivos:** 10 oyentes mensuales = $1 de ingreso pasivo por dia

### 9.2 Sistema de Minijuego Ritmico
- El jugador presiona A, S, D, F al ritmo cuando los cuadros caen en pantalla
- Menos errores = mayor calidad de cancion
- La dificultad escala por nivel (velocidad de notas, cantidad, patrones)
- **Calidad resultante:**
  - 90-100% precision: Masterpiece (+500 oyentes base)
  - 70-89%: High (+300 oyentes base)
  - 50-69%: Medium (+150 oyentes base)
  - 0-49%: Low (+50 oyentes base, trigger de El Critico)
- Los bonos de equipamiento musical se aplican sobre la calidad base

### 9.3 Sistema de Renta
- $1,000 obligatorios cada atardecer
- Si no puede pagar: penalizacion de reputacion (-10), dialogo amenazante de El de la Renta
- 3 dias sin pagar consecutivos: Game Over
- El de la Renta aparece como evento automatico al atardecer

### 9.4 Sistema de Reputacion (Disponible desde Nivel 3)
- Escala 0-100
- Sube con: canciones de alta calidad, colaboraciones, items de ropa/estilo
- Baja con: canciones de baja calidad, no pagar renta, criticas negativas
- Reputacion alta: facilita colaboraciones, reduce agresividad de El Critico, mejora ingresos pasivos
- Reputacion baja: El Critico aparece mas seguido, colaboraciones no disponibles

### 9.5 Sistema de Oyentes
- Los oyentes se acumulan con cada cancion publicada
- Las canciones anteriores siguen generando oyentes (efecto momentum)
- Formula: oyentes_nuevos = calidad_base * (1 + reputacion/100) * multiplicador_nivel
- Multiplicadores por nivel: N1=1.0, N2=1.2, N3=1.5, N4=1.8, N5=2.2, N6=2.5

### 9.6 Sistema de Dialogos
- Los dialogos se activan por triggers (dia, nivel, oyentes, calidad, eventos)
- Cada dialogo tiene un flag para no repetirse
- Los dialogos pausan el gameplay y muestran un DialogBox con retrato del personaje
- El jugador avanza con click o tecla Space
- Algunos dialogos tienen opciones de respuesta que afectan reputacion

### 9.7 Sistema de Ciclo Dia/Noche
- Cada dia tiene 4 turnos: Manana, Tarde, Atardecer, Noche
- Manana: El jugador despierta, puede comer, planificar
- Tarde: Turno principal de trabajo o grabacion
- Atardecer: El de la Renta cobra, eventos narrativos
- Noche: Ultimo turno de actividad, luego dormir (obligatorio)
- La iluminacion 3D cambia segun el turno

---

## 10. Diseno de Interfaces (UI/UX)

### 10.1 Paleta de Colores (Tailwind Custom)
```
--purple-900: #1a0a2e (fondo principal)
--purple-800: #2d1b4e (paneles)
--purple-700: #4a2c7a (bordes activos)
--purple-500: #7c3aed (acentos, botones primarios)
--purple-400: #a78bfa (texto destacado)
--purple-300: #c4b5fd (hover states)
--gold-500: #f59e0b (dinero, logros)
--green-500: #22c55e (energia, positivo)
--red-500: #ef4444 (peligro, hambre baja)
--cyan-400: #22d3ee (oyentes, SoundCloud)
--gray-900: #111827 (texto sobre claro)
--gray-100: #f3f4f6 (texto sobre oscuro)
```

### 10.2 Tipografia
- **Titulos:** Font family bold, tracking-tight (estilo urbano)
- **Cuerpo:** Font family regular, leading-relaxed
- **Dialogos:** Font monospace para mensajes de texto
- **Numeros/Stats:** Font tabular-nums para alineacion

### 10.3 Pantallas del Juego

#### Pantalla 1: Splash Screen / Loading
- Logo de LEGENDS animado con Framer Motion
- Barra de progreso de carga de assets (modelos 3D, audio)
- Fondo degradado purpura oscuro
- Texto "Cargando Purple City..." con animacion de puntos
- Tailwind: `bg-gradient-to-b from-purple-900 to-black min-h-screen flex items-center justify-center`

#### Pantalla 2: Menu Principal
- Logo grande centrado con efecto glow purpura
- Botones principales con efecto hover y transicion:
  - "Nueva Partida" (primario, purpura)
  - "Continuar Partida" (secundario, borde purpura)
  - "Tabla de Lideres" (terciario)
  - "Configuracion" (icono engranaje)
  - "Creditos" (texto pequeno)
- Fondo: skyline de Purple City en silueta con efecto parallax
- Musica de fondo: beat lo-fi ambiental
- Tailwind: Cards con `backdrop-blur-md bg-white/5 border border-purple-500/20 rounded-2xl`

#### Pantalla 3: Seleccion de Partida / Login
- Formulario de login/registro con InsForge Auth
- 3 slots de guardado visibles con preview:
  - Dia actual, nivel, oyentes, dinero
  - Boton "Cargar" y "Eliminar"
- Boton "Nueva Partida" crea un slot nuevo
- Tailwind: Grid de cards `grid grid-cols-1 md:grid-cols-3 gap-6`

#### Pantalla 4: Juego Principal (HUD)
Layout dividido en capas:

**Capa 1 - Escena 3D (fondo completo):**
- Apartamento del jugador con modelo house.glb
- Jugador controlable con player1.glb
- NPCs interactuables (El de la Renta, etc.)
- Objetos interactuables: Cama, Computador, Puerta, Estudio

**Capa 2 - HUD Superior (overlay):**
- Barra superior con stats:
  - Dia X / 45 | Nivel X: "Nombre del Nivel"
  - Turno: Manana/Tarde/Atardecer/Noche (con icono)
- Barras de recursos (esquina superior derecha):
  - Dinero: icono $ + cantidad (dorado)
  - Energia: barra verde con porcentaje
  - Hambre: barra naranja con porcentaje
  - Oyentes: icono headphones + cantidad (cyan)
  - Reputacion: estrellas o barra (si desbloqueada)
- Tailwind: `fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm`

**Capa 3 - HUD Inferior (overlay):**
- Controles de movimiento (mobile): joystick virtual
- Boton de interaccion (E) cuando esta cerca de un objeto
- Mini-mapa o indicador de ubicacion
- Tailwind: `fixed bottom-0 left-0 right-0 z-50`

**Capa 4 - Paneles Laterales (overlay, toggle):**
- Inventario (izquierda): items comprados, comida, equipamiento
- Estadisticas (derecha): canciones, historial, progreso de nivel

#### Pantalla 5: Minijuego Ritmico
- Overlay fullscreen sobre la escena 3D
- 4 carriles (A, S, D, F) con notas cayendo
- Barra de combo en la parte superior
- Indicador de calidad en tiempo real
- Puntuacion final con estrellas y calidad resultante
- Tailwind: `fixed inset-0 z-60 bg-black/90 backdrop-blur-lg`

#### Pantalla 6: Tienda (Purple Sound Shop)
- Panel modal o pantalla completa
- Tabs por categoria: Equipamiento | Comida | Apartamento | Ropa
- Grid de items con:
  - Icono/imagen del item
  - Nombre y descripcion
  - Precio (dorado)
  - Efecto (verde)
  - Boton "Comprar" (deshabilitado si no hay dinero o nivel)
- Dinero actual visible en header
- Tailwind: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

#### Pantalla 7: Trabajo (Interfaz)
- Para trabajos online: mini-interfaz de computador con progreso
- Para trabajos fisicos: escena del lugar + dialogo con NPC + barra de progreso
- Resultado: dinero ganado, energia perdida, turno consumido
- Animacion de completado con efecto de monedas

#### Pantalla 8: Dialogo
- Caja de dialogo en la parte inferior de la pantalla
- Retrato del personaje a la izquierda
- Nombre del personaje arriba del texto
- Texto con efecto typewriter (letra por letra)
- Indicador "Click para continuar"
- Opciones de respuesta cuando aplica
- Tailwind: `fixed bottom-8 left-4 right-4 z-70 bg-gray-900/95 border border-purple-500/30 rounded-xl p-6`

#### Pantalla 9: Pausa
- Overlay semi-transparente sobre el juego
- Menu centrado con opciones:
  - Continuar
  - Guardar Partida
  - Configuracion
  - Salir al Menu
- Tailwind: `fixed inset-0 z-80 bg-black/70 flex items-center justify-center`

#### Pantalla 10: Game Over
- Pantalla dramatica con estadisticas finales
- Razon del game over (no pago renta 3 dias, etc.)
- Opciones: "Intentar de Nuevo" o "Menu Principal"
- Animacion de fade con tono rojo

#### Pantalla 11: Victoria
- Pantalla de celebracion con confetti y efectos
- Estadisticas completas del recorrido:
  - Oyentes finales, canciones grabadas, dinero acumulado
  - Reputacion final, dias jugados, trabajos completados
  - Items comprados, colaboraciones hechas
- Dialogo final de DJ Sonic: "Que sigue?"
- Boton para guardar en leaderboard
- Tailwind: `bg-gradient-to-b from-purple-900 via-purple-800 to-gold-900`

### 10.4 Componentes UI Reutilizables (Atomic Design)

**Atomos:**
- Button (primary, secondary, ghost, danger)
- Badge (level, status, notification)
- ProgressBar (energy, hunger, reputation)
- Icon (SVG sprite system)
- Text (heading, body, caption, mono)
- Avatar (character portraits)

**Moleculas:**
- ResourceBar (icono + label + barra + valor)
- ItemCard (icono + nombre + precio + efecto)
- DialogueBubble (retrato + nombre + texto)
- NotificationToast (icono + mensaje + auto-dismiss)
- StatRow (label + valor + trend indicator)

**Organismos:**
- TopBar (dia, nivel, turno, recursos)
- InventoryPanel (grid de items con tabs)
- ShopGrid (items filtrables por categoria)
- DialogueBox (retrato + texto + opciones)
- RhythmLanes (4 carriles + notas + combo)
- JobSelector (lista de trabajos disponibles)

---

## 11. Estructura de Carpetas del Proyecto

```
legends-game/
├── public/
│   ├── audio/                    # Musica y SFX
│   │   ├── beats/                # Beats para minijuego ritmico
│   │   ├── sfx/                  # Efectos de sonido
│   │   └── music/                # Musica de fondo
│   ├── models/                   # Modelos 3D GLB
│   │   ├── house.glb             # Apartamento del jugador
│   │   ├── player1.glb           # Modelo del jugador (24 animaciones)
│   │   ├── city/                 # Modelos de Purple City
│   │   └── npcs/                 # Modelos de NPCs
│   ├── icons.svg                 # Sprite de iconos
│   └── favicon.svg
├── src/
│   ├── app/
│   │   └── App.tsx               # Root component con router de pantallas
│   ├── assets/
│   │   ├── fonts/
│   │   ├── images/
│   │   │   ├── portraits/        # Retratos de personajes para dialogos
│   │   │   ├── items/            # Iconos de items de tienda
│   │   │   ├── backgrounds/      # Fondos de menu y pantallas
│   │   │   └── icons/
│   │   └── textures/
│   ├── components/
│   │   ├── atoms/                # Componentes atomicos
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Icon.tsx
│   │   │   └── Text.tsx
│   │   ├── molecules/            # Componentes moleculares
│   │   │   ├── ResourceBar.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── DialogueBubble.tsx
│   │   │   ├── NotificationToast.tsx
│   │   │   └── StatRow.tsx
│   │   ├── organisms/            # Componentes complejos
│   │   │   ├── TopBar.tsx
│   │   │   ├── InventoryPanel.tsx
│   │   │   ├── ShopGrid.tsx
│   │   │   ├── JobSelector.tsx
│   │   │   └── RhythmLanes.tsx
│   │   ├── game/                 # Componentes 3D del juego
│   │   │   ├── Player.tsx
│   │   │   ├── CameraRig.tsx
│   │   │   ├── NPC.tsx
│   │   │   ├── InteractableObject.tsx
│   │   │   ├── Bed.tsx
│   │   │   ├── Computer.tsx
│   │   │   ├── Door.tsx
│   │   │   └── Room.tsx
│   │   ├── rhythm/               # Componentes del minijuego ritmico
│   │   │   ├── RhythmGame.tsx
│   │   │   ├── BeatLane.tsx
│   │   │   ├── Note.tsx
│   │   │   ├── ComboMeter.tsx
│   │   │   └── ScoreBoard.tsx
│   │   └── ui/                   # Componentes de interfaz
│   │       ├── DialogBox.tsx
│   │       ├── HUD.tsx
│   │       ├── LoadingScreen.tsx
│   │       ├── MainMenu.tsx
│   │       ├── Notification.tsx
│   │       ├── PauseMenu.tsx
│   │       ├── StatsPanel.tsx
│   │       ├── TopBar.tsx
│   │       ├── ShopScreen.tsx
│   │       ├── JobScreen.tsx
│   │       ├── SaveLoadScreen.tsx
│   │       ├── GameOverScreen.tsx
│   │       ├── VictoryScreen.tsx
│   │       └── LeaderboardScreen.tsx
│   ├── data/                     # Datos estaticos del juego
│   │   ├── characters.ts         # Definicion de personajes y arcos
│   │   ├── dialogues.ts          # Todos los dialogos por trigger
│   │   ├── events.ts             # Eventos narrativos por dia/nivel
│   │   ├── levels.ts             # Configuracion de los 6 niveles
│   │   ├── songs.ts              # Beats disponibles para grabar
│   │   ├── jobs.ts               # Definicion de trabajos disponibles
│   │   ├── shopItems.ts          # Catalogo de items de tienda
│   │   └── achievements.ts       # Logros desbloqueables
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAudio.ts
│   │   ├── useCameraFollow.ts
│   │   ├── useDayCycle.ts
│   │   ├── useKeyboard.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePlayerMovement.ts
│   │   ├── useInsForge.ts        # Hook para operaciones InsForge
│   │   └── useGameSave.ts        # Hook para guardar/cargar partidas
│   ├── scenes/                   # Escenas 3D
│   │   ├── ApartmentScene.tsx    # Interior del apartamento
│   │   ├── CityScene.tsx         # Purple City exterior
│   │   ├── StudioScene.tsx       # Estudio de grabacion
│   │   ├── ShopScene.tsx         # Interior de la tienda
│   │   ├── CafeScene.tsx         # Interior del cafe (trabajo)
│   │   ├── MainScene.tsx         # Scene manager
│   │   └── MenuScene.tsx         # Escena del menu principal
│   ├── services/                 # Servicios externos
│   │   ├── insforge.ts           # Cliente InsForge configurado
│   │   ├── authService.ts        # Autenticacion con InsForge
│   │   ├── saveService.ts        # CRUD de partidas guardadas
│   │   └── leaderboardService.ts # Operaciones de leaderboard
│   ├── store/                    # Zustand stores
│   │   ├── gameStore.ts          # Estado del juego (dia, nivel, fase)
│   │   ├── playerStore.ts        # Estado del jugador (recursos, stats)
│   │   ├── uiStore.ts            # Estado de UI (pantallas, dialogos)
│   │   ├── audioStore.ts         # Estado de audio
│   │   ├── saveStore.ts          # Estado de guardado
│   │   ├── shopStore.ts          # Estado de la tienda
│   │   └── jobStore.ts           # Estado de trabajos
│   ├── systems/                  # Logica de juego (pura, sin UI)
│   │   ├── economySystem.ts      # Calculo de dinero e ingresos
│   │   ├── energySystem.ts       # Gestion de energia
│   │   ├── hungerSystem.ts       # Gestion de hambre
│   │   ├── rhythmSystem.ts       # Logica del minijuego ritmico
│   │   ├── reputationSystem.ts   # Calculo de reputacion
│   │   ├── rentSystem.ts         # Cobro de renta diario
│   │   ├── levelSystem.ts        # Progresion de niveles
│   │   ├── listenerSystem.ts     # Calculo de oyentes
│   │   ├── dialogueSystem.ts     # Motor de dialogos y triggers
│   │   ├── movementSystem.ts     # Movimiento 3D y colisiones
│   │   ├── jobSystem.ts          # Logica de trabajos
│   │   ├── shopSystem.ts         # Logica de compras y inventario
│   │   └── dayCycleSystem.ts     # Avance de turnos y dias
│   ├── styles/
│   │   ├── globals.css           # Estilos globales + Tailwind imports
│   │   ├── variables.css         # Custom properties
│   │   └── animations.css        # Keyframes personalizados
│   ├── types/                    # TypeScript types
│   │   ├── game.ts               # Tipos del juego
│   │   ├── player.ts             # Tipos del jugador
│   │   ├── ui.ts                 # Tipos de UI
│   │   ├── shop.ts               # Tipos de tienda
│   │   ├── jobs.ts               # Tipos de trabajos
│   │   └── dialogue.ts           # Tipos de dialogos
│   ├── utils/                    # Utilidades
│   │   ├── constants.ts          # Constantes del juego
│   │   ├── format.ts             # Formateo de numeros, texto
│   │   ├── math.ts               # Funciones matematicas
│   │   └── random.ts             # Generacion aleatoria
│   ├── index.css
│   └── main.tsx
├── .insforge/
│   └── project.json              # Configuracion InsForge
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── agents.md                     # Este archivo
```

---

## 12. Historia Completa — Dialogos y Eventos por Dia

### Acto I: El Comienzo (Dias 1-5 / Nivel 1)

**Dia 1 - Manana:**
- DJ Sonic: "Oye, que tal? Escuche que querias hacer musica. Tengo algunos beats que podrian funcionarte. Que dices? Te puedo ensenar como funciona esto."
- Jugador: "Esto es. Es ahora o nunca."

**Dia 1 - Tarde (Primera Grabacion):**
- DJ Sonic: "Bien, hermano. Aqui esta el beat. Cuando veas los cuadros caer, presiona A, S, D, F al ritmo. Cuantos menos errores, mejor la calidad de tu cancion. Listo?"
- Jugador: "Creo que si. Aqui voy."
- DJ Sonic: "Bien hecho! Eso fue un comienzo solido. No es perfecto, pero tiene potencial. Sigue practicando."

**Dia 1 - Atardecer (El de la Renta):**
- El de la Renta: "HOLA, ARTISTA! Llego la hora del pago. Son $1,000. Espero que tengas esto la proxima renta, eh?"
- Jugador: "Si, claro. Aqui esta."
- El de la Renta: "Bien. Nos vemos manana. Y oye... que la musica sea buena, porque si no, al menos que el dinero sea seguro, entiendes?"

**Dia 5 - Noche (500 oyentes - Luna aparece):**
- Luna: "Esto es increible! Cuando subes mas? Necesito mas de esto en mi vida."
- Jugador: "Wow. Alguien realmente lo disfruto. Tengo que seguir."

### Acto II: La Lucha (Dias 6-20 / Niveles 2 y 3)

**Dia 6 (Desbloqueo trabajos):**
- DJ Sonic: "Necesitas diversificar. Prueba con trabajos online mientras construyes tu audiencia. No es glamoroso, pero te mantiene en el juego."
- Sistema: Se desbloquean trabajos online y fisicos

**Dia 8-10 (El Critico aparece si calidad < 40%):**
- El Critico: "Este tipo de musica dana la mente, no es buena para los jovenes. Por que la musica es tan soez?"

**Dia 13 - Atardecer (Punto de quiebre):**
- El de la Renta: (tono agresivo, el jugador no puede pagar completo)
- DJ Sonic: "Hermano, vi que las cosas se pusieron dificiles. Todos pasamos por esto. La diferencia entre los que lo logran y los que no es que los que lo logran no se rinden. Tu tienes talento. Sigue adelante."

**Dia 15 (Desbloqueo tienda):**
- Sistema: Se desbloquea Purple Sound Shop
- NPC Vendedor: "Bienvenido a Purple Sound Shop! Aqui encontraras todo lo que necesitas para sonar como un profesional. Echa un vistazo."

### Acto III: La Ascension (Dias 21-45 / Niveles 4, 5 y 6)

**Dia 21 (1,000 oyentes):**
- DJ Sonic: "Lo sabia! Estas en el camino correcto. Mil personas escuchando tu musica. Recuerdas el Dia 1? Esto lo construiste tu."

**Dia 28 (Mensaje de Mama):**
- Mama: "Vi que tu musica esta en SoundCloud. Estoy tan orgullosa de ti. Se que esto es dificil, pero veo cuanto lo amas. Sigue adelante, mi amor."

**Dia 30 (5,000 oyentes - El de la Renta cambia):**
- El de la Renta: "Veo que las cosas te van bien. Sigue asi."

**Dia 35 (El Critico cambia):**
- El Critico: "Finalmente estas mejorando. Esto tiene potencial real."

**Dia 45 (10,000 oyentes - Victoria):**
- DJ Sonic: "Bienvenido al siguiente nivel. Mira esto: diez mil oyentes. Sabes que significa eso? Significa que la gente realmente se conecta con tu musica. Significa que tienes algo que decir. Ahora, la verdadera carrera comienza."
- Jugador: "No puedo creer que estoy aqui."
- DJ Sonic: "Creelo. Lo hiciste. Ahora, que sigue?"

---

## 13. Flujo de Persistencia con InsForge

### 13.1 Autenticacion
1. Usuario abre el juego -> Splash Screen
2. Menu Principal -> "Nueva Partida" o "Continuar"
3. Si no esta logueado -> Pantalla de Login/Registro (InsForge Auth)
4. Si esta logueado -> Mostrar slots de guardado

### 13.2 Guardado de Partida
- **Auto-save:** Al final de cada dia (automatico)
- **Manual save:** Desde el menu de pausa
- **Datos guardados:** Todo el gameState, playerState, songs, inventory, dialogueFlags, jobHistory, statistics
- **Endpoint:** InsForge Database collection `game_saves`

### 13.3 Carga de Partida
1. Obtener game_saves del usuario por userId
2. Mostrar slots con preview (dia, nivel, oyentes, dinero)
3. Al seleccionar: cargar todo el estado en los Zustand stores
4. Reanudar el juego desde el punto guardado

### 13.4 Leaderboard
- Al completar el juego (victoria o game over): guardar en collection `leaderboard`
- Mostrar top 100 jugadores ordenados por finalListeners
- Filtros: "Victorias", "Todos", "Esta semana"

---

## 14. Accesibilidad y Buenas Practicas

- Contraste minimo WCAG AA en todos los textos
- Navegacion por teclado completa
- Indicadores visuales claros para estados (colores + iconos + texto)
- Tamanos de fuente minimo 14px
- Areas de click minimo 44x44px en mobile
- Reduccion de movimiento respetada (prefers-reduced-motion)
- Textos alternativos en imagenes
- Focus visible en todos los elementos interactivos

---

## 15. Resumen de Mecanicas Principales

| Accion | Donde | Costo | Resultado |
|---|---|---|---|
| Grabar cancion | Estudio (apartamento) | -30 energia, 1 turno | Cancion + oyentes |
| Trabajo online | Computador (apartamento) | -15 a -40 energia, 1-3 turnos | $200-$1,000 |
| Trabajo fisico | Lugares en Purple City | -20 a -30 energia, 1-2 turnos | $300-$800 |
| Comprar en tienda | Purple Sound Shop | Dinero variable | Items/mejoras |
| Comer | Inventario o tienda | Dinero variable | +hambre, +energia |
| Dormir | Cama (apartamento) | 1 turno (noche) | +50 energia, avanza dia |
| Descansar | Sofa (apartamento) | 1 turno | +20 energia |
| Pagar renta | Automatico (atardecer) | -$1,000 | Evitar penalizacion |
| Interactuar NPC | Acercarse + tecla E | Ninguno | Dialogos, misiones |
| Colaborar | Disponible desde Nivel 2 | -20 energia, 1 turno | Cancion compartida + mas oyentes |

---

**Fin del documento de especificacion tecnica.**
**Version:** 1.0
**Ultima actualizacion:** Abril 2026
