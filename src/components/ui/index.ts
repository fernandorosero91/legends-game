/**
 * 🎮 LEGENDS: UI Components Export
 * Exportación centralizada de componentes de UI
 * 
 * NOTA: Los componentes lazy-loaded en App.tsx NO se exportan aquí
 * para permitir code splitting efectivo.
 */

// Componentes siempre cargados
export { default as LoadingScreen } from './LoadingScreen';
export { default as MainMenu } from './MainMenu';
export { default as TopBar } from './TopBar';
export { default as HUD } from './HUD';
export { default as CameraHUD } from './CameraHUD';
export { default as PauseMenu } from './PauseMenu';
export { default as StatsPanel } from './StatsPanel';
export { default as Notification } from './Notification';
export { default as DialogBox } from './DialogBox';

// Los siguientes componentes se cargan dinámicamente en App.tsx:
// - SaveLoadScreen
// - ShopScreen
// - JobScreen
// - GameOverScreen
// - VictoryScreen
// - LeaderboardScreen
