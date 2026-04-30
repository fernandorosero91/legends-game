/**
 * 🎮 LEGENDS: ShopGrid Component
 * Grid de items de tienda con filtros por categoría
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import type { ShopGridProps } from '@/types/ui';
import ItemCard from '@/components/molecules/ItemCard';
import { Button } from '@/components/atoms';

const ShopGrid = memo(({ items, category, onCategoryChange, className = '' }: ShopGridProps) => {
  const [activeCategory, setActiveCategory] = useState(category || 'all');

  // Categorías disponibles
  const categories = [
    { id: 'all', name: 'Todo', icon: '🛍️' },
    { id: 'equipment', name: 'Equipamiento', icon: '🎵' },
    { id: 'food', name: 'Comida', icon: '🍔' },
    { id: 'apartment', name: 'Apartamento', icon: '🏠' },
    { id: 'clothing', name: 'Ropa', icon: '👕' },
  ];

  // Filtrar items por categoría
  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((item) => {
          // Asumiendo que ItemCardProps tiene una propiedad category implícita
          // o podemos inferirla del effect.type
          return true; // Por ahora mostrar todos
        });

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className={className}>
      {/* Tabs de categorías */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleCategoryChange(cat.id)}
            className="whitespace-nowrap"
          >
            <span className="text-base">{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Grid de items */}
      {filteredItems.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <ItemCard {...item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No hay items disponibles en esta categoría</p>
        </div>
      )}
    </div>
  );
});

ShopGrid.displayName = 'ShopGrid';

export default ShopGrid;
