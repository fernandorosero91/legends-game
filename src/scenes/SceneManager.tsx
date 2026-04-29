import { useGameStore } from '../store/gameStore';
import { ApartmentScene } from './ApartmentScene';
import { CafeScene } from './CafeScene';
import { StoreScene } from './StoreScene';
import { ShopScene } from './ShopScene';
import { RestaurantScene } from './RestaurantScene';
import { DeliveryScene } from './DeliveryScene';
import { BarScene } from './BarScene';
import { AcademyScene } from './AcademyScene';
import { CityScene } from './CityScene';

export function SceneManager() {
  const currentScene = useGameStore(state => state.currentScene);

  switch (currentScene) {
    case 'apartment':
      return <ApartmentScene />;
    case 'cafe':
      return <CafeScene />;
    case 'store':
      return <StoreScene />;
    case 'shop':
      return <ShopScene />;
    case 'restaurant':
      return <RestaurantScene />;
    case 'delivery':
      return <DeliveryScene />;
    case 'bar':
      return <BarScene />;
    case 'academy':
      return <AcademyScene />;
    case 'city':
      return <CityScene />;
    default:
      return <ApartmentScene />;
  }
}