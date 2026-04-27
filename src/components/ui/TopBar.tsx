/**
 * 🎮 LEGENDS: TopBar Component
 * Barra superior del HUD con información del día, nivel y turno
 */

import { motion } from 'framer-motion';
import type { TopBarProps } from '@/types/ui';
import { Badge, Icon } from '@/components/atoms';

const TopBar = ({
  currentDay,
  maxDays = 45,
  currentLevel,
  levelName,
  timeOfDay,
  className = '',
}: TopBarProps) => {
  // Obtener emoji y nombre del turno
  const getTurnInfo = (turn: typeof timeOfDay) => {
    const turnInfo = {
      morning: { emoji: '🌅', name: 'Mañana', icon: 'morning' as const },
      afternoon: { emoji: '☀️', name: 'Tarde', icon: 'afternoon' as const },
      evening: { emoji: '🌆', name: 'Atardecer', icon: 'evening' as const },
      night: { emoji: '🌙', name: 'Noche', icon: 'night' as const },
    };
    return turnInfo[turn];
  };

  const turnInfo = getTurnInfo(timeOfDay);

  // Calcular progreso del día
  const dayProgress = (currentDay / maxDays) * 100;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm border-b border-purple-500/20 ${className}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Izquierda: Día y Nivel */}
          <div className="flex items-center gap-4">
            {/* Día */}
            <div className="flex items-center gap-2">
              <Icon name="day" size="sm" className="text-gold-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Día</span>
                <span className="text-sm font-bold text-gray-100 tabular-nums">
                  {currentDay} / {maxDays}
                </span>
              </div>
            </div>

            {/* Separador */}
            <div className="h-8 w-px bg-purple-500/30" />

            {/* Nivel */}
            <div className="flex items-center gap-2">
              <Icon name="level" size="sm" className="text-purple-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Nivel {currentLevel}</span>
                <span className="text-sm font-semibold text-purple-400 truncate max-w-[150px] md:max-w-none">
                  {levelName}
                </span>
              </div>
            </div>
          </div>

          {/* Centro: Turno (solo visible en desktop) */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-xl">{turnInfo.emoji}</span>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Turno</span>
              <span className="text-sm font-semibold text-gray-100">
                {turnInfo.name}
              </span>
            </div>
          </div>

          {/* Derecha: Badge de nivel (mobile) */}
          <div className="md:hidden">
            <Badge variant="gold">
              Nivel {currentLevel}
            </Badge>
          </div>

          {/* Derecha: Turno (mobile - solo emoji) */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-2xl">{turnInfo.emoji}</span>
          </div>
        </div>

        {/* Barra de progreso del día */}
        <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-gold-500"
            initial={{ width: 0 }}
            animate={{ width: `${dayProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;
