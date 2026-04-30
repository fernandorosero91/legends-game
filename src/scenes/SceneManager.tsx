import { lazy, Suspense } from 'react';
import { useGameStore, type GameScene } from '../store/gameStore';

// Lazy load all scenes — only the active scene is loaded into memory
const scenes: Record<GameScene, React.LazyExoticComponent<() => JSX.Element>> = {
  apartment: lazy(() => import('./ApartmentScene').then(m => ({ default: m.ApartmentScene }))),
  cafe: lazy(() => import('./CafeScene').then(m => ({ default: m.CafeScene }))),
  store: lazy(() => import('./StoreScene').then(m => ({ default: m.StoreScene }))),
  shop: lazy(() => import('./ShopScene').then(m => ({ default: m.ShopScene }))),
  restaurant: lazy(() => import('./RestaurantScene').then(m => ({ default: m.RestaurantScene }))),
  delivery: lazy(() => import('./DeliveryScene').then(m => ({ default: m.DeliveryScene }))),
  bar: lazy(() => import('./BarScene').then(m => ({ default: m.BarScene }))),
  academy: lazy(() => import('./AcademyScene').then(m => ({ default: m.AcademyScene }))),
  city: lazy(() => import('./CityScene').then(m => ({ default: m.CityScene }))),
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
