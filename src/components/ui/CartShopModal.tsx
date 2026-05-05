/**
 * 🎮 LEGENDS: CartShopModal Component
 * Botón flotante de carrito + Modal de tienda de accesorios
 * Permite comprar accesorios de piezas (micrófonos, audífonos, etc.) con la plata del juego
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { ShopSystem } from '@/systems/shopSystem';
import { EQUIPMENT_ITEMS } from '@/data/shopItems';
import type { ShopItem } from '@/types/shop';

// ===== ACCESORIOS DISPONIBLES EN EL CARRITO =====
// Solo mostramos equipo de piezas musicales (micrófonos, audífonos, etc.)
const ACCESSORY_ITEMS: ShopItem[] = EQUIPMENT_ITEMS;

// Iconos emoji para cada accesorio
const ITEM_EMOJIS: Record<string, string> = {
  usb_mic: '🎙️',
  basic_mic: '🎙️',
  pro_mic: '🎤',
  studio_headphones: '🎧',
  studio_monitor: '🔊',
  audio_interface: '🎛️',
  production_software: '💻',
  beat_pack: '🥁',
  midi_controller: '🎹',
};

interface CartItemUI {
  item: ShopItem;
  quantity: number;
}

interface CartShopModalProps {
  className?: string;
}

export function CartShopModal({ className = '' }: CartShopModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItemUI[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'cart'>('shop');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const { money, inventory } = usePlayerStore();
  const { currentLevel } = useGameStore();

  // Items disponibles según el nivel actual
  const availableItems = ACCESSORY_ITEMS.filter(
    (item) => item.levelRequired <= currentLevel
  );

  // Items bloqueados (nivel requerido mayor al actual)
  const lockedItems = ACCESSORY_ITEMS.filter(
    (item) => item.levelRequired > currentLevel
  );

  // Verificar si el jugador ya tiene el item
  const isOwned = (itemId: string) =>
    inventory.some((i) => i.itemId === itemId);

  // Total del carrito
  const cartTotal = cart.reduce((total, { item, quantity }) => {
    return total + item.price * quantity;
  }, 0);

  const cartItemCount = cart.reduce((count, { quantity }) => count + quantity, 0);

  // Añadir al carrito
  const addToCart = (item: ShopItem) => {
    if (isOwned(item.id)) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    setActiveTab('cart');
  };

  // Remover del carrito
  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  // Actualizar cantidad
  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  // Procesar compra
  const handleCheckout = () => {
    if (cartTotal > money) {
      useUIStore
        .getState()
        .addNotification('error', `❌ No tienes suficiente dinero. Necesitas $${cartTotal.toLocaleString()}.`);
      return;
    }

    let allSuccess = true;
    const purchasedNames: string[] = [];

    for (const { item, quantity } of cart) {
      for (let i = 0; i < quantity; i++) {
        const success = ShopSystem.purchaseItem(item.id);
        if (success) {
          purchasedNames.push(item.name);
        } else {
          allSuccess = false;
        }
      }
    }

    if (purchasedNames.length > 0) {
      setCart([]);
      setPurchaseSuccess(`¡Compra exitosa! 🎉 ${purchasedNames.join(', ')}`);
      setTimeout(() => {
        setPurchaseSuccess(null);
        setIsOpen(false);
      }, 2500);
    }
  };

  return (
    <>
      {/* ===== BOTÓN FLOTANTE DEL CARRITO ===== */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className={`fixed z-40 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all cursor-pointer bottom-28 right-8 bg-gradient-to-br from-purple-500 to-indigo-700 border-2 border-purple-300 hover:shadow-purple-500/60 ${className}`}
        title="Tienda de Accesorios"
        aria-label="Abrir tienda de accesorios"
      >
        {/* Ícono carrito */}
        <span className="text-2xl select-none">🛒</span>
        {/* Badge con cantidad de items en carrito */}
        <AnimatePresence>
          {cartItemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-black shadow"
            >
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ===== MODAL DE LA TIENDA ===== */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel principal */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-gradient-to-b from-gray-950 to-gray-900 border-l border-purple-500/40 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/60 to-indigo-900/60">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <h2 className="text-lg font-extrabold text-white tracking-wide">
                      Purple Sound Shop
                    </h2>
                    <p className="text-xs text-purple-400">Accesorios & Equipo Musical</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Dinero disponible */}
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5">
                    <span className="text-yellow-400 text-sm">💰</span>
                    <span className="text-yellow-300 font-bold text-sm">
                      ${money.toLocaleString()}
                    </span>
                  </div>
                  {/* Cerrar */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center text-lg transition-all"
                    aria-label="Cerrar tienda"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-purple-500/20">
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                    activeTab === 'shop'
                      ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/10'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  🎙️ Accesorios ({availableItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('cart')}
                  className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors relative ${
                    activeTab === 'cart'
                      ? 'text-yellow-300 border-b-2 border-yellow-400 bg-yellow-500/10'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Carrito
                  {cartItemCount > 0 && (
                    <span className="ml-1.5 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* ===== TAB: TIENDA ===== */}
                {activeTab === 'shop' && (
                  <div className="p-4 space-y-3">
                    {/* Nivel actual info */}
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                      <span className="text-purple-400 text-sm">⭐</span>
                      <p className="text-xs text-purple-300">
                        Nivel {currentLevel} — {availableItems.length} accesorios disponibles
                      </p>
                    </div>

                    {/* Items disponibles */}
                    {availableItems.map((item) => {
                      const owned = isOwned(item.id);
                      const canAfford = money >= item.price;
                      const inCart = cart.some((c) => c.item.id === item.id);
                      const emoji = ITEM_EMOJIS[item.id] || '🎵';

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`relative rounded-xl border p-4 transition-all ${
                            owned
                              ? 'border-green-500/30 bg-green-500/5'
                              : inCart
                              ? 'border-yellow-500/50 bg-yellow-500/10'
                              : canAfford
                              ? 'border-purple-500/30 bg-purple-500/5 hover:border-purple-400/60 hover:bg-purple-500/10'
                              : 'border-gray-700/40 bg-gray-900/40 opacity-70'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Ícono */}
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                owned
                                  ? 'bg-green-500/20'
                                  : inCart
                                  ? 'bg-yellow-500/20'
                                  : 'bg-purple-500/20'
                              }`}
                            >
                              {emoji}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-sm font-bold text-white leading-tight">
                                  {item.name}
                                </h3>
                                <span
                                  className={`text-sm font-bold shrink-0 ${
                                    owned
                                      ? 'text-green-400'
                                      : canAfford
                                      ? 'text-yellow-300'
                                      : 'text-red-400'
                                  }`}
                                >
                                  {owned ? '✅ Comprado' : `$${item.price.toLocaleString()}`}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                              {/* Efecto */}
                              {item.effect.type === 'quality_bonus' && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                                    +{item.effect.value}% calidad de grabación
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Botón añadir al carrito */}
                          {!owned && (
                            <button
                              onClick={() => addToCart(item)}
                              disabled={!canAfford || inCart}
                              className={`mt-3 w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                                inCart
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 cursor-default'
                                  : canAfford
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30 active:scale-95'
                                  : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                              }`}
                            >
                              {inCart
                                ? '✓ En el carrito'
                                : canAfford
                                ? '+ Añadir al carrito'
                                : `Necesitas $${(item.price - money).toLocaleString()} más`}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Items bloqueados */}
                    {lockedItems.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="flex-1 h-px bg-gray-700/60" />
                          <span className="text-xs text-gray-500 uppercase tracking-widest">
                            Bloqueados
                          </span>
                          <div className="flex-1 h-px bg-gray-700/60" />
                        </div>
                        {lockedItems.map((item) => {
                          const emoji = ITEM_EMOJIS[item.id] || '🎵';
                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-gray-700/30 bg-gray-900/30 p-4 opacity-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center text-2xl grayscale">
                                  {emoji}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-500">
                                      {item.name}
                                    </h3>
                                    <span className="text-xs text-gray-600">
                                      🔒 Nivel {item.levelRequired}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* ===== TAB: CARRITO ===== */}
                {activeTab === 'cart' && (
                  <div className="p-4">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <span className="text-6xl opacity-30">🛒</span>
                        <p className="text-gray-500 text-sm text-center">
                          Tu carrito está vacío.
                          <br />
                          ¡Ve a la tienda y añade accesorios!
                        </p>
                        <button
                          onClick={() => setActiveTab('shop')}
                          className="mt-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                          Ver Accesorios
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map(({ item, quantity }) => {
                          const emoji = ITEM_EMOJIS[item.id] || '🎵';
                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-3 bg-gray-800/60 rounded-xl p-3 border border-gray-700/40"
                            >
                              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl shrink-0">
                                {emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-yellow-300 font-bold">
                                  ${(item.price * quantity).toLocaleString()}
                                </p>
                              </div>
                              {/* Controles cantidad */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center justify-center transition-colors"
                                >
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-white">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-7 h-7 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </div>
                              {/* Eliminar */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full bg-red-900/40 hover:bg-red-700/60 text-red-400 text-xs flex items-center justify-center transition-colors"
                                aria-label="Eliminar del carrito"
                              >
                                ✕
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ===== FOOTER: RESUMEN Y COMPRA ===== */}
              {activeTab === 'cart' && cart.length > 0 && (
                <div className="border-t border-purple-500/20 bg-gray-950/80 p-4 space-y-3">
                  {/* Resumen */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-bold">
                        ${cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tu saldo</span>
                      <span
                        className={`font-bold ${
                          money >= cartTotal ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        ${money.toLocaleString()}
                      </span>
                    </div>
                    {money < cartTotal && (
                      <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                        <span className="text-red-400 text-xs">⚠️</span>
                        <p className="text-xs text-red-400">
                          Necesitas ${(cartTotal - money).toLocaleString()} más. Pasa niveles para ganar plata.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botón de compra */}
                  <motion.button
                    whileHover={{ scale: money >= cartTotal ? 1.02 : 1 }}
                    whileTap={{ scale: money >= cartTotal ? 0.97 : 1 }}
                    onClick={handleCheckout}
                    disabled={money < cartTotal}
                    className={`w-full py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all shadow-lg ${
                      money >= cartTotal
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30 border border-purple-400/30'
                        : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    {money >= cartTotal
                      ? `💳 Comprar por $${cartTotal.toLocaleString()}`
                      : '🔒 Saldo insuficiente'}
                  </motion.button>
                </div>
              )}

              {/* ===== PANTALLA DE ÉXITO ===== */}
              <AnimatePresence>
                {purchaseSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/80 backdrop-blur flex flex-col items-center justify-center gap-5 p-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="text-7xl"
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-2xl font-extrabold text-white text-center">
                      ¡Compra Exitosa!
                    </h3>
                    <p className="text-purple-300 text-center text-sm leading-relaxed">
                      {purchaseSuccess}
                    </p>
                    <div className="w-full bg-gray-800 rounded-full h-1 mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 2.5, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default CartShopModal;
