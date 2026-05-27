/**
 * 🎮 LEGENDS: Shop Store
 * Estado de la tienda (items disponibles, carrito)
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ALL_SHOP_ITEMS, getAvailableItems, getItemsByCategory } from '../data/shopItems';
import type { ShopItem } from '../types/shop';

interface ShopState {
  // Items
  availableItems: ShopItem[];
  selectedCategory: ShopItem['category'] | 'all';

  // Carrito
  cart: Array<{ itemId: string; quantity: number }>;

  // Acciones - Items
  refreshAvailableItems: (currentLevel: number) => void;
  setCategory: (category: ShopItem['category'] | 'all') => void;
  getFilteredItems: () => ShopItem[];

  // Acciones - Carrito
  addToCart: (itemId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useShopStore = create<ShopState>()(
  devtools(
    (set, get) => ({
      availableItems: ALL_SHOP_ITEMS,
      selectedCategory: 'all',
      cart: [],

      refreshAvailableItems: (currentLevel: number) => {
        const items = getAvailableItems(currentLevel);
        set({ availableItems: items });
      },

      setCategory: (category: ShopItem['category'] | 'all') => {
        set({ selectedCategory: category });
      },

      getFilteredItems: () => {
        const { availableItems, selectedCategory } = get();
        if (selectedCategory === 'all') {
          return availableItems;
        }
        return getItemsByCategory(selectedCategory);
      },

      addToCart: (itemId: string, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.itemId === itemId);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.itemId === itemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { itemId, quantity }],
            };
          }
        });
      },

      removeFromCart: (itemId: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.itemId !== itemId),
        }));
      },

      updateCartQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.itemId === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getCartTotal: () => {
        const { cart, availableItems } = get();
        return cart.reduce((total, cartItem) => {
          const item = availableItems.find((i) => i.id === cartItem.itemId);
          return total + (item?.price || 0) * cartItem.quantity;
        }, 0);
      },

      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    { name: 'ShopStore' }
  )
);

// Selectores útiles
export const selectAvailableItems = (state: ShopState) => state.availableItems;
export const selectSelectedCategory = (state: ShopState) => state.selectedCategory;
export const selectCart = (state: ShopState) => state.cart;
export const selectCartTotal = (state: ShopState) => state.getCartTotal();
export const selectCartItemCount = (state: ShopState) => state.getCartItemCount();
