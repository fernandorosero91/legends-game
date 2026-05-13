/**
 * 🎮 LEGENDS: Instructions Modal
 * Pantalla grande y elegante con instrucciones del minijuego seleccionado.
 * Se muestra antes de empezar a jugar.
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
  glow: string;
  controls: string;
  steps: string[];
  scoring: { label: string; value: string; color: string }[];
  tip: string;
}> = {
  rhythm_drop: {
    title: 'RHYTHM DROP',
    icon: '🎹',
    color: '#a855f7',
    glow: '0 0 80px rgba(168,85,247,0.3)',
    controls: 'A  S  D  F',
    steps: [
      'Las notas caen por 4 carriles de colores',
      'Presiona la tecla correspondiente cuando la nota llegue a la zona inferior',
      'Cuanto más preciso seas, más oyentes ganas',
      'Mantén combos largos para multiplicar tu puntuación',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8 oyentes', color: '#ffd60a' },
      { label: 'GREAT', value: '+5 oyentes', color: '#30d158' },
      { label: 'OK', value: '+2 oyentes', color: '#64d2ff' },
      { label: 'MISS', value: '+0 oyentes', color: '#ff3b30' },
    ],
    tip: '¡Los combos de 10+ multiplican tus oyentes! Mantén la racha.',
  },
  beat_catcher: {
    title: 'BEAT CATCHER',
    icon: '🎯',
    color: '#22d3ee',
    glow: '0 0 80px rgba(34,211,238,0.3)',
    controls: 'CLICK',
    steps: [
      'Círculos de colores aparecen en la pantalla',
      'Cada círculo tiene un anillo que se contrae',
      'Haz clic cuando el anillo coincida con el círculo',
      'Timing perfecto = máximos oyentes',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8 oyentes', color: '#ffd60a' },
      { label: 'GREAT', value: '+5 oyentes', color: '#30d158' },
      { label: 'OK', value: '+2 oyentes', color: '#64d2ff' },
      { label: 'MISS', value: '+0 oyentes', color: '#ff3b30' },
    ],
    tip: 'No hagas clic demasiado pronto ni demasiado tarde. ¡Espera al momento justo!',
  },
  flow_mixer: {
    title: 'FLOW MIXER',
    icon: '🎛️',
    color: '#30d158',
    glow: '0 0 80px rgba(48,209,88,0.3)',
    controls: '← ↑ ↓ →',
    steps: [
      'Flechas aparecen en secuencia en el centro',
      'Presiona la flecha correcta cuando el anillo se llene',
      'Usa las flechas del teclado o A/W/S/D',
      'Sigue el ritmo para mantener combos altos',
    ],
    scoring: [
      { label: 'PERFECT', value: '+8 oyentes', color: '#ffd60a' },
      { label: 'GREAT', value: '+5 oyentes', color: '#30d158' },
      { label: 'OK', value: '+2 oyentes', color: '#64d2ff' },
      { label: 'MISS', value: '+0 oyentes', color: '#ff3b30' },
    ],
    tip: 'Mira la secuencia completa para anticipar la siguiente flecha.',
  },
};

export function InstructionsModal({ gameType, beatName, onStart, onBack }: InstructionsModalProps) {
  const info = GAME_INFO[gameType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative z-10 w-full max-w-lg mx-auto px-4"
    >
      <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgba(15,5,30,0.98), rgba(5,0,15,0.99))', boxShadow: info.glow, border: `1px solid ${info.color}30` }}>
        
        {/* Header con gradiente */}
        <div className="relative px-8 pt-8 pb-6 text-center" style={{ background: `linear-gradient(to bottom, ${info.color}15, transparent)` }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-3"
          >
            {info.icon}
          </motion.div>
          <h2 className="text-3xl font-black tracking-wider" style={{ color: info.color, textShadow: `0 0 30px ${info.color}60` }}>
            {info.title}
          </h2>
          <p className="text-white/50 text-sm mt-2">Beat: <span className="text-white/80 font-medium">{beatName}</span></p>
        </div>

        {/* Controles */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-center gap-3 py-3 rounded-xl" style={{ background: `${info.color}10`, border: `1px solid ${info.color}20` }}>
            <span className="text-white/50 text-xs uppercase tracking-wider">Controles:</span>
            <span className="text-xl font-black tracking-[0.3em]" style={{ color: info.color }}>{info.controls}</span>
          </div>
        </div>

        {/* Pasos */}
        <div className="px-8 pb-4">
          <h3 className="text-white/40 text-xs uppercase tracking-widest mb-3 font-bold">Cómo jugar</h3>
          <div className="space-y-2.5">
            {info.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5" style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}>
                  {i + 1}
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Puntuación */}
        <div className="px-8 pb-4">
          <h3 className="text-white/40 text-xs uppercase tracking-widest mb-3 font-bold">Puntuación</h3>
          <div className="grid grid-cols-4 gap-2">
            {info.scoring.map((s) => (
              <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                <div className="text-[10px] font-black" style={{ color: s.color }}>{s.label}</div>
                <div className="text-white/70 text-[10px] mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="px-8 pb-6">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <span className="text-lg">💡</span>
            <p className="text-yellow-200/80 text-xs leading-relaxed">{info.tip}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center gap-3 px-8 pb-8">
          <button onClick={onBack} className="flex-1 py-3.5 rounded-xl text-white/60 font-medium border border-white/10 hover:bg-white/5 transition text-sm">
            ← Volver
          </button>
          <button onClick={onStart} className="flex-[2] py-3.5 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`, boxShadow: `0 4px 20px ${info.color}40` }}>
            🎤 ¡GRABAR!
          </button>
        </div>
      </div>
    </motion.div>
  );
}
