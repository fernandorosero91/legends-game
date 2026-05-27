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
  monthlyListeners?: number;
  className?: string;
}

export function TopBar({
  currentDay,
  maxDays = 45,
  currentLevel,
  levelName,
  timeOfDay,
  monthlyListeners = 0,
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

  // Progreso dentro del nivel actual (basado en oyentes)
  const levelListenerGoals: Record<number, { min: number; max: number }> = {
    1: { min: 0, max: 500 },
    2: { min: 500, max: 1000 },
    3: { min: 1000, max: 3000 },
    4: { min: 3000, max: 5000 },
    5: { min: 5000, max: 7000 },
    6: { min: 7000, max: 10000 },
  };

  const currentGoal = levelListenerGoals[currentLevel] || { min: 0, max: 10000 };
  const levelProgress = Math.min(
    ((monthlyListeners - currentGoal.min) / (currentGoal.max - currentGoal.min)) * 100,
    100
  );

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
          {/* Izquierda: Nivel circular con progreso + Día */}
          <div className="flex items-center gap-3">
            {/* Círculo del nivel con barra de progreso circular */}
            <motion.div
              className="relative w-11 h-11 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              title={`Nivel ${currentLevel}: ${levelInfo.goal}`}
            >
              {/* Anillo de progreso SVG */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                {/* Fondo del anillo */}
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="3" />
                {/* Progreso del anillo */}
                <circle
                  cx="22" cy="22" r="18" fill="none"
                  stroke="url(#levelGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - levelProgress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
                <defs>
                  <linearGradient id="levelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Número del nivel */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-400/50 flex items-center justify-center">
                <span className="text-white font-black text-sm">{currentLevel}</span>
              </div>
            </motion.div>

            {/* Info del día */}
            <motion.button
              className="flex items-center gap-2 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-lg px-3 py-1.5 border border-gray-600/30 cursor-pointer hover:border-cyan-400/30 transition-colors"
              onMouseEnter={() => setHoveredSection('day')}
              onMouseLeave={() => setHoveredSection(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => useUIStore.getState().setScreen('level_select')}
              title="Seleccionar nivel"
            >
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase">
                  DÍA {currentDay} | NIVEL {currentLevel}
                </div>
                <div className="text-xs text-white font-medium">
                  {hoveredSection === 'day' ? (
                    <span className="text-cyan-300">Clic para cambiar nivel</span>
                  ) : (
                    <span>"{levelName}"</span>
                  )}
                </div>
              </div>
            </motion.button>
          </div>

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