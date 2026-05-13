/**
 * 🎮 LEGENDS: Beat Catcher — Osu! Style Minigame
 * Círculos aparecen en pantalla con un anillo que se contrae.
 * Haz clic cuando el anillo coincida con el círculo.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import type { Beat } from '../../data/songs';
import { getRhythmDifficulty } from '../../data/levels';

interface BeatCatcherProps {
  beat: Beat;
  level: number;
  onComplete: (score: number, maxCombo: number, stats: { perfectHits: number; goodHits: number; okHits: number; misses: number }) => void;
  onCancel: () => void;
}

interface CircleNote {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  spawnTime: number;
  hitWindow: number; // ms to shrink
  hit: boolean;
  missed: boolean;
  accuracy?: string;
}

const GAME_DURATION = 30000;
const COLORS = ['#ff4757', '#3742fa', '#2ed573', '#ffa502', '#a55eea', '#ff6b81', '#70a1ff', '#7bed9f'];

let audioCtx: AudioContext | null = null;
function playNote(freq: number) {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = 'triangle';
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

export function BeatCatcher({ beat, level, onComplete, onCancel }: BeatCatcherProps) {
  const [circles, setCircles] = useState<CircleNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [ripples, setRipples] = useState<{ id: string; x: number; y: number; color: string }[]>([]);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const circlesRef = useRef<CircleNote[]>([]);
  const bgMusic = useRef<Howl | null>(null);

  // Generate circles
  useEffect(() => {
    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    const generated: CircleNote[] = [];
    const baseInterval = 1200 / difficulty.noteSpeed;
    const count = Math.floor(GAME_DURATION / baseInterval);

    for (let i = 0; i < count; i++) {
      const time = 1500 + i * baseInterval;
      if (time > GAME_DURATION - 1000) break;

      generated.push({
        id: `c-${i}`,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 60,
        spawnTime: time - 1500, // Spawn 1.5s before hit time
        hitWindow: 1500,
        hit: false,
        missed: false,
      });
    }

    circlesRef.current = generated;
    setCircles(generated);
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

      // Check missed circles
      let missCount = 0;
      circlesRef.current = circlesRef.current.map(c => {
        if (!c.hit && !c.missed && el > c.spawnTime + c.hitWindow + 300) {
          missCount++;
          return { ...c, missed: true };
        }
        return c;
      });

      if (missCount > 0) {
        setCombo(0);
        setStats(s => ({ ...s, misses: s.misses + missCount }));
      }

      setCircles([...circlesRef.current]);

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

  // Click handler
  const handleCircleClick = useCallback((circleId: string) => {
    const circle = circlesRef.current.find(c => c.id === circleId);
    if (!circle || circle.hit || circle.missed) return;

    const currentTime = performance.now() - startTimeRef.current;
    const hitTime = circle.spawnTime + circle.hitWindow;
    const diff = Math.abs(currentTime - hitTime);

    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    let accuracy: 'perfect' | 'good' | 'ok' | 'miss';
    let points: number;

    if (diff <= difficulty.perfectWindow * 1.5) {
      accuracy = 'perfect'; points = 100;
      setStats(s => ({ ...s, perfectHits: s.perfectHits + 1 }));
      playNote(880);
    } else if (diff <= difficulty.goodWindow * 1.5) {
      accuracy = 'good'; points = 75;
      setStats(s => ({ ...s, goodHits: s.goodHits + 1 }));
      playNote(660);
    } else if (diff <= difficulty.okWindow * 1.5) {
      accuracy = 'ok'; points = 50;
      setStats(s => ({ ...s, okHits: s.okHits + 1 }));
      playNote(440);
    } else {
      accuracy = 'miss'; points = 0;
      setStats(s => ({ ...s, misses: s.misses + 1 }));
      setCombo(0);
      return;
    }

    circle.hit = true;
    circle.accuracy = accuracy;

    const newCombo = combo + 1;
    const multiplier = 1 + Math.floor(newCombo / 10) * 0.1;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);
    setScore(s => s + Math.floor(points * multiplier));

    // Ripple effect
    setRipples(prev => [...prev, { id: `r-${Date.now()}`, x: circle.x, y: circle.y, color: COLORS[Math.floor(Math.random() * COLORS.length)] }]);
    setTimeout(() => setRipples(prev => prev.slice(1)), 600);
  }, [combo, maxCombo, level, score, stats]);

  // Cleanup
  useEffect(() => {
    return () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); };
  }, []);

  const progress = elapsed / GAME_DURATION;
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits;
  const totalAttempts = totalHits + stats.misses;
  const accuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 100;

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
          className="text-8xl font-black text-white" style={{ textShadow: '0 0 40px rgba(34,211,238,0.8)' }}>
          {countdown}
        </motion.div>
        <p className="text-cyan-300 text-lg mt-4 font-medium">{beat.name}</p>
        <p className="text-white/40 text-sm mt-1">Haz clic en los círculos cuando el anillo se cierre</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">🎯 {beat.name}</span>
          <span className="text-white/40 text-xs">{beat.style.toUpperCase()} • {beat.tempo} BPM</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs mx-8">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/60 text-xs font-mono w-8">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className={`font-bold ${combo >= 10 ? 'text-orange-300' : 'text-white/60'}`}>{combo}x</span>
            <span className={`px-2 py-0.5 rounded font-bold ${accuracy >= 90 ? 'text-yellow-300 bg-yellow-500/10' : 'text-white/60 bg-white/5'}`}>{accuracy}%</span>
          </div>
          <div className="text-white font-black text-lg tabular-nums">{score.toLocaleString()}</div>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="text-red-400/80 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-500/20">✕</button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden cursor-crosshair">
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-16 h-16 rounded-full pointer-events-none"
              style={{ left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%, -50%)', border: `3px solid ${r.color}` }}
            />
          ))}
        </AnimatePresence>

        {/* Circles */}
        {circles.filter(c => !c.hit && !c.missed && elapsed >= c.spawnTime && elapsed < c.spawnTime + c.hitWindow + 300).map((circle, i) => {
          const age = elapsed - circle.spawnTime;
          const shrinkProgress = Math.min(age / circle.hitWindow, 1);
          const ringSize = 3 - shrinkProgress * 2; // 3x to 1x
          const opacity = shrinkProgress > 0.9 ? 1 - (shrinkProgress - 0.9) * 10 : 1;
          const color = COLORS[i % COLORS.length];

          return (
            <motion.div
              key={circle.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity }}
              className="absolute cursor-pointer"
              style={{ left: `${circle.x}%`, top: `${circle.y}%`, transform: 'translate(-50%, -50%)' }}
              onClick={() => handleCircleClick(circle.id)}
            >
              {/* Shrinking ring */}
              <div
                className="absolute rounded-full border-[3px] pointer-events-none"
                style={{
                  width: `${ringSize * 48}px`,
                  height: `${ringSize * 48}px`,
                  borderColor: color,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.7,
                }}
              />
              {/* Core circle */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: `radial-gradient(circle, ${color}dd, ${color}88)`,
                  boxShadow: `0 0 20px ${color}60, inset 0 2px 4px rgba(255,255,255,0.3)`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-white/80" />
              </div>
            </motion.div>
          );
        })}

        {/* Hit feedback text */}
        <AnimatePresence>
          {circles.filter(c => c.hit && c.accuracy).slice(-3).map(c => (
            <motion.div
              key={`hit-${c.id}`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -30, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute pointer-events-none text-center"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className={`text-sm font-black ${
                c.accuracy === 'perfect' ? 'text-yellow-300' : c.accuracy === 'good' ? 'text-green-300' : 'text-blue-300'
              }`}>
                {c.accuracy === 'perfect' ? '★ PERFECT' : c.accuracy === 'good' ? '● GOOD' : '○ OK'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
