/**
 * 🎮 LEGENDS: Score Board
 * Muestra el puntaje y estadísticas en tiempo real durante el minijuego
 */

import { motion } from 'framer-motion';

interface ScoreBoardProps {
  score: number;
  perfectHits: number;
  goodHits: number;
  okHits: number;
  misses: number;
}

export function ScoreBoard({ score, perfectHits, goodHits, okHits, misses }: ScoreBoardProps) {
  const totalHits = perfectHits + goodHits + okHits + misses;
  const accuracy = totalHits > 0 ? Math.round(((perfectHits + goodHits + okHits) / totalHits) * 100) : 100;

  return (
    <div className="flex items-center gap-6">
      {/* Estadísticas de hits */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-yellow-300 font-bold">{perfectHits}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 font-bold">{goodHits}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-blue-300 font-bold">{okHits}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-red-300 font-bold">{misses}</span>
        </div>
      </div>

      {/* Accuracy */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-800/40 border border-purple-600/30">
        <span className="text-xs text-purple-400">Precisión</span>
        <span className={`text-sm font-black ${
          accuracy >= 90 ? 'text-yellow-300' :
          accuracy >= 70 ? 'text-green-300' :
          accuracy >= 50 ? 'text-blue-300' :
          'text-red-300'
        }`}>
          {accuracy}%
        </span>
      </div>

      {/* Score */}
      <motion.div
        key={score}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700/40 to-cyan-700/20 border border-purple-500/30"
      >
        <span className="text-xs text-purple-400 font-medium">Score</span>
        <span className="text-xl font-black text-white tabular-nums">
          {score.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}
