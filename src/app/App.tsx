import { lazy, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ApartmentScene } from '../scenes/ApartmentScene';
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
import { AuthTestScreen } from '../components/ui/AuthTestScreen';
import { GameInitializer } from '../components/GameInitializer';
import { useUIStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useShopStore } from '../store/shopStore';
import { useJobStore } from '../store/jobStore';
import { ShopSystem } from '../systems/shopSystem';
import { JobSystem } from '../systems/jobSystem';

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
  const { currentDay, currentLevel, timeOfDay, isPaused, togglePause } = useGameStore();
  const { money, energy, hunger, monthlyListeners, reputation } = usePlayerStore();
  const { dialogueActive, currentDialogue, closeDialogue } = useUIStore();

  // Nombre del nivel
  const levelNames: Record<number, string> = {
    1: 'El Primer Beat',
    2: 'Subsistir o Crear',
    3: 'La Prueba del Fuego',
    4: 'Momentum',
    5: 'La Recta Final',
    6: 'Leyenda',
  };
  
  // Detectar tecla ESC para pausar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePause]);

  return (
    <>
      {/* Escena 3D */}
      <div className="w-screen h-screen">
        <Canvas
          shadows
          camera={{ fov: 50, near: 0.01, far: 200, position: [0, 3, 3] }}
        >
          <color attach="background" args={['#87CEEB']} />
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
          />
          <hemisphereLight args={['#b1e1ff', '#b97a20', 0.3]} />
          <ApartmentScene />
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
        onSave={() => useUIStore.getState().addNotification('success', 'Partida guardada')}
        onSettings={() => console.log('Configuración')}
        onMainMenu={() => useUIStore.getState().setScreen('main_menu')}
        isSaving={false}
      />
    </>
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
          <LeaderboardScreen 
            entries={[]}
            onBack={() => useUIStore.getState().setScreen('main_menu')}
          />
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
