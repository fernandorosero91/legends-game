/**
 * 🎮 LEGENDS: HUD Component
 * HUD principal del juego con recursos del jugador
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

interface HUDProps {
  money: number;
  energy: number;
  hunger: number;
  listeners: number;
  reputation?: number;
  showReputation?: boolean;
  className?: string;
}

export function HUD({ 
  money, 
  energy, 
  hunger, 
  listeners, 
  reputation = 0, 
  showReputation = false,
  className = ''
}: HUDProps) {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const getEnergyStatus = () => {
    if (energy >= 80) return { color: 'green', status: 'Excelente', message: 'Tienes mucha energía para trabajar', icon: '⚡' };
    if (energy >= 60) return { color: 'yellow', status: 'Buena', message: 'Energía suficiente para actividades', icon: '⚡' };
    if (energy >= 40) return { color: 'orange', status: 'Regular', message: 'Considera descansar pronto', icon: '⚠️' };
    if (energy >= 20) return { color: 'red', status: 'Baja', message: '¡Necesitas descansar urgente!', icon: '🔋' };
    return { color: 'red', status: 'Crítica', message: '¡Debes dormir inmediatamente!', icon: '💤' };
  };

  const getHungerStatus = () => {
    if (hunger >= 80) return { color: 'green', status: 'Satisfecho', message: 'No necesitas comer por ahora', icon: '😊' };
    if (hunger >= 60) return { color: 'yellow', status: 'Bien', message: 'Puedes aguantar un poco más', icon: '🙂' };
    if (hunger >= 40) return { color: 'orange', status: 'Hambriento', message: 'Deberías comer algo pronto', icon: '😐' };
    if (hunger >= 20) return { color: 'red', status: 'Muy hambriento', message: '¡Necesitas comer ya!', icon: '😟' };
    return { color: 'red', status: 'Famélico', message: '¡Come inmediatamente o perderás energía!', icon: '😵' };
  };

  const getListenersInfo = () => {
    const dailyIncome = Math.floor(listeners / 10);
    const growth = Math.floor(listeners * 0.05); // Simulamos crecimiento
    return { dailyIncome, growth };
  };

  const getReputationStatus = () => {
    if (reputation >= 90) return { status: 'Leyenda', message: 'Eres una leyenda de Purple City', color: 'purple' };
    if (reputation >= 75) return { status: 'Famoso', message: 'Muy respetado en la escena', color: 'purple' };
    if (reputation >= 50) return { status: 'Conocido', message: 'Conocido en la escena musical', color: 'blue' };
    if (reputation >= 25) return { status: 'Emergente', message: 'Empezando a destacar', color: 'green' };
    return { status: 'Novato', message: 'Artista emergente', color: 'gray' };
  };

  const energyStatus = getEnergyStatus();
  const hungerStatus = getHungerStatus();
  const listenersInfo = getListenersInfo();
  const reputationStatus = getReputationStatus();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`fixed top-20 right-4 z-40 ${showReputation ? 'space-y-1.5' : 'space-y-2'} max-w-[280px] ${className}`}
    >
      {/* Panel de Dinero */}
      <motion.div
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-yellow-500/30 rounded-lg px-3 py-2 shadow-xl"
        onMouseEnter={() => setHoveredStat('money')}
        onMouseLeave={() => setHoveredStat(null)}
        whileHover={{ scale: 1.05, borderColor: '#eab308' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
              <span className="text-sm">💰</span>
            </div>
            <div>
              <div className="text-xs text-yellow-400 font-bold uppercase">DINERO</div>
              <div className="text-sm font-bold text-yellow-300">
                ${money.toLocaleString()}
              </div>
            </div>
          </div>
          {!showReputation && hoveredStat === 'money' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-gray-300 ml-2"
            >
              Renta: $1,000/día
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Panel de Energía */}
      <motion.div
        className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-${energyStatus.color}-500/30 rounded-lg px-3 py-2 shadow-xl`}
        onMouseEnter={() => setHoveredStat('energy')}
        onMouseLeave={() => setHoveredStat(null)}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 bg-${energyStatus.color}-500/20 rounded flex items-center justify-center`}>
              <span className="text-sm">{energyStatus.icon}</span>
            </div>
            <div>
              <div className={`text-xs text-${energyStatus.color}-400 font-bold uppercase`}>
                ENERGÍA
              </div>
              <div className={`text-sm font-bold text-${energyStatus.color}-300`}>{energy}%</div>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
          <motion.div
            className={`bg-gradient-to-r from-${energyStatus.color}-500 to-${energyStatus.color}-400 h-1.5 rounded-full`}
            style={{ width: `${energy}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${energy}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {!showReputation && hoveredStat === 'energy' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs text-${energyStatus.color}-300 mt-1`}
          >
            {energyStatus.message}
          </motion.div>
        )}
      </motion.div>

      {/* Panel de Hambre */}
      <motion.div
        className={`bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-${hungerStatus.color}-500/30 rounded-lg px-3 py-2 shadow-xl`}
        onMouseEnter={() => setHoveredStat('hunger')}
        onMouseLeave={() => setHoveredStat(null)}
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 bg-${hungerStatus.color}-500/20 rounded flex items-center justify-center`}>
              <span className="text-sm">{hungerStatus.icon}</span>
            </div>
            <div>
              <div className={`text-xs text-${hungerStatus.color}-400 font-bold uppercase`}>
                HAMBRE
              </div>
              <div className={`text-sm font-bold text-${hungerStatus.color}-300`}>{hunger}%</div>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
          <motion.div
            className={`bg-gradient-to-r from-${hungerStatus.color}-500 to-${hungerStatus.color}-400 h-1.5 rounded-full`}
            style={{ width: `${hunger}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${hunger}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {!showReputation && hoveredStat === 'hunger' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs text-${hungerStatus.color}-300 mt-1`}
          >
            {hungerStatus.message}
          </motion.div>
        )}
      </motion.div>

      {/* Panel de Oyentes */}
      <motion.div
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-cyan-500/30 rounded-lg px-3 py-2 shadow-xl"
        onMouseEnter={() => setHoveredStat('listeners')}
        onMouseLeave={() => setHoveredStat(null)}
        whileHover={{ scale: 1.05, borderColor: '#06b6d4' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center">
              <span className="text-sm">🎧</span>
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase">OYENTES</div>
              <div className="text-sm font-bold text-cyan-300">
                {listeners.toLocaleString()}
              </div>
            </div>
          </div>
          {!showReputation && hoveredStat === 'listeners' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-gray-300 ml-2"
            >
              +{listenersInfo.growth}/canción
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Panel de Reputación (si está desbloqueada) */}
      {showReputation && (
        <motion.div
          className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-purple-500/30 rounded-lg px-3 py-2 shadow-xl"
          onMouseEnter={() => setHoveredStat('reputation')}
          onMouseLeave={() => setHoveredStat(null)}
          whileHover={{ scale: 1.05, borderColor: '#a855f7' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                <span className="text-sm">⭐</span>
              </div>
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase">
                  REPUTACIÓN
                </div>
                <div className="text-sm font-bold text-purple-300">{reputation}%</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-1.5 rounded-full"
              style={{ width: `${reputation}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${reputation}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          {!showReputation && hoveredStat === 'reputation' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-purple-300 mt-1"
            >
              {reputationStatus.message}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Indicador de estado general - más compacto */}
      <motion.div
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-gray-500/30 rounded-lg px-3 py-2 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <div className="text-xs text-gray-400 font-bold uppercase mb-1">ESTADO</div>
          <div className="flex items-center justify-center gap-2">
            {energy >= 60 && hunger >= 60 ? (
              <>
                <span className="text-green-400 text-sm">●</span>
                <span className="text-xs text-green-400 font-bold">ÓPTIMO</span>
              </>
            ) : energy >= 40 && hunger >= 40 ? (
              <>
                <span className="text-yellow-400 text-sm">●</span>
                <span className="text-xs text-yellow-400 font-bold">ESTABLE</span>
              </>
            ) : (
              <>
                <span className="text-red-400 text-sm">●</span>
                <span className="text-xs text-red-400 font-bold">CRÍTICO</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HUD;
