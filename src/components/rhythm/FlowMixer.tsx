/**
 * 🎮 LEGENDS: Flow Mixer — Arrow Sequence Minigame
 * Flechas grandes aparecen en secuencia. Presiona la dirección correcta al ritmo.
 * Estilo DDR con visuales de neon y feedback intenso.
 */

import { useState, useEffect, useRef } from 'react';
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
}

const DIRECTIONS = ['left', 'up', 'down', 'right'] as const;
const DIR_KEYS: Record<string, typeof DIRECTIONS[number]> = {
  arrowleft: 'left', arrowup: 'up', arrowdown: 'down', arrowright: 'right',
};
const DIR_SYMBOLS: Record<string, string> = { left: '←', up: '↑', down: '↓', right: '→' };
const DIR_COLORS: Record<string, string> = { left: '#ff2d55', up: '#30d158', down: '#5856d6', right: '#ff9f0a' };
const DIR_GLOW: Record<string, string> = { left: '0 0 40px #ff2d55', up: '0 0 40px #30d158', down: '0 0 40px #5856d6', right: '0 0 40px #ff9f0a' };

const GAME_DURATION = 30000;

let audioCtx: AudioContext | null = null;
function playTone(freq: number, type: OscillatorType = 'sine') {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

export function FlowMixer({ beat, level, onComplete, onCancel }: FlowMixerProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<{ text: string; color: string; key: number } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const arrowsRef = useRef<ArrowNote[]>([]);
  const statsRef = useRef({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const bgMusic = useRef<Howl | null>(null);

  // Generate arrows
  useEffect(() => {
    const bpm = beat.tempo || 120;
    const difficulty = getRhythmDifficulty(level);
    const interval = (60000 / bpm) / (difficulty?.notesPerBeat || 1);

    const generated: ArrowNote[] = [];
    let time = 2000;
    let id = 0;

    while (time < GAME_DURATION - 1000) {
      generated.push({
        id: `a${id++}`,
        direction: DIRECTIONS[Math.floor(Math.random() * 4)],
        targetTime: time,
        hit: false,
        missed: false,
      });
      time += interval;
    }

    console.log(`[FlowMixer] Generated ${generated.length} arrows`);
    arrowsRef.current = generated;
  }, [level, beat.tempo]);

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

      // Check missed arrows
      let missCount = 0;
      for (const a of arrowsRef.current) {
        if (!a.hit && !a.missed && a.targetTime < el - 300) {
          a.missed = true;
          missCount++;
        }
      }
      if (missCount > 0) {
        comboRef.current = 0;
        setCombo(0);
        statsRef.current.misses += missCount;
        setStats({ ...statsRef.current });
      }

      // Update current index (first unhit/unmissed)
      const idx = arrowsRef.current.findIndex(a => !a.hit && !a.missed);
      setCurrentIndex(idx >= 0 ? idx : arrowsRef.current.length);

      if (el >= GAME_DURATION) {
        bgMusic.current?.stop();
        onComplete(scoreRef.current, maxComboRef.current, statsRef.current);
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started, onComplete]);

  // Keyboard
  useEffect(() => {
    if (!started) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const dir = DIR_KEYS[e.key.toLowerCase()];
      if (!dir) return;

      setActiveDir(dir);
      setTimeout(() => setActiveDir(null), 120);

      const currentTime = performance.now() - startTimeRef.current;
      const difficulty = getRhythmDifficulty(level);
      if (!difficulty) return;

      // Find the current arrow to hit
      const arrow = arrowsRef.current.find(
        a => a.direction === dir && !a.hit && !a.missed && Math.abs(a.targetTime - currentTime) <= difficulty.okWindow
      );

      if (!arrow) {
        comboRef.current = 0;
        setCombo(0);
        statsRef.current.misses++;
        setStats({ ...statsRef.current });
        setFeedbackText({ text: 'MISS', color: '#ff3b30', key: Date.now() });
        playTone(100, 'sawtooth');
        return;
      }

      arrow.hit = true;
      const diff = Math.abs(arrow.targetTime - currentTime);
      let points: number;
      let text: string;
      let color: string;

      if (diff <= difficulty.perfectWindow) {
        points = 100; text = '✦ PERFECT'; color = '#ffd60a';
        statsRef.current.perfectHits++;
        playTone(1200);
      } else if (diff <= difficulty.goodWindow) {
        points = 75; text = 'GREAT'; color = '#30d158';
        statsRef.current.goodHits++;
        playTone(800);
      } else {
        points = 50; text = 'OK'; color = '#64d2ff';
        statsRef.current.okHits++;
        playTone(500);
      }

      comboRef.current++;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      const multiplier = 1 + Math.floor(comboRef.current / 10) * 0.1;
      scoreRef.current += Math.floor(points * multiplier);

      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setStats({ ...statsRef.current });
      setFeedbackText({ text, color, key: Date.now() });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, level]);

  useEffect(() => () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); }, []);

  const progress = elapsed / GAME_DURATION;
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits;
  const accuracy = (totalHits + stats.misses) > 0 ? Math.round((totalHits / (totalHits + stats.misses)) * 100) : 100;

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          className="text-[120px] font-black text-white leading-none" style={{ textShadow: '0 0 80px rgba(52,211,153,0.8), 0 0 40px rgba(52,211,153,0.4)' }}>
          {countdown}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <p className="text-2xl font-bold text-white">{beat.name}</p>
          <p className="text-emerald-300/60 mt-2 text-sm">{beat.tempo} BPM • Nivel {level}</p>
          <div className="mt-5 px-5 py-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
            <p className="text-emerald-200 text-sm font-medium">🎛️ Presiona las <span className="text-white font-bold">flechas ←↑↓→</span> al ritmo</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Get upcoming arrows for display
  const upcoming = arrowsRef.current.filter(a => !a.hit && !a.missed).slice(0, 7);
  const currentArrow = upcoming[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/40 backdrop-blur-sm border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <span className="text-sm">🎛️</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">{beat.name}</h3>
            <p className="text-emerald-300/50 text-[10px] mt-0.5">{beat.tempo} BPM • Nivel {level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-[220px] mx-6">
          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white font-bold text-sm tabular-nums min-w-[30px] text-right">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          {combo > 4 && (
            <div className="text-center">
              <div className={`text-lg font-black leading-none ${combo >= 20 ? 'text-orange-300' : 'text-emerald-300'}`}>{combo}x</div>
              <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Combo</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-lg font-black text-white leading-none tabular-nums">{score.toLocaleString()}</div>
            <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Score</div>
          </div>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs hover:bg-red-500/20 transition">✕</button>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative bg-black/40">
        
        {/* Upcoming sequence — horizontal strip */}
        <div className="flex items-center gap-2">
          {upcoming.slice(1, 7).map((arrow, i) => (
            <motion.div key={arrow.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 0.3 + (0.7 / (i + 2)), x: 0 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border"
              style={{ borderColor: `${DIR_COLORS[arrow.direction]}40`, color: DIR_COLORS[arrow.direction], opacity: 0.3 + (0.5 / (i + 1)) }}>
              {DIR_SYMBOLS[arrow.direction]}
            </motion.div>
          ))}
        </div>

        {/* Current arrow — BIG */}
        <AnimatePresence mode="popLayout">
          {currentArrow && (
            <motion.div
              key={currentArrow.id}
              initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-36 h-36 rounded-3xl flex items-center justify-center text-7xl font-black border-3"
              style={{
                borderColor: DIR_COLORS[currentArrow.direction],
                color: DIR_COLORS[currentArrow.direction],
                background: `radial-gradient(circle, ${DIR_COLORS[currentArrow.direction]}20, transparent)`,
                boxShadow: DIR_GLOW[currentArrow.direction],
              }}
            >
              {DIR_SYMBOLS[currentArrow.direction]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timing indicator — circular progress */}
        {currentArrow && (() => {
          const timeDiff = currentArrow.targetTime - elapsed;
          const ringProgress = Math.max(0, Math.min(1, 1 - timeDiff / 1200));
          return (
            <svg width="200" height="200" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              <circle cx="100" cy="100" r="90" fill="none"
                stroke={DIR_COLORS[currentArrow.direction]} strokeWidth="4"
                strokeDasharray={`${ringProgress * 565} 565`}
                strokeLinecap="round" transform="rotate(-90 100 100)" opacity={0.7} />
            </svg>
          );
        })()}

        {/* Feedback */}
        <AnimatePresence>
          {feedbackText && (
            <motion.div key={feedbackText.key} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -30, scale: 1.3 }} transition={{ duration: 0.5 }}
              className="absolute top-1/2 mt-28 pointer-events-none">
              <span className="text-xl font-black" style={{ color: feedbackText.color, textShadow: `0 0 15px ${feedbackText.color}` }}>
                {feedbackText.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Arrow key indicators */}
      <div className="flex justify-center gap-3 py-4 bg-black/30 backdrop-blur-sm border-t border-white/[0.08]">
        {DIRECTIONS.map(dir => (
          <div key={dir} className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-75"
            style={{
              background: activeDir === dir ? `${DIR_COLORS[dir]}30` : 'rgba(255,255,255,0.04)',
              border: `2px solid ${activeDir === dir ? DIR_COLORS[dir] : 'rgba(255,255,255,0.1)'}`,
              color: activeDir === dir ? DIR_COLORS[dir] : 'rgba(255,255,255,0.4)',
              boxShadow: activeDir === dir ? DIR_GLOW[dir] : 'none',
              transform: activeDir === dir ? 'scale(0.9)' : 'scale(1)',
            }}>
            {DIR_SYMBOLS[dir]}
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-center gap-5 px-5 py-2.5 bg-black/40 backdrop-blur-sm border-t border-white/[0.04] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">★</span>
          <span className="text-yellow-300 font-bold">{stats.perfectHits}</span>
          <span className="text-white/25">Perfect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">●</span>
          <span className="text-emerald-300 font-bold">{stats.goodHits}</span>
          <span className="text-white/25">Great</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400">○</span>
          <span className="text-cyan-300 font-bold">{stats.okHits}</span>
          <span className="text-white/25">OK</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400">✕</span>
          <span className="text-red-300 font-bold">{stats.misses}</span>
          <span className="text-white/25">Miss</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <span className={`font-bold ${accuracy >= 90 ? 'text-yellow-300' : accuracy >= 70 ? 'text-emerald-300' : 'text-white/50'}`}>{accuracy}%</span>
      </div>
    </motion.div>
  );
}
