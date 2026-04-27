/**
 * 🎮 LEGENDS: Game Integration Component
 * Componente que integra todos los sistemas con la UI
 * Autor: Felipe (Systems Developer)
 */

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

// Importar componentes UI de Nicol
import HUD from '../components/ui/HUD';
import MainMenu from '../components/ui/MainMenu';
import LoadingScreen from '../components/ui/LoadingScreen';
import PauseMenu from '../components/ui/PauseMenu';
import DialogBox from '../components/ui/DialogBox';
import ShopScreen from '../components/ui/ShopScreen';
import JobScreen from '../components/ui/JobScreen';
import GameOverScreen from '../components/ui/GameOverScreen';
import VictoryScreen from '../components/ui/VictoryScreen';
import { RhythmGame } from '../components/rhythm/RhythmGame';

// Importar hooks
import { useGameLoop } from '../hooks/useGameLoop';
import { useResources } from '../hooks/useResources';

export const GameIntegration: React.FC = () => {
  const { gamePhase } = useGameStore();
  const { dialogueActive, currentDialogue, isLoading } = useUIStore();

  // Hooks del juego
  const gameLoop = useGameLoop();
  const resources = useResources();

  // Inicializar juego
  useEffect(() => {
    console.log('[GameIntegration] Initializing game...');
    useUIStore.getState().setLoading(false);
    useUIStore.getState().setScreen('main_menu');
  }, []);

  // Renderizar según el estado
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="game-container relative w-full h-screen overflow-hidden bg-purple-900">
      {/* Pantalla principal según currentScreen */}
      {useUIStore.getState().currentScreen === 'main_menu' && <MainMenu />}
      
      {useUIStore.getState().currentScreen === 'game' && (
        <>
          {/* HUD siempre visible durante el juego */}
          <HUD
            money={resources.money}
            energy={resources.energy}
            hunger={resources.hunger}
            listeners={resources.monthlyListeners}
          />

          {/* Escena 3D del juego (aquí iría el componente de Three.js) */}
          <div className="game-scene absolute inset-0 -z-10">
            {/* TODO: Integrar escena 3D de Nicol */}
          </div>
        </>
      )}

      {/* Overlays según gamePhase */}
      {gamePhase === 'paused' && <PauseMenu isOpen={true} onContinue={() => {}} onSave={() => {}} onSettings={() => {}} onMainMenu={() => {}} />}
      
      {gamePhase === 'rhythm_game' && <RhythmGame />}
      
      {gamePhase === 'shopping' && <ShopScreen items={[]} currentMoney={0} currentLevel={1} onPurchase={() => {}} onBack={() => {}} isOpen={true} />}
      
      {gamePhase === 'working' && <JobScreen jobs={[]} currentJob={null} onStartJob={() => {}} onCompleteJob={() => {}} onBack={() => {}} isWorking={false} />}

      {/* Diálogos */}
      {dialogueActive && currentDialogue && (
        <DialogBox
          isOpen={true}
          character={currentDialogue.speaker || 'Unknown'}
          text={currentDialogue.text}
          onNext={() => {}}
        />
      )}

      {/* Pantallas de fin de juego */}
      {gamePhase === 'game_over' && <GameOverScreen reason="" stats={{
        finalListeners: 0,
        totalSongs: 0,
        totalMoney: 0,
        finalReputation: 0,
        jobsCompleted: 0,
        collaborations: 0,
        daysPlayed: 0,
        itemsPurchased: 0
      }} onRetry={() => {}} onMainMenu={() => {}} />}
      
      {gamePhase === 'victory' && <VictoryScreen stats={{
        finalListeners: 0,
        totalSongs: 0,
        totalMoney: 0,
        finalReputation: 0,
        jobsCompleted: 0,
        collaborations: 0,
        daysPlayed: 0,
        itemsPurchased: 0
      }} onSaveToLeaderboard={() => {}} onMainMenu={() => {}} />}
    </div>
  );
};
