/**
 * 🎮 LEGENDS: Accessibility Utilities
 * Utilidades para mejorar la accesibilidad del juego
 */

/**
 * Maneja la navegación por teclado en listas
 * @param event - Evento de teclado
 * @param currentIndex - Índice actual
 * @param maxIndex - Índice máximo
 * @param onSelect - Callback cuando se selecciona un item
 * @returns Nuevo índice
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  currentIndex: number,
  maxIndex: number,
  onSelect?: (index: number) => void
): number => {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = maxIndex;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (onSelect) {
        onSelect(currentIndex);
      }
      break;
    case 'Escape':
      event.preventDefault();
      // El componente padre debe manejar el cierre
      break;
  }

  return newIndex;
};

/**
 * Maneja el focus trap en modales
 * @param containerRef - Referencia al contenedor del modal
 */
export const setupFocusTrap = (containerRef: HTMLElement | null) => {
  if (!containerRef) return () => {};

  const focusableElements = containerRef.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  containerRef.addEventListener('keydown', handleTabKey);

  // Focus el primer elemento
  firstElement?.focus();

  return () => {
    containerRef.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Genera un ID único para aria-describedby
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Formatea números para lectores de pantalla
 * @param value - Valor numérico
 * @param type - Tipo de valor (money, listeners, etc.)
 */
export const formatForScreenReader = (value: number, type?: string): string => {
  switch (type) {
    case 'money':
      return `${value} dólares`;
    case 'listeners':
      return `${value} oyentes`;
    case 'energy':
      return `${value} por ciento de energía`;
    case 'hunger':
      return `${value} por ciento de hambre`;
    case 'reputation':
      return `${value} puntos de reputación`;
    default:
      return value.toString();
  }
};

/**
 * Verifica si el usuario prefiere movimiento reducido
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Obtiene la duración de animación basada en preferencias del usuario
 * @param defaultDuration - Duración por defecto en ms
 */
export const getAnimationDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

/**
 * Anuncia un mensaje a lectores de pantalla
 * @param message - Mensaje a anunciar
 * @param priority - Prioridad del anuncio ('polite' | 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Clase CSS para elementos solo visibles para lectores de pantalla
 */
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Hook personalizado para manejar el focus visible
 */
export const useFocusVisible = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  };

  const handleMouseDown = () => {
    document.body.classList.remove('keyboard-navigation');
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }

  return () => {};
};

/**
 * Constantes de ARIA labels para el juego
 */
export const ARIA_LABELS = {
  // Navegación
  mainMenu: 'Menú principal',
  pauseMenu: 'Menú de pausa',
  closeButton: 'Cerrar',
  backButton: 'Volver',
  
  // Recursos
  money: 'Dinero disponible',
  energy: 'Nivel de energía',
  hunger: 'Nivel de hambre',
  listeners: 'Oyentes mensuales',
  reputation: 'Reputación',
  
  // Acciones
  buyItem: 'Comprar item',
  startJob: 'Iniciar trabajo',
  recordSong: 'Grabar canción',
  sleep: 'Dormir',
  eat: 'Comer',
  
  // Pantallas
  shop: 'Tienda',
  jobs: 'Trabajos disponibles',
  inventory: 'Inventario',
  stats: 'Estadísticas',
  leaderboard: 'Tabla de líderes',
  
  // Estados
  loading: 'Cargando',
  saving: 'Guardando partida',
  paused: 'Juego pausado',
  gameOver: 'Fin del juego',
  victory: 'Victoria',
};

/**
 * Roles ARIA para componentes del juego
 */
export const ARIA_ROLES = {
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  menu: 'menu',
  menuitem: 'menuitem',
  button: 'button',
  tab: 'tab',
  tabpanel: 'tabpanel',
  tablist: 'tablist',
  progressbar: 'progressbar',
  status: 'status',
  alert: 'alert',
};
