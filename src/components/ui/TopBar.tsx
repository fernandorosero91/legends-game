/**
 * 🎮 LEGENDS: TopBar Component
 * Barra superior del HUD con información del día, nivel y turno
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';

interface TopBarProps {
  currentDay: number;
  maxDays?: number;
  currentLevel: number;
  levelName: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  className?: string;
}

export function TopBar({
  currentDay,
  maxDays = 45,
  currentLevel,
  levelName,
  timeOfDay,
  className = '',
}: TopBarProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Obtener información del turno
  const getTurnInfo = (turn: typeof timeOfDay) => {
    const turnInfo = {
      morning: { 
        emoji: '🌅', 
        name: 'Mañana', 
        description: 'Perfecto para planificar el día',
        color: 'yellow',
        bgColor: 'from-yellow-500/20 to-orange-500/20'
      },
      afternoon: { 
        emoji: '☀️', 
        name: 'Tarde', 
        description: 'Momento ideal para trabajar',
        color: 'orange',
        bgColor: 'from-orange-500/20 to-red-500/20'
      },
      evening: { 
        emoji: '🌆', 
        name: 'Atardecer', 
        description: '¡El de la renta viene!',
        color: 'purple',
        bgColor: 'from-purple-500/20 to-pink-500/20'
      },
      night: { 
        emoji: '🌙', 
        name: 'Noche', 
        description: 'Hora de descansar',
        color: 'blue',
        bgColor: 'from-blue-500/20 to-purple-500/20'
      },
    };
    return turnInfo[turn];
  };

  const turnInfo = getTurnInfo(timeOfDay);
  const dayProgress = (currentDay / maxDays) * 100;
  const daysRemaining = maxDays - currentDay;

  // Información del nivel
  const getLevelInfo = () => {
    const levelGoals = {
      1: { goal: '500 oyentes', description: 'Aprende las mecánicas básicas' },
      2: { goal: '1,000 oyentes', description: 'Equilibra trabajo y música' },
      3: { goal: '3,000 oyentes', description: 'Supera la prueba del fuego' },
      4: { goal: '5,000 oyentes', description: 'Mantén el momentum' },
      5: { goal: '7,000 oyentes', description: 'La recta final' },
      6: { goal: '10,000 oyentes', description: '¡Conviértete en leyenda!' },
    };
    return levelGoals[currentLevel as keyof typeof levelGoals] || { goal: 'Meta desconocida', description: '' };
  };

  const levelInfo = getLevelInfo();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-sm border-b border-purple-500/20 ${className}`}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Izquierda: Información del Día - clickeable para ir a niveles */}
          <motion.button
            className="flex items-center gap-3 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-600/30 cursor-pointer hover:border-cyan-400/30 hover:from-gray-900/80 hover:to-gray-800/80 transition-colors"
            onMouseEnter={() => setHoveredSection('day')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => useUIStore.getState().setScreen('level_select')}
            title="Seleccionar nivel"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                <span className="text-sm">📅</span>
              </div>
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase">
                  DÍA {currentDay} | NIVEL {currentLevel}
                </div>
                <div className="text-xs text-white font-medium">
                  {hoveredSection === 'day' ? (
                    <span className="text-cyan-300">
                      Clic para cambiar nivel
                    </span>
                  ) : (
                    <span>
                      "{levelName}"
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>

          {/* Centro: Información del Turno - más compacta */}
          <motion.div
            className={`flex items-center gap-2 bg-gradient-to-r ${turnInfo.bgColor} rounded-lg px-3 py-1.5 border border-${turnInfo.color}-500/30`}
            onMouseEnter={() => setHoveredSection('turn')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`w-6 h-6 bg-${turnInfo.color}-500/20 rounded flex items-center justify-center`}>
              <span className="text-sm">{turnInfo.emoji}</span>
            </div>
            <div>
              <div className={`text-xs text-${turnInfo.color}-400 font-bold uppercase`}>
                {turnInfo.name.toUpperCase()}
              </div>
              <div className="text-xs text-white font-medium">
                {hoveredSection === 'turn' ? turnInfo.description : 'Turno actual'}
              </div>
            </div>
          </motion.div>

          {/* Derecha: Progreso - más compacto */}
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-600/30"
            onMouseEnter={() => setHoveredSection('status')}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <div className="text-xs text-gray-400 font-bold uppercase">
                {hoveredSection === 'status' ? 'PURPLE CITY 2015' : 'PROGRESO'}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hoveredSection === 'status' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">●</span>
                    <span className="text-green-400">ONLINE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">{Math.round(dayProgress)}%</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-cyan-400">{daysRemaining}d</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barra de progreso compacta */}
        <div className="mt-2 space-y-1">
          <div className="w-full h-1 bg-gray-800/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${dayProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TopBar;