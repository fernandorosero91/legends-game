/**
 * 🎮 LEGENDS: ShopScreen Component
 * Pantalla completa de la tienda Purple Sound Shop
 */

import { motion } from 'framer-motion';
import type { ShopScreenProps } from '@/types/ui';
import { Button, Icon, Text } from '@/components/atoms';
import ShopGrid from '@/components/organisms/ShopGrid';

const ShopScreen = ({
  items,
  currentMoney,
  currentLevel,
  onPurchase,
  onBack,
  isOpen,
}: ShopScreenProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 bg-gradient-to-b from-purple-900 to-black overflow-auto"
    >
      <div className="min-h-screen px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto mb-8"
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between mb-6">
            {/* Botón volver */}
            <Button variant="ghost" onClick={onBack} size="sm">
              <Icon name="arrow-left" size="sm" />
              Volver
            </Button>

            {/* Dinero actual */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-gold-500/20">
              <Icon name="money" size="sm" className="text-gold-500" />
              <Text variant="mono" className="text-gold-500 font-bold">
                ${currentMoney.toLocaleString()}
              </Text>
            </div>
          </div>

          {/* Título de la tienda */}
          <div className="text-center mb-2">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2"
            >
              Purple Sound Shop
            </motion.h1>
            <Text variant="body" className="text-purple-400">
              Todo lo que necesitas para tu carrera musical
            </Text>
          </div>

          {/* Información del nivel */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Icon name="level" size="sm" className="text-purple-400" />
              <Text variant="caption" className="text-purple-400">
                Nivel {currentLevel}
              </Text>
            </div>
          </div>
        </motion.div>

        {/* Grid de items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <ShopGrid
            items={items.map((item) => ({
              ...item,
              currentLevel,
              canAfford: currentMoney >= item.price,
              onPurchase,
            }))}
          />
        </motion.div>

        {/* Footer con tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-7xl mx-auto mt-12 mb-8"
        >
          <div className="backdrop-blur-md bg-purple-500/5 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Icon name="music" size="md" className="text-purple-400 flex-shrink-0" />
              <div>
                <Text variant="heading" className="text-sm mb-2">
                  💡 Consejo del vendedor
                </Text>
                <Text variant="caption" className="text-gray-400">
                  El equipamiento musical mejora la calidad de tus grabaciones. La comida restaura
                  energía y hambre. Las mejoras del apartamento son permanentes. ¡Invierte
                  sabiamente!
                </Text>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ShopScreen;
