import { Canvas } from '@react-three/fiber';
import { ApartmentScene } from '../scenes/ApartmentScene';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { MainMenu } from '../components/ui/MainMenu';
import { useUIStore } from '../store/uiStore';

function GameScene() {
  return (
    <>
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

      {/* Game HUD */}
      <div className="fixed bottom-5 left-5 z-50 text-white bg-black/75 px-4 py-3 rounded-lg font-mono text-sm leading-relaxed">
        <div className="font-bold mb-1">Controles:</div>
        <div>W / ↑ — Adelante</div>
        <div>S / ↓ — Atrás</div>
        <div>A / ← — Izquierda</div>
        <div>D / → — Derecha</div>
      </div>
    </>
  );
}

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  return (
    <div className="w-screen h-screen overflow-hidden bg-purple-950">
      {currentScreen === 'splash' && <LoadingScreen />}
      {currentScreen === 'main_menu' && <MainMenu />}
      {currentScreen === 'game' && <GameScene />}
    </div>
  );
}

export default App;
