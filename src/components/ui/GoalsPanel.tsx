/**
 * LEGENDS: GoalsPanel — Panel de metas activas
 * Muestra metas con progreso. Las completadas deben reclamarse manualmente.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { GOALS_POOL, type GoalDefinition } from '../../data/goals';

const STORAGE_KEY = 'legends-completed-goals';
const CLAIMED_KEY = 'legends-claimed-goals';

function getCompletedGoals(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveCompletedGoals(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
function getClaimedGoals(): string[] {
  try { return JSON.parse(localStorage.getItem(CLAIMED_KEY) || '[]'); }
  catch { return []; }
}
function saveClaimedGoals(ids: string[]) {
  localStorage.setItem(CLAIMED_KEY, JSON.stringify(ids));
}

function getActiveGoals(claimed: string[]): GoalDefinition[] {
  const available = GOALS_POOL.filter(g => !claimed.includes(g.id));
  return available.slice(0, 3);
}

function getStatValue(stat: GoalDefinition['stat']): number {
  const player = usePlayerStore.getState();
  const game = useGameStore.getState();
  switch (stat) {
    case 'money': return player.money;
    case 'listeners': return player.monthlyListeners;
    case 'days': return game.currentDay;
    case 'level': return game.currentLevel;
    case 'songs': return player.songs?.length || 0;
    case 'energy': return player.energy;
    case 'jobs_completed': return 0;
    default: return 0;
  }
}

interface GoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalsPanel({ isOpen, onClose }: GoalsPanelProps) {
  // claimed = cobradas (recompensa recibida)
  const [claimed, setClaimed] = useState<string[]>(getClaimedGoals);
  // completed = cumplidas (objetivo alcanzado, pero no necesariamente cobradas)
  const [completed, setCompleted] = useState<string[]>(getCompletedGoals);
  const [activeGoals, setActiveGoals] = useState<GoalDefinition[]>([]);
  const [justClaimed, setJustClaimed] = useState<GoalDefinition | null>(null);

  const addMoney = usePlayerStore(s => s.addMoney);
  const addEnergy = usePlayerStore(s => s.addEnergy);
  const addListeners = usePlayerStore(s => s.addListeners);
  const addNotification = useUIStore(s => s.addNotification);

  // Cargar metas activas (las que no han sido cobradas)
  useEffect(() => {
    setActiveGoals(getActiveGoals(claimed));
  }, [claimed]);

  // Detectar metas cumplidas (pero no cobrarlas automáticamente)
  const checkGoals = useCallback(() => {
    let changed = false;
    for (const goal of activeGoals) {
      const current = getStatValue(goal.stat);
      if (current >= goal.target && !completed.includes(goal.id)) {
        completed.push(goal.id);
        changed = true;
      }
    }
    if (changed) {
      setCompleted([...completed]);
      saveCompletedGoals(completed);
    }
  }, [activeGoals, completed]);

  useEffect(() => {
    if (!isOpen) return;
    checkGoals();
  }, [isOpen, checkGoals]);

  // Reclamar recompensa manualmente
  const handleClaim = (goal: GoalDefinition) => {
    switch (goal.reward.type) {
      case 'money': addMoney(goal.reward.value); break;
      case 'energy': addEnergy(goal.reward.value); break;
      case 'listeners': addListeners(goal.reward.value); break;
      case 'badge': break;
    }
    const newClaimed = [...claimed, goal.id];
    setClaimed(newClaimed);
    saveClaimedGoals(newClaimed);
    setJustClaimed(goal);
    addNotification('success', `🏆 ¡Recompensa reclamada! ${goal.reward.label}`);
    setTimeout(() => setJustClaimed(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏆 Metas
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Claimed notification */}
        <AnimatePresence>
          {justClaimed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 mb-4"
            >
              <p className="text-green-300 text-sm font-bold">🎉 ¡Recompensa reclamada!</p>
              <p className="text-green-200 text-xs">{justClaimed.name} — {justClaimed.reward.label}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {/* Metas activas */}
          {activeGoals.map((goal, i) => {
            const current = getStatValue(goal.stat);
            const progress = Math.min(current / goal.target, 1);
            const isReady = progress >= 1 && !claimed.includes(goal.id);
            const isDone = claimed.includes(goal.id);

            return (
              <motion.div
                key={goal.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-lg p-4 border transition-colors ${
                  isReady
                    ? 'bg-yellow-900/30 border-yellow-500/50 ring-1 ring-yellow-400/30'
                    : isDone
                      ? 'bg-green-900/30 border-green-500/50'
                      : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {isReady && <span className="text-yellow-400 text-base animate-pulse">🎁</span>}
                    {isDone && <span className="text-green-400 text-base">✅</span>}
                    <div>
                      <h3 className={`font-bold text-sm ${
                        isReady ? 'text-yellow-200' : isDone ? 'text-green-300' : 'text-white'
                      }`}>
                        {goal.name}
                      </h3>
                      <p className="text-gray-400 text-xs">{goal.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isReady
                      ? 'bg-yellow-900/50 text-yellow-300'
                      : isDone
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-purple-900/50 text-purple-300'
                  }`}>
                    {goal.reward.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                  <motion.div
                    className={`h-full rounded-full ${
                      isReady
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                        : isDone
                          ? 'bg-gradient-to-r from-green-600 to-green-400'
                          : 'bg-gradient-to-r from-purple-600 to-purple-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>

                {/* Status / Claim button */}
                {isReady ? (
                  <button
                    onClick={() => handleClaim(goal)}
                    className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-xs transition-all active:scale-95 shadow-lg shadow-yellow-500/20"
                  >
                    🎁 Reclamar Recompensa
                  </button>
                ) : (
                  <p className={`text-xs text-right ${isDone ? 'text-green-500' : 'text-gray-500'}`}>
                    {isDone
                      ? '¡Cobrada!'
                      : `${Math.min(current, goal.target).toLocaleString()} / ${goal.target.toLocaleString()}`
                    }
                  </p>
                )}
              </motion.div>
            );
          })}

          {/* Metas ya cobradas (en verdecito) */}
          {claimed.length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider">✅ Cobradas</p>
              </div>
              {GOALS_POOL.filter(g => claimed.includes(g.id)).map((goal, i) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-lg p-3 border bg-green-900/20 border-green-500/30"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <h3 className="font-bold text-sm text-green-300">{goal.name}</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-300">
                      {goal.reward.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {/* Metas pendientes (bloqueadas) */}
          {(() => {
            const activeIds = activeGoals.map(g => g.id);
            const pending = GOALS_POOL.filter(g => !claimed.includes(g.id) && !activeIds.includes(g.id));
            if (pending.length === 0) return null;
            return (
              <>
                <div className="pt-2 pb-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">🔒 Pendientes</p>
                </div>
                {pending.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="rounded-lg p-3 border bg-gray-800/40 border-gray-700/50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">🔒</span>
                        <h3 className="font-bold text-sm text-gray-500">{goal.name}</h3>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-600">
                        {goal.reward.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1 ml-7">{goal.description}</p>
                  </motion.div>
                ))}
              </>
            );
          })()}

          {activeGoals.length === 0 && claimed.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay metas disponibles</p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Metas cobradas: {claimed.length} / {GOALS_POOL.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
