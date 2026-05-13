/**
 * 🎮 LEGENDS: Flow Mixer — Arrow Sequence Minigame
 * Secuencias de flechas aparecen y debes presionar ←↑↓→ al ritmo.
 * Estilo DDR / rhythm flow con visuales de DJ mixing.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import type { Beat } from '../../data/songs';
import { getRhythmDifficulty } from '../../data/levels';

interface FlowMixerProps {
  beat: Beat;
  level: number;
  onComplete: (score: number, maxCombo: number, stats: { perfectHits: number; goodHits: number; okHits: number; misses: number }) => void;
  onCancel: () => void;
}

interface ArrowNote {
  id: string;
  direction: 'left' | 'up' | 'down' | 'right';
  targetTime: number;
  hit: boolean;
  missed: boolean;
  accuracy?: string;
}

const DIRECTIONS = ['left', 'up', 'down', 'right'] as const;
const DIR_KEYS: Record<string, typeof DIRECTIONS[number]> = {
  arrowleft: 'left', arrowup: 'up', arrowdown: 'down', arrowright: 'right',
  a: 'left', w: 'up', s: 'down', d: 'right',
};
const DIR_SYMBOLS: Record<string, string> = { left: '←', up: '↑', down: '↓', right: '→' };
const DIR_COLORS: Record<string, string> = { left: '#ff4757', up: '#2ed573', down: '#3742fa', right: '#ffa502' };
const DIR_GLOW: Record<string, string> = { left: 'rgba(255,71,87,0.5)', up: 'rgba(46,213,115,0.5)', down: 'rgba(55,66,250,0.5)', right: 'rgba(255,165,2,0.5)' };

const GAME_DURATION = 30000;

let audioCtx: AudioContext | null = null;
function playTone(freq: number, type: OscillatorType = 'square') {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

export function FlowMixer({ beat, level, onComplete, onCancel }: FlowMixerProps) {
  const [arrows, setArrows] = useState<ArrowNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ dir: string; type: string } | null>(null);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const arrowsRef = useRef<ArrowNote[]>([]);
  const bgMusic = useRef<Howl | null>(null);

  // Generate arrows
  useEffect(() => {
    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    const generated: ArrowNote[] = [];
    const interval = 800 / difficulty.noteSpeed;
    const count = Math.floor(GAME_DURATION / interval);

    for (let i = 0; i < count; i++) {
      const time = 2000 + i * interval;
      if (time > GAME_DURATION - 500) break;

      generated.push({
        id: `a-${i}`,
        direction: DIRECTIONS[Math.floor(Math.random() * 4)],
        targetTime: time,
        hit: false,
        missed: false,
      });
    }

    arrowsRef.current = generated;
    setArrows(generated);
  }, [level]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = performance.now();
      bgMusic.current = new Howl({ src: ['/audio/inicio.mp3'], volume: 0.25, loop: true });
      bgMusic.current.play();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Game loop
  useEffect(() => {
    if (!started) return;

    const loop = () => {
      const el = performance.now() - startTimeRef.current;
      setElapsed(el);

      // Check missed
      let missCount = 0;
      arrowsRef.current = arrowsRef.current.map(a => {
        if (!a.hit && !a.missed && a.targetTime < el - 250) {
          missCount++;
          return { ...a, missed: true };
        }
        return a;
      });

      if (missCount > 0) {
        setCombo(0);
        setStats(s => ({ ...s, misses: s.misses + missCount }));
      }

      setArrows([...arrowsRef.current]);

      if (el >= GAME_DURATION) {
        bgMusic.current?.stop();
        onComplete(score, maxCombo, stats);
        return;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started]);

  // Keyboard
  useEffect(() => {
    if (!started) return;

    const handleKey = (e: KeyboardEvent) => {
      const dir = DIR_KEYS[e.key.toLowerCase()];
      if (!dir) return;

      setActiveDir(dir);
      setTimeout(() => setActiveDir(null), 150);

      const currentTime = performance.now() - startTimeRef.current;
      const difficulty = getRhythmDifficulty(level);
      if (!difficulty) return;

      const arrow = arrowsRef.current.find(
        a => a.direction === dir && !a.hit && !a.missed && Math.abs(a.targetTime - currentTime) <= difficulty.okWindow
      );

      if (!arrow) {
        setCombo(0);
        setStats(s => ({ ...s, misses: s.misses + 1 }));
        setLastFeedback({ dir, type: 'miss' });
        playTone(100, 'sawtooth');
        setTimeout(() => setLastFeedback(null), 400);
        return;
      }

      const diff = Math.abs(arrow.targetTime - currentTime);
      let accuracy: 'perfect' | 'good' | 'ok';
      let points: number;

      if (diff <= difficulty.perfectWindow) {
        accuracy = 'perfect'; points = 100;
        setStats(s => ({ ...s, perfectHits: s.perfectHits + 1 }));
        playTone(880, 'sine');
      } else if (diff <= difficulty.goodWindow) {
        accuracy = 'good'; points = 75;
        setStats(s => ({ ...s, goodHits: s.goodHits + 1 }));
        playTone(660, 'sine');
      } else {
        accuracy = 'ok'; points = 50;
        setStats(s => ({ ...s, okHits: s.okHits + 1 }));
        playTone(440, 'sine');
      }

      arrow.hit = true;
      arrow.accuracy = accuracy;

      const newCombo = combo + 1;
      const multiplier = 1 + Math.floor(newCombo / 10) * 0.1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setScore(s => s + Math.floor(points * multiplier));
      setLastFeedback({ dir, type: accuracy });
      setTimeout(() => setLastFeedback(null), 400);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, combo, maxCombo, level, score, stats]);

  useEffect(() => {
    return () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); };
  }, []);

  const progress = elapsed / GAME_DURATION;
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits;
  const totalAttempts = totalHits + stats.misses;
  const accuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 100;

  // Get upcoming arrows (next 6)
  const upcomingArrows = arrows.filter(a => !a.hit && !a.missed && a.targetTime > elapsed - 100).slice(0, 8);
  const currentArrow = upcomingArrows[0];

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
          className="text-8xl font-black text-white" style={{ textShadow: '0 0 40px rgba(46,213,115,0.8)' }}>
          {countdown}
        </motion.div>
        <p className="text-green-300 text-lg mt-4 font-medium">{beat.name}</p>
        <p className="text-white/40 text-sm mt-1">Usa las flechas ←↑↓→ o A/W/S/D</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">🎛️ {beat.name}</span>
          <span className="text-white/40 text-xs">{beat.style.toUpperCase()} • {beat.tempo} BPM</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs mx-8">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/60 text-xs font-mono w-8">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-bold ${combo >= 10 ? 'text-orange-300' : 'text-white/60'}`}>{combo}x</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${accuracy >= 90 ? 'text-yellow-300 bg-yellow-500/10' : 'text-white/60 bg-white/5'}`}>{accuracy}%</span>
          <span className="text-white font-black text-lg tabular-nums">{score.toLocaleString()}</span>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="text-red-400/80 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-500/20">✕</button>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        
        {/* Upcoming sequence */}
        <div className="flex items-center gap-3">
          {upcomingArrows.map((arrow, i) => {
            const isCurrent = i === 0;
            const timeDiff = arrow.targetTime - elapsed;
            const urgency = Math.max(0, 1 - timeDiff / 1500);

            return (
              <motion.div
                key={arrow.id}
                initial={{ opacity: 0, scale: 0.5, x: 30 }}
                animate={{ opacity: isCurrent ? 1 : 0.3 + (1 - i * 0.1), scale: isCurrent ? 1.3 : 1 - i * 0.05, x: 0 }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${
                  isCurrent ? 'border-2 shadow-xl' : 'border border-white/10'
                }`}
                style={{
                  borderColor: isCurrent ? DIR_COLORS[arrow.direction] : undefined,
                  background: isCurrent ? `${DIR_COLORS[arrow.direction]}20` : 'rgba(255,255,255,0.02)',
                  boxShadow: isCurrent ? `0 0 30px ${DIR_GLOW[arrow.direction]}` : undefined,
                  color: DIR_COLORS[arrow.direction],
                }}
              >
                {DIR_SYMBOLS[arrow.direction]}
              </motion.div>
            );
          })}
        </div>

        {/* Current arrow — big display */}
        <AnimatePresence mode="popLayout">
          {currentArrow && (
            <motion.div
              key={currentArrow.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-32 h-32 rounded-3xl flex items-center justify-center text-6xl font-black border-2"
              style={{
                borderColor: DIR_COLORS[currentArrow.direction],
                background: `radial-gradient(circle, ${DIR_COLORS[currentArrow.direction]}25, transparent)`,
                boxShadow: `0 0 60px ${DIR_GLOW[currentArrow.direction]}, inset 0 0 30px ${DIR_GLOW[currentArrow.direction]}`,
                color: DIR_COLORS[currentArrow.direction],
              }}
            >
              {DIR_SYMBOLS[currentArrow.direction]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {lastFeedback && (
            <motion.div
              key={`fb-${Date.now()}`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -20, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 mt-24"
            >
              <span className={`text-lg font-black ${
                lastFeedback.type === 'perfect' ? 'text-yellow-300' :
                lastFeedback.type === 'good' ? 'text-green-300' :
                lastFeedback.type === 'ok' ? 'text-blue-300' : 'text-red-400'
              }`}>
                {lastFeedback.type === 'perfect' ? '★ PERFECT!' : lastFeedback.type === 'good' ? '● GOOD!' : lastFeedback.type === 'ok' ? '○ OK' : '✕ MISS'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timing ring around current arrow */}
        {currentArrow && (() => {
          const timeDiff = currentArrow.targetTime - elapsed;
          const ringProgress = Math.max(0, 1 - timeDiff / 1500);
          return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="180" height="180" className="absolute -top-[90px] -left-[90px]">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="90" cy="90" r="80" fill="none"
                  stroke={DIR_COLORS[currentArrow.direction]}
                  strokeWidth="3"
                  strokeDasharray={`${ringProgress * 502} 502`}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                  opacity={0.6}
                />
              </svg>
            </div>
          );
        })()}
      </div>

      {/* Arrow key indicators */}
      <div className="flex justify-center gap-3 pb-6">
        {DIRECTIONS.map(dir => (
          <div
            key={dir}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black transition-all duration-75"
            style={{
              background: activeDir === dir ? `${DIR_COLORS[dir]}30` : 'rgba(255,255,255,0.03)',
              border: `2px solid ${activeDir === dir ? DIR_COLORS[dir] : 'rgba(255,255,255,0.08)'}`,
              boxShadow: activeDir === dir ? `0 0 20px ${DIR_GLOW[dir]}` : 'none',
              color: activeDir === dir ? DIR_COLORS[dir] : 'rgba(255,255,255,0.4)',
            }}
          >
            {DIR_SYMBOLS[dir]}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
