/**
 * 🎮 LEGENDS: Save Store
 * Estado de guardado/carga de partidas
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SaveSlot {
  slotId: number;
  slotName: string;
  createdAt: number;
  updatedAt: number;
  currentDay: number;
  currentLevel: number;
  monthlyListeners: number;
  money: number;
  totalSongsRecorded: number;
}

interface SaveState {
  // Slots de guardado
  saveSlots: SaveSlot[];
  currentSlot: number | null;
  isSaving: boolean;
  isLoading: boolean;
  lastSaveTime: number | null;
  autoSaveEnabled: boolean;

  // Acciones
  loadSaveSlots: () => Promise<void>;
  createSaveSlot: (slotName: string) => Promise<SaveSlot>;
  loadSaveSlot: (slotId: number) => Promise<void>;
  deleteSaveSlot: (slotId: number) => Promise<void>;
  saveGame: (slotId?: number) => Promise<void>;
  autoSave: () => Promise<void>;
  setAutoSaveEnabled: (enabled: boolean) => void;
  getSaveSlot: (slotId: number) => SaveSlot | undefined;
}

export const useSaveStore = create<SaveState>()(
  devtools(
    (set, get) => ({
      saveSlots: [],
      currentSlot: null,
      isSaving: false,
      isLoading: false,
      lastSaveTime: null,
      autoSaveEnabled: true,

      loadSaveSlots: async () => {
        set({ isLoading: true });
        try {
          // TODO: Implementar carga desde InsForge
          // Por ahora, cargar desde localStorage
          const savedSlots = localStorage.getItem('legends-save-slots');
          if (savedSlots) {
            set({ saveSlots: JSON.parse(savedSlots) });
          }
        } catch (error) {
          console.error('Error loading save slots:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      createSaveSlot: async (slotName: string) => {
        const newSlot: SaveSlot = {
          slotId: Date.now(),
          slotName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          currentDay: 1,
          currentLevel: 1,
          monthlyListeners: 0,
          money: 5000,
          totalSongsRecorded: 0,
        };

        set((state) => ({
          saveSlots: [...state.saveSlots, newSlot],
          currentSlot: newSlot.slotId,
        }));

        // Guardar en localStorage
        const { saveSlots } = get();
        localStorage.setItem('legends-save-slots', JSON.stringify(saveSlots));

        return newSlot;
      },

      loadSaveSlot: async (slotId: number) => {
        set({ isLoading: true });
        try {
          // TODO: Implementar carga desde InsForge
          const slot = get().getSaveSlot(slotId);
          if (slot) {
            set({ currentSlot: slotId });
            // Aquí se cargaría el estado completo del juego
          }
        } catch (error) {
          console.error('Error loading save slot:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      deleteSaveSlot: async (slotId: number) => {
        set((state) => ({
          saveSlots: state.saveSlots.filter((slot) => slot.slotId !== slotId),
          currentSlot: state.currentSlot === slotId ? null : state.currentSlot,
        }));

        // Actualizar localStorage
        const { saveSlots } = get();
        localStorage.setItem('legends-save-slots', JSON.stringify(saveSlots));
      },

      saveGame: async (slotId?: number) => {
        const targetSlot = slotId || get().currentSlot;
        if (!targetSlot) return;

        set({ isSaving: true });
        try {
          // TODO: Implementar guardado en InsForge
          // Por ahora, actualizar el slot en memoria
          set((state) => ({
            saveSlots: state.saveSlots.map((slot) =>
              slot.slotId === targetSlot
                ? { ...slot, updatedAt: Date.now() }
                : slot
            ),
            lastSaveTime: Date.now(),
          }));

          // Guardar en localStorage
          const { saveSlots } = get();
          localStorage.setItem('legends-save-slots', JSON.stringify(saveSlots));
        } catch (error) {
          console.error('Error saving game:', error);
        } finally {
          set({ isSaving: false });
        }
      },

      autoSave: async () => {
        const { autoSaveEnabled, currentSlot } = get();
        if (autoSaveEnabled && currentSlot) {
          await get().saveGame(currentSlot);
        }
      },

      setAutoSaveEnabled: (enabled: boolean) => {
        set({ autoSaveEnabled: enabled });
      },

      getSaveSlot: (slotId: number) => {
        return get().saveSlots.find((slot) => slot.slotId === slotId);
      },
    }),
    { name: 'SaveStore' }
  )
);

// Selectores útiles
export const selectSaveSlots = (state: SaveState) => state.saveSlots;
export const selectCurrentSlot = (state: SaveState) => state.currentSlot;
export const selectIsSaving = (state: SaveState) => state.isSaving;
export const selectIsLoading = (state: SaveState) => state.isLoading;
export const selectLastSaveTime = (state: SaveState) => state.lastSaveTime;
export const selectAutoSaveEnabled = (state: SaveState) => state.autoSaveEnabled;
