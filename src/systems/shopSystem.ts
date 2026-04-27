/**
 * 🎮 LEGENDS: Shop System
 * Sistema de tienda (compra de items y aplicación de efectos)
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useShopStore } from '../store/shopStore';
import { useUIStore } from '../store/uiStore';
import { EconomySystem } from './economySystem';
import { getItemById, canAffordItem, isItemUnlocked } from '../data/shopItems';
import type { ShopItem } from '../types/shop';

export class ShopSystem {
  /**
   * Compra un item
   */
  static purchaseItem(itemId: string, quantity: number = 1): boolean {
    const item = getItemById(itemId);
    if (!item) {
      console.error('[Shop] Item not found:', itemId);
      return false;
    }

    const { money } = usePlayerStore.getState();
    const { currentLevel } = useGameStore.getState();

    // Verificar nivel requerido
    if (!isItemUnlocked(itemId, currentLevel)) {
      useUIStore.getState().addNotification(
        'error',
        `❌ Este item requiere nivel ${item.levelRequired}.`
      );
      return false;
    }

    // Verificar stock
    if (item.maxStock) {
      const currentQuantity = usePlayerStore.getState().getItemQuantity(itemId);
      if (currentQuantity + quantity > item.maxStock) {
        useUIStore.getState().addNotification(
          'error',
          `❌ Stock máximo alcanzado (${item.maxStock}).`
        );
        return false;
      }
    }

    const totalCost = item.price * quantity;

    // Verificar dinero
    if (!canAffordItem(itemId, money)) {
      useUIStore.getState().addNotification(
        'error',
        `❌ No tienes suficiente dinero. Necesitas $${totalCost}.`
      );
      return false;
    }

    // Procesar compra
    const success = EconomySystem.purchase(totalCost, `Compra: ${item.name}`);
    if (!success) return false;

    // Agregar item al inventario
    usePlayerStore.getState().addItem(itemId, quantity);

    // Aplicar efecto del item
    this.applyItemEffect(item);

    // Equipar automáticamente si es equipamiento
    if (item.category === 'equipment' && item.effect.permanent) {
      usePlayerStore.getState().equipItem(itemId);
    }

    useUIStore.getState().addNotification(
      'success',
      `✅ Compraste: ${item.name} x${quantity}`
    );

    console.log('[Shop] Purchased:', item.name, 'x', quantity, 'for', totalCost);

    return true;
  }

  /**
   * Aplica el efecto de un item
   */
  private static applyItemEffect(item: ShopItem): void {
    const { effect } = item;

    switch (effect.type) {
      case 'energy':
        if (!effect.permanent && typeof effect.value === 'number') {
          // Consumible - aplicar inmediatamente
          usePlayerStore.getState().addEnergy(effect.value);
          useUIStore.getState().addNotification(
            'success',
            `⚡ +${effect.value} energía`
          );
        }
        break;

      case 'hunger':
        if (!effect.permanent && typeof effect.value === 'number') {
          // Consumible - aplicar inmediatamente
          usePlayerStore.getState().addHunger(effect.value);
          useUIStore.getState().addNotification(
            'success',
            `🍽️ +${effect.value} hambre`
          );
        }
        break;

      case 'reputation':
        if (effect.permanent) {
          // Permanente - se aplica automáticamente al calcular reputación
          useUIStore.getState().addNotification(
            'info',
            `⭐ +${effect.value}% reputación permanente`
          );
        }
        break;

      case 'quality_bonus':
        // Permanente - se aplica al grabar canciones
        useUIStore.getState().addNotification(
          'info',
          `🎵 +${effect.value}% calidad de grabación`
        );
        break;

      case 'unlock':
        // Desbloquea algo (como beats premium)
        if (item.id === 'production_software') {
          useGameStore.getState().unlockFeature('production_software');
          useUIStore.getState().addNotification(
            'success',
            '🎹 Software de producción desbloqueado'
          );
        }
        break;

      case 'cosmetic':
        // Solo estético
        useUIStore.getState().addNotification(
          'info',
          '✨ Item cosmético aplicado'
        );
        break;
    }
  }

  /**
   * Usa un item consumible del inventario
   */
  static useItem(itemId: string): boolean {
    const item = getItemById(itemId);
    if (!item) {
      console.error('[Shop] Item not found:', itemId);
      return false;
    }

    const hasItem = usePlayerStore.getState().hasItem(itemId);
    if (!hasItem) {
      useUIStore.getState().addNotification(
        'error',
        '❌ No tienes este item.'
      );
      return false;
    }

    // Solo items consumibles pueden ser usados
    if (item.effect.permanent) {
      useUIStore.getState().addNotification(
        'error',
        '❌ Este item ya está aplicado.'
      );
      return false;
    }

    // Consumir item
    const success = usePlayerStore.getState().removeItem(itemId, 1);
    if (!success) return false;

    // Aplicar efecto
    this.applyItemEffect(item);

    console.log('[Shop] Used item:', item.name);

    return true;
  }

  /**
   * Compra todos los items del carrito
   */
  static purchaseCart(): boolean {
    const { cart } = useShopStore.getState();
    if (cart.length === 0) {
      useUIStore.getState().addNotification(
        'warning',
        '⚠️ El carrito está vacío.'
      );
      return false;
    }

    const total = useShopStore.getState().getCartTotal();
    const { money } = usePlayerStore.getState();

    if (money < total) {
      useUIStore.getState().addNotification(
        'error',
        `❌ No tienes suficiente dinero. Necesitas $${total}.`
      );
      return false;
    }

    // Comprar cada item del carrito
    let allSuccess = true;
    cart.forEach((cartItem) => {
      const success = this.purchaseItem(cartItem.itemId, cartItem.quantity);
      if (!success) allSuccess = false;
    });

    if (allSuccess) {
      // Limpiar carrito
      useShopStore.getState().clearCart();
      useUIStore.getState().addNotification(
        'success',
        `✅ Compra completada: $${total}`
      );
    }

    return allSuccess;
  }

  /**
   * Refresca items disponibles según el nivel
   */
  static refreshShop(): void {
    const { currentLevel } = useGameStore.getState();
    useShopStore.getState().refreshAvailableItems(currentLevel);
  }

  /**
   * Obtiene items disponibles
   */
  static getAvailableItems(): ShopItem[] {
    return useShopStore.getState().availableItems;
  }

  /**
   * Obtiene items por categoría
   */
  static getItemsByCategory(category: ShopItem['category']): ShopItem[] {
    useShopStore.getState().setCategory(category);
    return useShopStore.getState().getFilteredItems();
  }

  /**
   * Calcula el bonus total de equipamiento
   */
  static calculateEquipmentBonus(): {
    qualityBonus: number;
    reputationBonus: number;
    energyBonus: number;
  } {
    const { inventory } = usePlayerStore.getState();
    const equippedItems = inventory.filter((item) => item.equipped);

    let qualityBonus = 0;
    let reputationBonus = 0;
    let energyBonus = 0;

    equippedItems.forEach((invItem) => {
      const item = getItemById(invItem.itemId);
      if (!item) return;

      switch (item.effect.type) {
        case 'quality_bonus':
          if (typeof item.effect.value === 'number') {
            qualityBonus += item.effect.value;
          }
          break;
        case 'reputation':
          if (item.effect.permanent && typeof item.effect.value === 'number') {
            reputationBonus += item.effect.value;
          }
          break;
        case 'energy':
          if (item.effect.permanent && typeof item.effect.value === 'number') {
            energyBonus += item.effect.value;
          }
          break;
      }
    });

    return { qualityBonus, reputationBonus, energyBonus };
  }

  /**
   * Obtiene estadísticas de compras
   */
  static getShopStats(): {
    totalItemsPurchased: number;
    totalMoneySpent: number;
    equipmentOwned: number;
    foodOwned: number;
    apartmentUpgrades: number;
    clothingOwned: number;
    mostExpensivePurchase: number;
  } {
    const { inventory, totalMoneySpent } = usePlayerStore.getState();

    let equipmentOwned = 0;
    let foodOwned = 0;
    let apartmentUpgrades = 0;
    let clothingOwned = 0;
    let mostExpensivePurchase = 0;

    inventory.forEach((invItem) => {
      const item = getItemById(invItem.itemId);
      if (!item) return;

      switch (item.category) {
        case 'equipment':
          equipmentOwned += invItem.quantity;
          break;
        case 'food':
          foodOwned += invItem.quantity;
          break;
        case 'apartment':
          apartmentUpgrades += invItem.quantity;
          break;
        case 'clothing':
          clothingOwned += invItem.quantity;
          break;
      }

      if (item.price > mostExpensivePurchase) {
        mostExpensivePurchase = item.price;
      }
    });

    return {
      totalItemsPurchased: inventory.reduce((sum, item) => sum + item.quantity, 0),
      totalMoneySpent,
      equipmentOwned,
      foodOwned,
      apartmentUpgrades,
      clothingOwned,
      mostExpensivePurchase,
    };
  }
}
