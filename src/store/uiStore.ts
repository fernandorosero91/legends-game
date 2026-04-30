/**
 * 🎮 LEGENDS: UI Store
 * Estado de la interfaz (pantallas, diálogos, notificaciones)
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Dialogue } from '../types/dialogue';

export type Screen =
  | 'loading'
  | 'main_menu'
  | 'auth'
  | 'character_select'
  | 'save_load'
  | 'game'
  | 'pause'
  | 'shop'
  | 'job_select'
  | 'stats'
  | 'leaderboard'
  | 'game_over'
  | 'victory'
  | 'settings'
  | 'credits';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  // Pantallas
  currentScreen: Screen;
  previousScreen: Screen | null;

  // Menús y paneles
  menuOpen: boolean;
  inventoryOpen: boolean;
  statsOpen: boolean;
  shopOpen: boolean;

  // Diálogos
  dialogueActive: boolean;
  currentDialogue: Dialogue | null;
  dialogueQueue: Dialogue[];

  // Notificaciones
  notifications: Notification[];

  // Loading
  isLoading: boolean;
  loadingMessage: string;

  // Acciones - Pantallas
  setScreen: (screen: Screen) => void;
  goBack: () => void;

  // Acciones - Menús
  toggleMenu: () => void;
  toggleInventory: () => void;
  toggleStats: () => void;
  openShop: () => void;
  closeShop: () => void;
  closeAllPanels: () => void;

  // Acciones - Diálogos
  showDialogue: (dialogue: Dialogue) => void;
  queueDialogue: (dialogue: Dialogue) => void;
  nextDialogue: () => void;
  closeDialogue: () => void;
  clearDialogueQueue: () => void;

  // Acciones - Notificaciones
  addNotification: (
    type: Notification['type'],
    message: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Acciones - Loading
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentScreen: 'loading',
      previousScreen: null,
      menuOpen: false,
      inventoryOpen: false,
      statsOpen: false,
      shopOpen: false,
      dialogueActive: false,
      currentDialogue: null,
      dialogueQueue: [],
      notifications: [],
      isLoading: true,
      loadingMessage: 'Cargando Purple City...',

      // Pantallas
      setScreen: (screen: Screen) => {
        set((state) => ({
          currentScreen: screen,
          previousScreen: state.currentScreen,
          menuOpen: false,
          inventoryOpen: false,
          statsOpen: false,
          shopOpen: false,
        }));
      },

      goBack: () => {
        const { previousScreen } = get();
        if (previousScreen) {
          set({
            currentScreen: previousScreen,
            previousScreen: null,
          });
        }
      },

      // Menús
      toggleMenu: () => {
        set((state) => ({ menuOpen: !state.menuOpen }));
      },

      toggleInventory: () => {
        set((state) => ({ inventoryOpen: !state.inventoryOpen }));
      },

      toggleStats: () => {
        set((state) => ({ statsOpen: !state.statsOpen }));
      },

      openShop: () => {
        set({ shopOpen: true });
      },

      closeShop: () => {
        set({ shopOpen: false });
      },

      closeAllPanels: () => {
        set({
          menuOpen: false,
          inventoryOpen: false,
          statsOpen: false,
          shopOpen: false,
        });
      },

      // Diálogos
      showDialogue: (dialogue: Dialogue) => {
        set({
          dialogueActive: true,
          currentDialogue: dialogue,
        });
      },

      queueDialogue: (dialogue: Dialogue) => {
        set((state) => ({
          dialogueQueue: [...state.dialogueQueue, dialogue],
        }));
      },

      nextDialogue: () => {
        const { dialogueQueue, currentDialogue } = get();

        // Si hay un diálogo actual con nextDialogueId, buscarlo
        if (currentDialogue?.nextDialogueId) {
          // Aquí se debería buscar el siguiente diálogo por ID
          // Por ahora, avanzamos a la cola
        }

        // Si hay diálogos en cola, mostrar el siguiente
        if (dialogueQueue.length > 0) {
          const [nextDialogue, ...remainingQueue] = dialogueQueue;
          set({
            currentDialogue: nextDialogue,
            dialogueQueue: remainingQueue,
          });
        } else {
          // No hay más diálogos, cerrar
          get().closeDialogue();
        }
      },

      closeDialogue: () => {
        set({
          dialogueActive: false,
          currentDialogue: null,
        });
      },

      clearDialogueQueue: () => {
        set({ dialogueQueue: [] });
      },

      // Notificaciones
      addNotification: (
        type: Notification['type'],
        message: string,
        duration: number = 3000
      ) => {
        const notification: Notification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          type,
          message,
          duration,
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));

        // Auto-remover después de la duración
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Loading
      setLoading: (isLoading: boolean, message: string = 'Cargando...') => {
        set({ isLoading, loadingMessage: message });
      },
    }),
    { name: 'UIStore' }
  )
);

// Selectores útiles
export const selectCurrentScreen = (state: UIState) => state.currentScreen;
export const selectDialogueActive = (state: UIState) => state.dialogueActive;
export const selectCurrentDialogue = (state: UIState) => state.currentDialogue;
export const selectNotifications = (state: UIState) => state.notifications;
export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectShopOpen = (state: UIState) => state.shopOpen;
export const selectInventoryOpen = (state: UIState) => state.inventoryOpen;
