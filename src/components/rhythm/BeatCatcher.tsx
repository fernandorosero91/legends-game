/**
 * 🎮 LEGENDS: Beat Catcher — Osu! Style Minigame
 * Círculos brillantes aparecen con un anillo que se contrae.
 * Haz clic cuando el anillo coincida con el círculo interior.
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
  x: number;
  y: number;
  spawnTime: number;
  duration: number; // How long the ring takes to shrink
  hit: boolean;
  missed: boolean;
  accuracy?: string;
  color: string;
}

const GAME_DURATION = 30000;
const CIRCLE_COLORS = ['#ff2d55', '#5856d6', '#30d158', '#ff9f0a', '#bf5af2', '#ff6482', '#64d2ff', '#ffd60a'];

let audioCtx: AudioContext | null = null;
function playNote(freq: number, type: OscillatorType = 'sine') {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
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
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number; color: string }[]>([]);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const circlesRef = useRef<CircleNote[]>([]);
  const statsRef = useRef({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const bgMusic = useRef<Howl | null>(null);

  // Generate circles based on BPM
  useEffect(() => {
    const bpm = beat.tempo || 120;
    const difficulty = getRhythmDifficulty(level);
    const interval = (60000 / bpm) / (difficulty?.notesPerBeat || 1);
    const shrinkDuration = 1200; // Ring shrinks over 1.2s

    const generated: CircleNote[] = [];
    let time = 2000;
    let id = 0;

    while (time < GAME_DURATION - 1500) {
      generated.push({
        id: `c${id}`,
        x: 12 + Math.random() * 76,
        y: 10 + Math.random() * 70,
        spawnTime: time - shrinkDuration,
        duration: shrinkDuration,
        hit: false,
        missed: false,
        color: CIRCLE_COLORS[id % CIRCLE_COLORS.length],
      });
      time += interval;
      id++;
    }

    console.log(`[BeatCatcher] Generated ${generated.length} circles`);
    circlesRef.current = generated;
    setCircles(generated);
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

      // Check missed
      let missCount = 0;
      for (const c of circlesRef.current) {
        if (!c.hit && !c.missed && el > c.spawnTime + c.duration + 300) {
          c.missed = true;
          missCount++;
        }
      }
      if (missCount > 0) {
        comboRef.current = 0;
        setCombo(0);
        statsRef.current.misses += missCount;
        setStats({ ...statsRef.current });
      }

      setCircles([...circlesRef.current]);

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

  // Click handler
  const handleClick = useCallback((circleId: string) => {
    const circle = circlesRef.current.find(c => c.id === circleId);
    if (!circle || circle.hit || circle.missed) return;

    const currentTime = performance.now() - startTimeRef.current;
    const hitTime = circle.spawnTime + circle.duration;
    const diff = Math.abs(currentTime - hitTime);
    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    let points: number;
    let text: string;

    if (diff <= difficulty.perfectWindow * 1.5) {
      circle.accuracy = 'perfect'; points = 100;
      statsRef.current.perfectHits++;
      playNote(1200);
    } else if (diff <= difficulty.goodWindow * 1.5) {
      circle.accuracy = 'good'; points = 75;
      statsRef.current.goodHits++;
      playNote(800);
    } else if (diff <= difficulty.okWindow * 1.5) {
      circle.accuracy = 'ok'; points = 50;
      statsRef.current.okHits++;
      playNote(500);
    } else {
      statsRef.current.misses++;
      comboRef.current = 0;
      setCombo(0);
      setStats({ ...statsRef.current });
      playNote(120, 'sawtooth');
      return;
    }

    circle.hit = true;
    comboRef.current++;
    if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
    const multiplier = 1 + Math.floor(comboRef.current / 10) * 0.1;
    scoreRef.current += Math.floor(points * multiplier);

    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setMaxCombo(maxComboRef.current);
    setStats({ ...statsRef.current });

    // Explosion
    setExplosions(prev => [...prev, { id: `e-${Date.now()}`, x: circle.x, y: circle.y, color: circle.color }]);
    setTimeout(() => setExplosions(prev => prev.slice(1)), 500);
  }, [level]);

  useEffect(() => () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); }, []);

  const progress = elapsed / GAME_DURATION;
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits;
  const accuracy = (totalHits + stats.misses) > 0 ? Math.round((totalHits / (totalHits + stats.misses)) * 100) : 100;

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          className="text-9xl font-black text-white" style={{ textShadow: '0 0 60px #22d3ee, 0 0 120px #0891b2' }}>
          {countdown}
        </motion.div>
        <p className="text-cyan-200 text-xl mt-6 font-semibold">{beat.name}</p>
        <p className="text-white/50 text-sm mt-2">Haz <span className="text-white font-bold">clic</span> en los círculos cuando el anillo se cierre</p>
      </motion.div>
    );
  }

  // Visible circles
  const activeCircles = circles.filter(c => !c.hit && !c.missed && elapsed >= c.spawnTime && elapsed < c.spawnTime + c.duration + 400);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col bg-gradient-to-b from-[#001a33] via-[#000d1a] to-[#000]">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/50 backdrop-blur border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">🎯 {beat.name}</span>
          <span className="text-white/30 text-xs">{beat.tempo} BPM</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[200px] mx-6">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/50 text-xs font-mono">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          {combo > 0 && <span className={`font-black text-sm ${combo >= 20 ? 'text-orange-300' : 'text-cyan-300'}`}>{combo}x</span>}
          <span className="text-white font-black tabular-nums">{score.toLocaleString()}</span>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xs">✕</button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden cursor-pointer select-none">
        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(e => (
            <motion.div key={e.id} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.4 }}
              className="absolute w-16 h-16 rounded-full pointer-events-none" style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, ${e.color}60, transparent)`, border: `2px solid ${e.color}` }} />
          ))}
        </AnimatePresence>

        {/* Active circles */}
        {activeCircles.map(circle => {
          const age = elapsed - circle.spawnTime;
          const shrinkProgress = Math.min(age / circle.duration, 1);
          const ringScale = 2.5 - shrinkProgress * 1.5; // 2.5x → 1x
          const opacity = shrinkProgress > 0.95 ? Math.max(0, 1 - (shrinkProgress - 0.95) * 20) : Math.min(1, age / 200);

          return (
            <div
              key={circle.id}
              className="absolute cursor-pointer"
              style={{ left: `${circle.x}%`, top: `${circle.y}%`, transform: 'translate(-50%,-50%)', opacity }}
              onClick={() => handleClick(circle.id)}
            >
              {/* Shrinking ring */}
              <div className="absolute rounded-full pointer-events-none" style={{
                width: `${ringScale * 56}px`, height: `${ringScale * 56}px`,
                border: `3px solid ${circle.color}`,
                left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                opacity: 0.8,
              }} />
              {/* Core */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{
                background: `radial-gradient(circle at 30% 30%, ${circle.color}ee, ${circle.color}88)`,
                boxShadow: `0 0 20px ${circle.color}80, inset 0 2px 4px rgba(255,255,255,0.4)`,
                border: `2px solid ${circle.color}`,
              }}>
                <div className="w-4 h-4 rounded-full bg-white/90" style={{ boxShadow: '0 0 8px white' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-center gap-6 px-5 py-2.5 bg-black/40 border-t border-white/5 text-xs font-bold">
        <span className="text-yellow-300">★ {stats.perfectHits}</span>
        <span className="text-green-300">● {stats.goodHits}</span>
        <span className="text-cyan-300">○ {stats.okHits}</span>
        <span className="text-red-400">✕ {stats.misses}</span>
        <span className={`px-2 py-0.5 rounded ${accuracy >= 90 ? 'text-yellow-300 bg-yellow-500/10' : accuracy >= 70 ? 'text-green-300 bg-green-500/10' : 'text-white/50 bg-white/5'}`}>{accuracy}%</span>
      </div>
    </motion.div>
  );
}
