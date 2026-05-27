/**
 * 🎮 LEGENDS: InventoryPanel Component
 * Panel lateral de inventario con tabs para equipamiento, comida y ropa
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InventoryPanelProps } from '@/types/ui';
import { Button, Badge, Icon } from '@/components/atoms';

const InventoryPanel = ({
  isOpen,
  onClose,
  items,
  onUseItem,
  onEquipItem,
  className = '',
}: InventoryPanelProps) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'food' | 'clothing'>('equipment');

  // Filtrar items por categoría
  const filteredItems = items.filter((item) => item.type === activeTab);

  // Calcular bonos activos totales
  const activeEquipment = items.filter((item) => item.equipped && item.type === 'equipment');
  const activeClothing = items.filter((item) => item.equipped && item.type === 'clothing');

  // Obtener icono según tipo de item
  const getItemIcon = (type: string, name: string) => {
    if (type === 'equipment') {
      if (name.toLowerCase().includes('micrófono') || name.toLowerCase().includes('microfono'))
        return '🎤';
      if (name.toLowerCase().includes('audífono') || name.toLowerCase().includes('audifono'))
        return '🎧';
      if (name.toLowerCase().includes('monitor')) return '🖥️';
      if (name.toLowerCase().includes('tarjeta')) return '🎛️';
      if (name.toLowerCase().includes('software')) return '💿';
      if (name.toLowerCase().includes('beat')) return '🎵';
      if (name.toLowerCase().includes('controlador') || name.toLowerCase().includes('midi'))
        return '🎹';
      return '🎵';
    }
    if (type === 'food') {
      if (name.toLowerCase().includes('ramen')) return '🍜';
      if (name.toLowerCase().includes('sandwich')) return '🥪';
      if (name.toLowerCase().includes('comida')) return '🍱';
      if (name.toLowerCase().includes('café') || name.toLowerCase().includes('cafe')) return '☕';
      if (name.toLowerCase().includes('bebida') || name.toLowerCase().includes('energética'))
        return '🥤';
      if (name.toLowerCase().includes('gourmet')) return '🍽️';
      return '🍔';
    }
    if (type === 'clothing') {
      if (name.toLowerCase().includes('camiseta')) return '👕';
      if (name.toLowerCase().includes('zapatilla')) return '👟';
      if (name.toLowerCase().includes('cadena')) return '📿';
      if (name.toLowerCase().includes('outfit')) return '👔';
      if (name.toLowerCase().includes('gafas')) return '🕶️';
      return '👕';
    }
    return '📦';
  };

  // Tabs de categorías
  const tabs = [
    { id: 'equipment' as const, name: 'Equipamiento', icon: '🎵' },
    { id: 'food' as const, name: 'Comida', icon: '🍔' },
    { id: 'clothing' as const, name: 'Ropa', icon: '👕' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel lateral */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 bottom-0 z-70 w-80 backdrop-blur-md bg-black/90 border-r border-purple-500/20 shadow-2xl flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-500/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-100 tracking-tight">🎒 Inventario</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <Icon name="close" size="md" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <div className="mt-1">{tab.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence mode="wait">
                {filteredItems.length > 0 ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`backdrop-blur-md bg-white/5 border rounded-lg p-3 transition-all ${
                          item.equipped
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icono del item */}
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">
                            {getItemIcon(item.type, item.name)}
                          </div>

                          {/* Información */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-sm font-bold text-gray-100 truncate">
                                {item.name}
                              </h3>
                              {item.equipped && <Badge variant="purple">Equipado</Badge>}
                            </div>

                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>

                            {/* Cantidad (solo para comida) */}
                            {item.type === 'food' && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-gray-400">Cantidad:</span>
                                <span className="text-xs font-bold text-purple-400 tabular-nums">
                                  {item.quantity}
                                </span>
                              </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-2">
                              {item.type === 'food' ? (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onUseItem?.(item.id)}
                                  disabled={item.quantity === 0}
                                  className="flex-1"
                                >
                                  <Icon name="check" size="xs" />
                                  Usar
                                </Button>
                              ) : (
                                <Button
                                  variant={item.equipped ? 'ghost' : 'primary'}
                                  size="sm"
                                  onClick={() => onEquipItem?.(item.id)}
                                  className="flex-1"
                                >
                                  {item.equipped ? (
                                    <>
                                      <Icon name="close" size="xs" />
                                      Desequipar
                                    </>
                                  ) : (
                                    <>
                                      <Icon name="check" size="xs" />
                                      Equipar
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-sm text-gray-400">No tienes items en esta categoría</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Visita la tienda para comprar {activeTab === 'equipment' && 'equipamiento'}
                      {activeTab === 'food' && 'comida'}
                      {activeTab === 'clothing' && 'ropa'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer con bonos activos */}
            {(activeEquipment.length > 0 || activeClothing.length > 0) && (
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-t border-purple-500/20 p-4">
                <h3 className="text-xs font-bold text-purple-400 mb-2">✨ Bonos Activos</h3>
                <div className="space-y-1">
                  {activeEquipment.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">🎵 Equipamiento:</span>
                      <span className="text-green-500 font-bold">
                        {activeEquipment.length} item{activeEquipment.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {activeClothing.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">👕 Ropa:</span>
                      <span className="text-green-500 font-bold">
                        {activeClothing.length} item{activeClothing.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InventoryPanel;
