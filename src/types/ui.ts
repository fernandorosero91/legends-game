/**
 * 🎨 LEGENDS: The Music Career Simulator
 * Types de UI/UX
 * 
 * Tipos para componentes de interfaz de usuario.
 */

// ========================================
// COMPONENTES BÁSICOS
// ========================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export type BadgeVariant = 'gold' | 'green' | 'red' | 'purple' | 'cyan';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export type ProgressBarColor = 'green' | 'orange' | 'purple' | 'red' | 'cyan';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressBarColor;
  label?: string;
  showPercent?: boolean;
  className?: string;
  animated?: boolean;
}

export type IconName = 
  | 'money'
  | 'energy'
  | 'hunger'
  | 'listeners'
  | 'reputation'
  | 'level'
  | 'day'
  | 'night'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'music'
  | 'work'
  | 'shop'
  | 'save'
  | 'load'
  | 'settings'
  | 'close'
  | 'menu'
  | 'pause'
  | 'play'
  | 'check'
  | 'x'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down';

export interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export type TextVariant = 'heading' | 'body' | 'caption' | 'mono';

export interface TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

// ========================================
// MOLÉCULAS
// ========================================

export interface ResourceBarProps {
  icon: IconName;
  label: string;
  value: number;
  max?: number;
  color?: ProgressBarColor;
  showBar?: boolean;
  showPercent?: boolean;
  className?: string;
}

export interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  effect?: {
    type: string;
    value: string | number;
  };
  owned?: boolean;
  canAfford?: boolean;
  levelRequired?: number;
  currentLevel?: number;
  onPurchase?: (id: string) => void;
  className?: string;
}

export interface DialogueBubbleProps {
  character: string;
  text: string;
  portrait?: string;
  onNext?: () => void;
  className?: string;
}

export type NotificationType = 'success' | 'warning' | 'danger' | 'info' | 'error';

export interface NotificationToastProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
  className?: string;
}

export interface StatRowProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: IconName;
  className?: string;
}

// ========================================
// ORGANISMOS
// ========================================

export interface TopBarProps {
  currentDay: number;
  maxDays?: number;
  currentLevel: number;
  levelName: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  className?: string;
}

export interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onUseItem?: (itemId: string) => void;
  onEquipItem?: (itemId: string) => void;
  className?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  equipped?: boolean;
  type: 'equipment' | 'food' | 'clothing';
  icon?: string;
}

export interface ShopGridProps {
  items: ItemCardProps[];
  category?: string;
  onCategoryChange?: (category: string) => void;
  className?: string;
}

export interface JobSelectorProps {
  jobs: JobOption[];
  onSelectJob: (jobId: string) => void;
  currentJob?: string | null;
  className?: string;
}

export interface JobOption {
  id: string;
  name: string;
  description: string;
  pay: number;
  energyCost: number;
  turnsCost: number;
  location: string;
  levelRequired: number;
  available: boolean;
}

// ========================================
// PANTALLAS
// ========================================

export interface HUDProps {
  money: number;
  energy: number;
  hunger: number;
  listeners: number;
  reputation?: number;
  showReputation?: boolean;
  className?: string;
}

export interface MainMenuProps {
  onNewGame: () => void;
  onContinue: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
  onCredits: () => void;
  hasSavedGames?: boolean;
}

export interface LoadingScreenProps {
  progress: number;
  message?: string;
}

export interface PauseMenuProps {
  isOpen: boolean;
  onContinue: () => void;
  onSave: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
  isSaving?: boolean;
}

export interface GameOverScreenProps {
  reason: string;
  stats: GameStats;
  onRetry: () => void;
  onMainMenu: () => void;
}

export interface VictoryScreenProps {
  stats: GameStats;
  onSaveToLeaderboard: () => void;
  onMainMenu: () => void;
  isSaving?: boolean;
}

export interface GameStats {
  finalListeners: number;
  totalSongs: number;
  totalMoney: number;
  finalReputation: number;
  daysPlayed: number;
  jobsCompleted: number;
  itemsPurchased: number;
  collaborations: number;
}

export interface LeaderboardScreenProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  onBack: () => void;
  filter?: 'all' | 'winners' | 'week';
  onFilterChange?: (filter: 'all' | 'winners' | 'week') => void;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  finalListeners: number;
  finalDay: number;
  totalSongs: number;
  won: boolean;
  completedAt: string;
  rank?: number;
}

export interface SaveLoadScreenProps {
  saves: SaveSlot[];
  onLoadSave: (saveId: string) => void;
  onDeleteSave: (saveId: string) => void;
  onNewGame: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface SaveSlot {
  id: string;
  slotName: string;
  gameState: {
    currentDay: number;
    currentLevel: number;
    timeOfDay: string;
  };
  playerState: {
    money: number;
    monthlyListeners: number;
  };
  updatedAt: string;
}

export interface ShopScreenProps {
  items: ItemCardProps[];
  currentMoney: number;
  currentLevel: number;
  onPurchase: (itemId: string) => void;
  onBack: () => void;
  isOpen: boolean;
}

export interface JobScreenProps {
  jobs: JobOption[];
  currentJob: string | null;
  onStartJob: (jobId: string) => void;
  onCompleteJob: () => void;
  onBack: () => void;
  isWorking: boolean;
  progress?: number;
}

export interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  songs: SongStat[];
  jobHistory: JobHistoryStat[];
  levelProgress: LevelProgressStat;
  globalStats: GlobalStats;
}

export interface SongStat {
  title: string;
  quality: string;
  listeners: number;
  dayRecorded: number;
}

export interface JobHistoryStat {
  jobName: string;
  moneyEarned: number;
  dayCompleted: number;
}

export interface LevelProgressStat {
  currentLevel: number;
  currentListeners: number;
  goalListeners: number;
  progressPercentage: number;
}

export interface GlobalStats {
  daysPlayed: number;
  totalSongs: number;
  totalMoney: number;
  totalJobsCompleted: number;
  totalItemsPurchased: number;
}

// ========================================
// NOTIFICACIONES
// ========================================

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface NotificationQueueProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// ========================================
// DIÁLOGOS
// ========================================

export interface DialogBoxProps {
  isOpen: boolean;
  character: string;
  text: string;
  portrait?: string;
  options?: DialogOption[];
  onNext?: () => void;
  onSelectOption?: (optionId: string) => void;
  showContinueIndicator?: boolean;
}

export interface DialogOption {
  id: string;
  text: string;
  disabled?: boolean;
}

// ========================================
// UTILIDADES
// ========================================

export type Screen = 
  | 'loading'
  | 'main-menu'
  | 'save-load'
  | 'playing'
  | 'pause'
  | 'shop'
  | 'job'
  | 'game-over'
  | 'victory'
  | 'leaderboard'
  | 'settings'
  | 'credits';

export interface ScreenTransition {
  from: Screen;
  to: Screen;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale';
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
