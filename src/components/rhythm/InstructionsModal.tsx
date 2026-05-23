/**
 * 🎮 LEGENDS: Instructions Modal
 * Paleta: purple-navy + cyan acentos
 */

import { motion } from 'framer-motion';
import type { MiniGameType } from './RhythmGame';

interface InstructionsModalProps {
  gameType: MiniGameType;
  beatName: string;
  onStart: () => void;
  onBack: () => void;
}

const GAME_INFO: Record<MiniGameType, {
  title: string;
  icon: string;
  color: string;
  controls: string;
  steps: string[];
  scoring: { label: string; value: string; color: string }[];
  tip: string;
}> = {
  rhythm_drop: {
    title: 'RHYTHM DROP',
    icon: '🎹',
    color: '#ff4d6a',
    controls: 'A  S  D  F',
    steps: [
      'Las notas caen por 4 carriles de colores',
      'Presiona la tecla cuando la nota llegue abajo',
      'Cuanto más preciso, más oyentes ganas',
      'Combos largos multiplican tu puntuación',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8', color: '#fbbf24' },
      { label: 'GREAT', value: '+5', color: '#34d399' },
      { label: 'OK', value: '+2', color: '#22d3ee' },
      { label: 'MISS', value: '0', color: '#ff4d6a' },
    ],
    tip: '¡Los combos de 10+ multiplican tus oyentes! Mantén la racha.',
  },
  beat_catcher: {
    title: 'BEAT CATCHER',
    icon: '🎯',
    color: '#22d3ee',
    controls: 'CLICK',
    steps: [
      'Círculos aparecen en la pantalla',
      'Cada uno tiene un anillo que se contrae',
      'Haz clic cuando el anillo coincida',
      'Timing perfecto = máximos oyentes',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8', color: '#fbbf24' },
      { label: 'GREAT', value: '+5', color: '#34d399' },
      { label: 'OK', value: '+2', color: '#22d3ee' },
      { label: 'MISS', value: '0', color: '#ff4d6a' },
    ],
    tip: 'No hagas clic demasiado pronto ni tarde. ¡Espera al momento justo!',
  },
  flow_mixer: {
    title: 'FLOW MIXER',
    icon: '🎛️',
    color: '#fbbf24',
    controls: '← ↑ ↓ →',
    steps: [
      'Flechas aparecen en secuencia',
      'Presiona la flecha correcta cuando el anillo se llene',
      'Usa flechas del teclado o A/W/S/D',
      'Sigue el ritmo para mantener combos',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8', color: '#fbbf24' },
      { label: 'GREAT', value: '+5', color: '#34d399' },
      { label: 'OK', value: '+2', color: '#22d3ee' },
      { label: 'MISS', value: '0', color: '#ff4d6a' },
    ],
    tip: 'Mira la secuencia completa para anticipar la siguiente flecha.',
  },
};

export function InstructionsModal({ gameType, beatName, onStart, onBack }: InstructionsModalProps) {
  const info = GAME_INFO[gameType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-lg mx-auto px-4"
    >
      <div className="bg-[#1a1a28]/85 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="relative px-7 pt-7 pb-5 text-center border-b border-white/[0.06]">
          <div 
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 30%, ${info.color}, transparent 70%)` }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="text-5xl mb-2"
          >
            {info.icon}
          </motion.div>
          <h2 className="text-2xl font-black tracking-wider" style={{ color: info.color }}>
            {info.title}
          </h2>
          <p className="text-cyan-100/50 text-xs mt-1.5">
            Beat: <span className="text-white font-medium">{beatName}</span>
          </p>
        </div>

        {/* Controles */}
        <div className="px-7 pt-5 pb-3">
          <div 
            className="flex items-center justify-center gap-3 py-3 rounded-xl bg-cyan-400/5 border border-cyan-400/15"
          >
            <span className="text-cyan-200/60 text-xs uppercase tracking-wider font-medium">Controles:</span>
            <span className="text-xl font-black tracking-[0.3em] text-white">{info.controls}</span>
          </div>
        </div>

        {/* Pasos */}
        <div className="px-7 pb-4">
          <h3 className="text-cyan-300/60 text-[10px] uppercase tracking-[0.2em] mb-3 font-bold">Cómo jugar</h3>
          <div className="space-y-2.5">
            {info.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border"
                  style={{ backgroundColor: `${info.color}15`, color: info.color, borderColor: `${info.color}30` }}
                >
                  {i + 1}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Puntuación */}
        <div className="px-7 pb-4">
          <h3 className="text-cyan-300/60 text-[10px] uppercase tracking-[0.2em] mb-2.5 font-bold">Oyentes por acierto</h3>
          <div className="grid grid-cols-4 gap-2">
            {info.scoring.map((s) => (
              <div key={s.label} className="text-center py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] font-black" style={{ color: s.color }}>{s.label}</div>
                <div className="text-white/70 text-[11px] mt-0.5 font-semibold">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="px-7 pb-5">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-400/5 border border-amber-400/10">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-amber-200/70 text-xs leading-relaxed">{info.tip}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-7 py-5 border-t border-white/[0.08] bg-[#222230]/80">
          <button onClick={onBack} className="flex-1 py-3 rounded-xl text-cyan-200/50 font-medium border border-cyan-400/10 hover:bg-cyan-400/5 hover:text-cyan-200 transition text-sm">
            ← Volver
          </button>
          <button onClick={onStart} className="flex-[2] py-3 rounded-xl font-bold text-[#0a0318] text-sm transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-[0_4px_15px_rgba(34,211,238,0.35)] hover:from-cyan-300 hover:to-cyan-400">
            🎤 ¡GRABAR!
          </button>
        </div>
      </div>
    </motion.div>
  );
}
