import { lazy, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimatePresence } from 'framer-motion';
import { SceneManager } from '../scenes/SceneManager';
import { 
  LoadingScreen, 
  MainMenu,
  TopBar, 
  HUD, 
  CameraHUD,
  Notification,
  DialogBox,
  PauseMenu,
} from '../components/ui';
import { LocationMap } from '../components/ui/LocationMap';
import { MiniMap } from '../components/ui/MiniMap';
import { MapTutorial } from '../components/ui/MapTutorial';
import { AuthTestScreen } from '../components/ui/AuthTestScreen';
import { AuthScreen } from '../components/ui/AuthScreen';
import { CharacterSelectScreen } from '../components/ui/CharacterSelectScreen';
import { GameInitializer } from '../components/GameInitializer';
import { RhythmGame } from '../components/rhythm/RhythmGame';
import { useInsForge } from '../hooks/useInsForge';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useShopStore } from '../store/shopStore';
import { useJobStore } from '../store/jobStore';
import { ShopSystem } from '../systems/shopSystem';
import { JobSystem } from '../systems/jobSystem';
import { motion } from 'framer-motion';

// Lazy load de pantallas pesadas para optimización
const ShopScreen = lazy(() => import('../components/ui/ShopScreen'));
const JobScreen = lazy(() => import('../components/ui/JobScreen'));
const GameOverScreen = lazy(() => import('../components/ui/GameOverScreen'));
const VictoryScreen = lazy(() => import('../components/ui/VictoryScreen'));
const LeaderboardScreen = lazy(() => import('../components/ui/LeaderboardScreen'));
const SaveLoadScreen = lazy(() => import('../components/ui/SaveLoadScreen'));
const SettingsScreen = lazy(() => import('../components/ui/SettingsScreen'));
const CreditsScreen = lazy(() => import('../components/ui/CreditsScreen'));

function GameScene() {
  // Estados del juego
  const { currentDay, currentLevel, timeOfDay, isPaused, togglePause, currentScene, setCurrentScene, gamePhase } = useGameStore();
  const { money, energy, hunger, monthlyListeners, reputation } = usePlayerStore();
  const { dialogueActive, currentDialogue, closeDialogue } = useUIStore();
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hook de InsForge para guardado
  const { user, saveGame } = useInsForge();

  // Asegurar que el gamePhase sea 'playing' al entrar a la escena
  useEffect(() => {
    const { gamePhase } = useGameStore.getState();
    if (gamePhase === 'menu') {
      // Reset player state for a fresh game (unless a save was loaded)
      const playerState = usePlayerStore.getState();
      if (playerState.monthlyListeners === 0 && playerState.songs.length === 0) {
        playerState.resetPlayer();
      }
      useGameStore.getState().startNewGame();
    }
  }, []);

  // Mostrar tutorial la primera vez
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('legends-map-tutorial');
    if (!hasSeenTutorial && currentDay === 1) {
      setShowTutorial(true);
    }
  }, [currentDay]);

  // Nombre del nivel
  const levelNames: Record<number, string> = {
    1: 'El Primer Beat',
    2: 'Subsistir o Crear',
    3: 'La Prueba del Fuego',
    4: 'Momentum',
    5: 'La Recta Final',
    6: 'Leyenda',
  };
  
  // Detectar tecla ESC para pausar y M para mapa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
      if (e.key === 'm' || e.key === 'M') {
        setShowLocationMap(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('legends-map-tutorial', 'seen');
  };

  const handleLocationSelect = (locationId: string) => {
    setCurrentScene(locationId as any);
    setShowLocationMap(false);
    
    // Mostrar notificación
    const locationNames: Record<string, string> = {
      apartment: 'Tu Apartamento',
      cafe: 'Café Purple Beans',
      store: 'Almacén StreetWear',
      shop: 'Purple Sound Shop',
      restaurant: 'Restaurante La Esquina',
      delivery: 'Delivery Express',
      bar: 'Bar Neon Nights',
      academy: 'Academia SoundWave'
    };
    
    useUIStore.getState().addNotification('info', `Viajando a ${locationNames[locationId] || locationId}...`);
  };

  return (
    <>
      {/* Escena 3D */}
      <div className="w-screen h-screen">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ fov: 50, near: 0.1, far: 500, position: [0, 12, 15] }}
        >
          <color attach="background" args={['#8a8a8e']} />
          <ambientLight intensity={1.8} />
          <directionalLight
            position={[5, 12, 5]}
            intensity={2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <hemisphereLight args={['#e8e0ff', '#b97a20', 0.6]} />
          {/* Extra fill light from below to brighten the floor */}
          <pointLight position={[0, 8, 0]} intensity={1.5} distance={25} color="#ffffff" />
          <SceneManager />
        </Canvas>
      </div>

      {/* TopBar - Información del día y nivel */}
      <TopBar
        currentDay={currentDay}
        maxDays={45}
        currentLevel={currentLevel}
        levelName={levelNames[currentLevel] || 'Nivel Desconocido'}
        timeOfDay={timeOfDay}
      />

      {/* HUD - Recursos del jugador */}
      <HUD
        money={money}
        energy={energy}
        hunger={hunger}
        listeners={monthlyListeners}
        reputation={reputation}
        showReputation={currentLevel >= 3}
      />

      {/* Mini-mapa */}
      <MiniMap
        currentLocation={currentScene}
        onOpenFullMap={() => setShowLocationMap(true)}
      />

      {/* Botón flotante para abrir mapa */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowLocationMap(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-2xl border-2 border-purple-400 flex items-center justify-center text-2xl hover:shadow-purple-500/50 transition-all"
        title="Abrir mapa (M)"
      >
        🗺️
      </motion.button>

      {/* Indicador de ubicación actual */}
      <div className="fixed bottom-8 left-8 z-40 bg-black/70 backdrop-blur-md border-2 border-purple-500 rounded-xl px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <div className="text-xs text-purple-400 font-medium">Ubicación</div>
            <div className="text-sm text-white font-bold">
              {currentScene === 'apartment' ? 'Tu Apartamento' : 'Purple City'}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de ubicaciones */}
      <AnimatePresence>
        {showLocationMap && (
          <LocationMap
            currentLocation={currentScene}
            onSelectLocation={handleLocationSelect}
            onClose={() => setShowLocationMap(false)}
          />
        )}
      </AnimatePresence>

      {/* Tutorial del mapa */}
      <MapTutorial
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
      />

      {/* CameraHUD - Controles e interacción */}
      <CameraHUD
        showInteractPrompt={false}
        interactText="Interactuar"
        showMobileControls={window.innerWidth < 768}
      />

      {/* DialogBox - Sistema de diálogos */}
      <DialogBox
        isOpen={dialogueActive}
        character={currentDialogue?.speaker || ''}
        text={currentDialogue?.text || ''}
        portrait={currentDialogue?.portrait}
        options={currentDialogue?.options}
        onNext={closeDialogue}
        onSelectOption={(optionId: string) => {
          console.log('Opción seleccionada:', optionId);
          closeDialogue();
        }}
        showContinueIndicator={!currentDialogue?.options}
      />

      {/* PauseMenu - Menú de pausa */}
      <PauseMenu
        isOpen={isPaused}
        onContinue={togglePause}
        onSave={async () => {
          if (!user) {
            useUIStore.getState().addNotification('warning', 'Inicia sesión para guardar');
            return;
          }
          setIsSaving(true);
          const result = await saveGame('manual');
          if (result.success) {
            useUIStore.getState().addNotification('success', '💾 Partida guardada exitosamente');
          } else {
            useUIStore.getState().addNotification('error', `Error al guardar: ${result.error}`);
          }
          setIsSaving(false);
        }}
        onSettings={() => { togglePause(); setShowSettings(true); }}
        onMainMenu={() => useUIStore.getState().setScreen('main_menu')}
        isSaving={isSaving}
      />

      {/* Settings overlay (dentro del juego, no cambia de pantalla) */}
      {showSettings && (
        <Suspense fallback={null}>
          <div className="fixed inset-0 z-[90]">
            <SettingsScreen onClose={() => setShowSettings(false)} />
          </div>
        </Suspense>
      )}

      {/* Rhythm Game — Minijuego de grabación */}
      <AnimatePresence>
        {gamePhase === 'rhythm_game' && <RhythmGame />}
      </AnimatePresence>
    </>
  );
}

/* Wrapper to load leaderboard data from InsForge */
function LeaderboardWrapper() {
  const { topPlayers, refreshLeaderboard, isLoading } = useInsForge();
  const [filter, setFilter] = useState<'all' | 'winners' | 'week'>('all');

  useEffect(() => { refreshLeaderboard(); }, [refreshLeaderboard]);

  const entries = topPlayers.map((p: any, i: number) => ({
    id: p.id,
    username: p.username,
    finalListeners: p.final_listeners,
    finalDay: p.final_day,
    totalSongs: p.total_songs,
    won: p.won,
    completedAt: p.completed_at,
    rank: i + 1,
  }));

  const filtered = filter === 'all' ? entries
    : filter === 'winners' ? entries.filter((e: any) => e.won)
    : entries; // 'week' filter would need date logic

  return (
    <LeaderboardScreen
      entries={filtered}
      isLoading={isLoading}
      onBack={() => useUIStore.getState().setScreen('main_menu')}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const isLoading = useUIStore((s) => s.isLoading);
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.removeNotification);
  const { availableItems } = useShopStore();
  const { availableJobs, currentJob } = useJobStore();
  const { money, songs, inventory } = usePlayerStore();
  const { currentLevel } = useGameStore();

  // Handler de trabajo
  const handleStartJob = (jobId: string) => {
    JobSystem.startJob(jobId);
  };

  // Modo de prueba de InsForge (activar con ?test=insforge en la URL)
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');
  
  if (testMode === 'insforge') {
    return <AuthTestScreen />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-purple-950">
      {/* Inicializador del juego */}
      <GameInitializer />

      {/* Pantalla de carga */}
      {(currentScreen === 'loading' || isLoading) && (
        <LoadingScreen />
      )}

      {/* Pantalla del menú principal */}
      {currentScreen === 'main_menu' && !isLoading && <MainMenu />}

      {/* Pantalla de autenticación */}
      {currentScreen === 'auth' && <AuthScreen />}

      {/* Pantalla de selección de personaje */}
      {currentScreen === 'character_select' && <CharacterSelectScreen />}
      
      {/* Pantalla del juego */}
      {currentScreen === 'game' && <GameScene />}

      {/* Pantallas lazy loaded con Suspense */}
      <Suspense fallback={<LoadingScreen />}>
        {currentScreen === 'save_load' && <SaveLoadScreen />}
        
        {currentScreen === 'shop' && (
          <ShopScreen 
            items={availableItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              icon: item.icon,
              effect: item.effect,
              owned: item.owned,
              canAfford: money >= item.price,
              levelRequired: item.levelRequired,
              currentLevel: currentLevel,
            }))}
            currentMoney={money}
            currentLevel={currentLevel}
            onPurchase={(itemId: string) => ShopSystem.purchaseItem(itemId)}
            onBack={() => useUIStore.getState().setScreen('game')}
            isOpen={true}
          />
        )}
        
        {currentScreen === 'job_select' && (
          <JobScreen 
            jobs={availableJobs.map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              pay: job.pay,
              energyCost: job.energyCost,
              turnsCost: job.turnsCost,
              location: job.location,
              levelRequired: job.levelRequired,
              available: currentLevel >= job.levelRequired,
            }))}
            currentJob={currentJob?.id || null}
            onStartJob={handleStartJob}
            onCompleteJob={() => JobSystem.completeJob()}
            onBack={() => useUIStore.getState().setScreen('game')}
            isWorking={!!currentJob}
          />
        )}
        
        {currentScreen === 'game_over' && (
          <GameOverScreen 
            reason="No pagaste la renta 3 días consecutivos" 
            stats={{
              finalListeners: 0,
              totalSongs: songs.length,
              totalMoney: money,
              finalReputation: 0,
              daysPlayed: 0,
              jobsCompleted: 0,
              itemsPurchased: inventory.length,
              collaborations: 0,
            }}
            onRetry={() => useUIStore.getState().setScreen('game')}
            onMainMenu={() => useUIStore.getState().setScreen('main_menu')}
          />
        )}
        
        {currentScreen === 'victory' && (
          <VictoryScreen 
            stats={{
              finalListeners: 10000,
              totalSongs: songs.length,
              totalMoney: money,
              finalReputation: 100,
              daysPlayed: 45,
              jobsCompleted: 0,
              itemsPurchased: inventory.length,
              collaborations: 0,
            }}
            onSaveToLeaderboard={() => console.log('Guardar en leaderboard')}
            onMainMenu={() => useUIStore.getState().setScreen('main_menu')}
          />
        )}
        
        {currentScreen === 'leaderboard' && (
          <LeaderboardWrapper />
        )}

        {currentScreen === 'settings' && <SettingsScreen />}
        
        {currentScreen === 'credits' && <CreditsScreen />}
      </Suspense>

      {/* Sistema de notificaciones (siempre visible) */}
      <Notification
        notifications={notifications}
        onDismiss={removeNotification}
        position="top-right"
      />
    </div>
  );
}

export default App;
