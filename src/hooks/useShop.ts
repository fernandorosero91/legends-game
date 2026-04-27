/**
 * 🎮 LEGENDS: Shop Hook
 * Hook para la tienda
 * Autor: Felipe (Systems Developer)
 */

import { useCallback, useEffect } from 'react';
import { useShopStore } from '../store/shopStore';
import { useGameStore } from '../store/gameStore';
import { ShopSystem } from '../systems/shopSystem';
import type { ShopItem } from '../types/shop';

export const useShop = () => {
  const {
    availableItems,
    selectedCategory,
    cart,
  } = useShopStore();

  const { currentLevel } = useGameStore();

  // Refrescar tienda cuando cambia el nivel
  useEffect(() => {
    ShopSystem.refreshShop();
  }, [currentLevel]);

  // Comprar item
  const purchaseItem = useCallback((itemId: string, quantity: number = 1) => {
    return ShopSystem.purchaseItem(itemId, quantity);
  }, []);

  // Usar item consumible
  const useItem = useCallback((itemId: string) => {
    return ShopSystem.useItem(itemId);
  }, []);

  // Comprar carrito
  const purchaseCart = useCallback(() => {
    return ShopSystem.purchaseCart();
  }, []);

  // Cambiar categoría
  const setCategory = useCallback((category: ShopItem['category'] | 'all') => {
    useShopStore.getState().setCategory(category);
  }, []);

  // Agregar al carrito
  const addToCart = useCallback((itemId: string, quantity: number = 1) => {
    useShopStore.getState().addToCart(itemId, quantity);
  }, []);

  // Remover del carrito
  const removeFromCart = useCallback((itemId: string) => {
    useShopStore.getState().removeFromCart(itemId);
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    useShopStore.getState().clearCart();
  }, []);

  // Obtener items filtrados
  const filteredItems = useShopStore.getState().getFilteredItems();

  // Calcular total del carrito
  const cartTotal = useShopStore.getState().getCartTotal();
  const cartItemCount = useShopStore.getState().getCartItemCount();

  // Bonos de equipamiento
  const equipmentBonus = ShopSystem.calculateEquipmentBonus();

  // Stats
  const shopStats = ShopSystem.getShopStats();

  return {
    // Items
    availableItems,
    filteredItems,
    selectedCategory,

    // Carrito
    cart,
    cartTotal,
    cartItemCount,

    // Acciones
    purchaseItem,
    useItem,
    purchaseCart,
    setCategory,
    addToCart,
    removeFromCart,
    clearCart,

    // Stats
    equipmentBonus,
    shopStats,
  };
};
