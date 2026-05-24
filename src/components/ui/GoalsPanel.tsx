/**
 * LEGENDS: GoalsPanel — Panel de metas activas
 * Muestra 3 metas activas con progreso y recompensas.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { GOALS_POOL, type GoalDefinition } from '../../data/goals';

const STORAGE_KEY = 'legends-completed-goals';

function getCompletedGoals(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveCompletedGoals(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getActiveGoals(completed: string[]): GoalDefinition[] {
  const available = GOALS_POOL.filter(g => !completed.includes(g.id));
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
    case 'jobs_completed': return 0; // TODO: track this
    default: return 0;
  }
}

interface GoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalsPanel({ isOpen, onClose }: GoalsPanelProps) {
  const [completed, setCompleted] = useState<string[]>(getCompletedGoals);
  const [activeGoals, setActiveGoals] = useState<GoalDefinition[]>([]);
  const [justCompleted, setJustCompleted] = useState<GoalDefinition | null>(null);

  const addMoney = usePlayerStore(s => s.addMoney);
  const addEnergy = usePlayerStore(s => s.addEnergy);
  const addListeners = usePlayerStore(s => s.addListeners);
  const addNotification = useUIStore(s => s.addNotification);

  // Load active goals
  useEffect(() => {
    setActiveGoals(getActiveGoals(completed));
  }, [completed]);

  // Check goal completion
  const checkGoals = useCallback(() => {
    const newCompleted: string[] = [];

    for (const goal of activeGoals) {
      const current = getStatValue(goal.stat);
      if (current >= goal.target && !completed.includes(goal.id)) {
        newCompleted.push(goal.id);
      }
    }

    if (newCompleted.length > 0) {
      const allCompleted = [...completed, ...newCompleted];
      setCompleted(allCompleted);
      saveCompletedGoals(allCompleted);

      // Give reward for first completed
      const goalDef = GOALS_POOL.find(g => g.id === newCompleted[0]);
      if (goalDef) {
        setJustCompleted(goalDef);
        giveReward(goalDef);
        setTimeout(() => setJustCompleted(null), 3000);
      }
    }
  }, [activeGoals, completed]);

  // Check periodically
  useEffect(() => {
    if (!isOpen) return;
    checkGoals();
  }, [isOpen, checkGoals]);

  const giveReward = (goal: GoalDefinition) => {
    switch (goal.reward.type) {
      case 'money':
        addMoney(goal.reward.value);
        break;
      case 'energy':
        addEnergy(goal.reward.value);
        break;
      case 'listeners':
        addListeners(goal.reward.value);
        break;
      case 'badge':
        // TODO: badge system
        break;
    }
    addNotification('success', `🏆 ¡Meta completada! ${goal.reward.label}`);
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

        {/* Completed notification */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 mb-4"
            >
              <p className="text-green-300 text-sm font-bold">🎉 ¡Meta completada!</p>
              <p className="text-green-200 text-xs">{justCompleted.name} — {justCompleted.reward.label}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Goals */}
        <div className="space-y-3">
          {activeGoals.map((goal, i) => {
            const current = getStatValue(goal.stat);
            const progress = Math.min(current / goal.target, 1);

            return (
              <motion.div
                key={goal.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-bold text-sm">{goal.name}</h3>
                    <p className="text-gray-400 text-xs">{goal.description}</p>
                  </div>
                  <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
                    {goal.reward.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {Math.min(current, goal.target).toLocaleString()} / {goal.target.toLocaleString()}
                </p>
              </motion.div>
            );
          })}

          {activeGoals.length === 0 && (
            <p className="text-gray-500 text-center py-4">🎉 ¡Completaste todas las metas!</p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Metas completadas: {completed.length} / {GOALS_POOL.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
