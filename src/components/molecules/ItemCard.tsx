/**
 * 🎮 LEGENDS: ItemCard Component
 * Card de item para la tienda con información y botón de compra
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { ItemCardProps } from '@/types/ui';
import { Button, Badge, Icon } from '@/components/atoms';

const ItemCard = memo(({
  id,
  name,
  description,
  price,
  icon,
  effect,
  owned = false,
  canAfford = true,
  levelRequired = 1,
  currentLevel = 1,
  onPurchase,
  className = '',
}: ItemCardProps) => {
  const isLocked = currentLevel < levelRequired;
  const isDisabled = isLocked || !canAfford || owned;

  // Obtener icono y color del efecto
  const getEffectDisplay = () => {
    if (!effect) return null;

    const displays: Record<string, { icon: string; color: string; text: string }> = {
      quality_bonus: {
        icon: '🎵',
        color: 'text-purple-400',
        text: `+${effect.value}% calidad`,
      },
      energy: {
        icon: '⚡',
        color: 'text-green-500',
        text: `+${effect.value} energía`,
      },
      hunger: {
        icon: '🍔',
        color: 'text-orange-500',
        text: `+${effect.value} hambre`,
      },
      reputation: {
        icon: '⭐',
        color: 'text-purple-400',
        text: `+${effect.value}% reputación`,
      },
      unlock: {
        icon: '🔓',
        color: 'text-cyan-400',
        text: 'Desbloquea contenido',
      },
      cosmetic: {
        icon: '✨',
        color: 'text-gold-500',
        text: 'Cosmético',
      },
    };

    return displays[effect.type] || null;
  };

  const effectDisplay = getEffectDisplay();

  return (
    <motion.div
      whileHover={!isDisabled ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.2 }}
      className={`backdrop-blur-md bg-white/5 border rounded-xl p-4 ${
        isLocked
          ? 'border-gray-700/30 opacity-50'
          : owned
          ? 'border-green-500/30'
          : canAfford
          ? 'border-purple-500/20 hover:border-purple-500/40'
          : 'border-red-500/30'
      } transition-all ${className}`}
    >
      {/* Header con badges */}
      <div className="flex items-start justify-between mb-3">
        {/* Icono del item */}
        <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
          {icon || '📦'}
        </div>

        {/* Badges de estado */}
        <div className="flex flex-col gap-1 items-end">
          {owned && <Badge variant="green">Comprado</Badge>}
          {isLocked && <Badge variant="red">Nivel {levelRequired}</Badge>}
          {!canAfford && !isLocked && !owned && <Badge variant="red">Sin dinero</Badge>}
        </div>
      </div>

      {/* Nombre del item */}
      <h3 className="text-base font-bold text-gray-100 mb-2 truncate">{name}</h3>

      {/* Descripción */}
      <p className="text-xs text-gray-400 mb-3 line-clamp-2 min-h-[2rem]">{description}</p>

      {/* Efecto */}
      {effectDisplay && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded bg-black/20">
          <span className="text-sm">{effectDisplay.icon}</span>
          <span className={`text-xs font-semibold ${effectDisplay.color}`}>
            {effectDisplay.text}
          </span>
        </div>
      )}

      {/* Footer: Precio y botón */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-purple-500/10">
        {/* Precio */}
        <div className="flex items-center gap-1">
          <Icon name="money" size="sm" className="text-gold-500" />
          <span className="text-sm font-bold text-gold-500 tabular-nums">
            ${price.toLocaleString()}
          </span>
        </div>

        {/* Botón de compra */}
        <Button
          variant={owned ? 'ghost' : 'primary'}
          size="sm"
          onClick={() => onPurchase?.(id)}
          disabled={isDisabled}
          className="min-w-[80px]"
        >
          {owned ? (
            <>
              <Icon name="check" size="sm" />
              Comprado
            </>
          ) : isLocked ? (
            <>
              <Icon name="close" size="sm" />
              Bloqueado
            </>
          ) : (
            'Comprar'
          )}
        </Button>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders innecesarios
  return (
    prevProps.id === nextProps.id &&
    prevProps.owned === nextProps.owned &&
    prevProps.canAfford === nextProps.canAfford &&
    prevProps.currentLevel === nextProps.currentLevel
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;
