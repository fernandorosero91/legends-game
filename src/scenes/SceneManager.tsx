import { lazy, Suspense } from 'react';
import { useGameStore, type GameScene } from '../store/gameStore';

// Lazy load only the active scenes
const scenes: Record<GameScene, React.LazyExoticComponent<() => JSX.Element>> = {
  apartment: lazy(() => import('./ApartmentScene').then(m => ({ default: m.ApartmentScene }))),
  store: lazy(() => import('./StoreScene').then(m => ({ default: m.StoreScene }))),
  restaurant: lazy(() => import('./RestaurantScene').then(m => ({ default: m.RestaurantScene }))),
};

// Minimal 3D fallback while scene chunk loads
function SceneFallback() {
  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a0a2e" />
    </mesh>
  );
}

export function SceneManager() {
  const currentScene = useGameStore((s) => s.currentScene);
  const Scene = scenes[currentScene] || scenes.apartment;

  return (
    <Suspense fallback={<SceneFallback />}>
      <Scene />
    </Suspense>
  );
}
