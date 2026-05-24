/**
 * LEGENDS: GameSideButtons — Botones laterales (Metas + Ajustes)
 * Columna vertical alineada a la derecha, mismo estilo que el botón del mapa.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalsPanel } from './GoalsPanel';
import { SettingsProfilePanel } from './SettingsProfilePanel';

export function GameSideButtons() {
  const [showGoals, setShowGoals] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Columna de botones — arriba del carrito y mapa */}
      <div className="fixed bottom-[9.5rem] right-8 z-40 flex flex-col gap-3 items-center">
        {/* Botón Ajustes */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-2xl border-2 border-gray-400 flex items-center justify-center text-lg hover:shadow-gray-500/50 transition-all"
          title="Ajustes / Perfil"
        >
          ⚙️
        </motion.button>

        {/* Botón Metas */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowGoals(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 text-white shadow-2xl border-2 border-yellow-400 flex items-center justify-center text-lg hover:shadow-yellow-500/50 transition-all"
          title="Metas"
        >
          🏆
        </motion.button>
      </div>

      {/* Paneles modales */}
      <AnimatePresence>
        {showGoals && <GoalsPanel isOpen={showGoals} onClose={() => setShowGoals(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && <SettingsProfilePanel isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </>
  );
}
