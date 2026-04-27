/**
 * 🎮 LEGENDS: HUD Component
 * HUD principal del juego con recursos del jugador
 */

import { motion } from 'framer-motion';
import type { HUDProps } from '@/types/ui';
import ResourceBar from '@/components/molecules/ResourceBar';

const HUD = ({
  money,
  energy,
  hunger,
  listeners,
  reputation,
  showReputation = false,
  className = '',
}: HUDProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-20 right-4 z-40 space-y-2 ${className}`}
    >
      {/* Dinero */}
      <ResourceBar
        icon="money"
        label="Dinero"
        value={money}
        showBar={false}
        color="green"
      />

      {/* Energía */}
      <ResourceBar
        icon="energy"
        label="Energía"
        value={energy}
        max={100}
        color="green"
        showBar
        showPercent
      />

      {/* Hambre */}
      <ResourceBar
        icon="hunger"
        label="Hambre"
        value={hunger}
        max={100}
        color="orange"
        showBar
        showPercent
      />

      {/* Oyentes */}
      <ResourceBar
        icon="listeners"
        label="Oyentes"
        value={listeners}
        showBar={false}
        color="cyan"
      />

      {/* Reputación (solo visible desde Nivel 3) */}
      {showReputation && reputation !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResourceBar
            icon="reputation"
            label="Reputación"
            value={reputation}
            max={100}
            color="purple"
            showBar
            showPercent
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default HUD;
