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
  difficulty?: 'easy' | 'normal' | 'hard';
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

export function BeatCatcher({ beat, level, difficulty = 'normal', onComplete, onCancel }: BeatCatcherProps) {
  const [circles, setCircles] = useState<CircleNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [paused, setPaused] = useState(false);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const circlesRef = useRef<CircleNote[]>([]);
  const statsRef = useRef({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const bgMusic = useRef<Howl | null>(null);
  const pausedRef = useRef(false);
  const pauseTimeRef = useRef(0);

  // Generate circles based on BPM and difficulty
  useEffect(() => {
    const bpm = beat.tempo || 120;
    const diffConfig = getRhythmDifficulty(level);
    const noteMult = difficulty === 'easy' ? 0.4 : difficulty === 'hard' ? 1.3 : 0.8;
    const interval = (60000 / bpm) / Math.max(0.3, (diffConfig?.notesPerBeat || 0.5) * noteMult);
    // Easier = more time to click (longer shrink), harder = less time
    const shrinkDuration = difficulty === 'easy' ? 2000 : difficulty === 'hard' ? 1000 : 1500;

    const generated: CircleNote[] = [];
    let time = 2500;
    let id = 0;

    while (time < GAME_DURATION - 1500) {
      generated.push({
        id: `c${id}`,
        x: 15 + Math.random() * 70,
        y: 12 + Math.random() * 65,
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
  }, [level, beat.tempo, difficulty]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = performance.now();
      bgMusic.current = new Howl({ src: [beat.audioFile], volume: 0.25, loop: true });
      bgMusic.current.play();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Game loop — NO setState every frame
  const hudTimerRef = useRef(0);
  const [tick, setTick] = useState(0); // simple counter to trigger re-render

  useEffect(() => {
    if (!started) return;
    const loop = () => {
      if (pausedRef.current) { animRef.current = requestAnimationFrame(loop); return; }
      const el = performance.now() - startTimeRef.current;

      // Check missed (mutate only)
      for (const c of circlesRef.current) {
        if (!c.hit && !c.missed && el > c.spawnTime + c.duration + 300) {
          c.missed = true;
          comboRef.current = 0;
          statsRef.current.misses++;
        }
      }

      if (el >= GAME_DURATION) {
        bgMusic.current?.stop();
        onComplete(scoreRef.current, maxComboRef.current, statsRef.current);
        return;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    // HUD updates at ~5fps — minimal state changes
    hudTimerRef.current = window.setInterval(() => {
      setElapsed(performance.now() - startTimeRef.current);
      setTick(t => t + 1); // triggers re-render to show circle positions
    }, 200);

    return () => { cancelAnimationFrame(animRef.current); clearInterval(hudTimerRef.current); };
  }, [started, onComplete]);

  // Click handler
  const handleClick = useCallback((circleId: string) => {
    const circle = circlesRef.current.find(c => c.id === circleId);
    if (!circle || circle.hit || circle.missed) return;

    const currentTime = performance.now() - startTimeRef.current;
    const hitTime = circle.spawnTime + circle.duration;
    const diff = Math.abs(currentTime - hitTime);
    const diffConfig = getRhythmDifficulty(level);
    if (!diffConfig) return;

    // Difficulty multiplier — easy = much more forgiving windows
    const windowMult = difficulty === 'easy' ? 2.5 : difficulty === 'hard' ? 1.2 : 1.8;

    let points: number;
    let text: string;

    if (diff <= diffConfig.perfectWindow * windowMult) {
      circle.accuracy = 'perfect'; points = 100;
      statsRef.current.perfectHits++;
      playNote(1200);
    } else if (diff <= diffConfig.goodWindow * windowMult) {
      circle.accuracy = 'good'; points = 75;
      statsRef.current.goodHits++;
      playNote(800);
    } else if (diff <= diffConfig.okWindow * windowMult) {
      circle.accuracy = 'ok'; points = 50;
      statsRef.current.okHits++;
      playNote(500);
    } else {
      statsRef.current.misses++;
      comboRef.current = 0;
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

    // Musical note particles flying out from hit position
    const syms = ['♪', '♫', '✦', '★', '♬'];
    const count = points >= 100 ? 5 : points >= 75 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.textContent = syms[Math.floor(Math.random() * syms.length)];
      const size = 22 + Math.random() * 14;
      const dx = (Math.random() - 0.5) * 160;
      const dy = -60 - Math.random() * 100;
      el.style.cssText = `position:fixed;left:${circle.x}%;top:${circle.y}%;color:${circle.color};font-size:${size}px;font-weight:bold;pointer-events:none;z-index:200;text-shadow:0 0 12px ${circle.color}, 0 0 24px ${circle.color};opacity:1;transition:all 0.8s cubic-bezier(0.25,0.46,0.45,0.94);transform:translate(-50%,-50%) scale(1.3)`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = '0';
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2) rotate(${(Math.random()-0.5)*300}deg)`;
      });
      setTimeout(() => el.remove(), 850);
    }

    // Shockwave ring on PERFECT hits
    if (points >= 100) {
      const ring = document.createElement('div');
      ring.style.cssText = `position:fixed;left:${circle.x}%;top:${circle.y}%;width:50px;height:50px;border-radius:50%;border:3px solid ${circle.color};pointer-events:none;z-index:199;transform:translate(-50%,-50%) scale(0.5);opacity:0.9;transition:all 0.45s ease-out;box-shadow:0 0 15px ${circle.color}, inset 0 0 15px ${circle.color}50`;
      document.body.appendChild(ring);
      requestAnimationFrame(() => {
        ring.style.transform = 'translate(-50%,-50%) scale(3.5)';
        ring.style.opacity = '0';
        ring.style.borderWidth = '1px';
      });
      setTimeout(() => ring.remove(), 500);
    }

  }, [level]);

  useEffect(() => () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); clearInterval(hudTimerRef.current); }, []);

  // Escape key for pause
  useEffect(() => {
    if (!started) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePause();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [started]);

  function togglePause() {
    if (pausedRef.current) {
      const pausedDuration = performance.now() - pauseTimeRef.current;
      startTimeRef.current += pausedDuration;
      pausedRef.current = false;
      bgMusic.current?.play();
      setPaused(false);
    } else {
      pausedRef.current = true;
      pauseTimeRef.current = performance.now();
      bgMusic.current?.pause();
      setPaused(true);
    }
  }

  function handleRestart() {
    bgMusic.current?.stop();
    cancelAnimationFrame(animRef.current);
    clearInterval(hudTimerRef.current);
    pausedRef.current = false;
    setPaused(false);
    setStarted(false);
    setCountdown(3);
    setScore(0); setCombo(0); setMaxCombo(0);
    setStats({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
    scoreRef.current = 0; comboRef.current = 0; maxComboRef.current = 0;
    statsRef.current = { perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 };
    circlesRef.current = [];
    setCircles([]);
  }

  const progress = elapsed / GAME_DURATION;
  const displayScore = scoreRef.current;
  const displayCombo = comboRef.current;
  const displayStats = statsRef.current;
  const totalHits = displayStats.perfectHits + displayStats.goodHits + displayStats.okHits;
  const accuracy = (totalHits + displayStats.misses) > 0 ? Math.round((totalHits / (totalHits + displayStats.misses)) * 100) : 100;

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          className="text-[120px] font-black text-white leading-none" style={{ textShadow: '0 0 80px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.4)' }}>
          {countdown}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <p className="text-2xl font-bold text-white">{beat.name}</p>
          <p className="text-cyan-300/60 mt-2 text-sm">{beat.tempo} BPM • Nivel {level}</p>
          <div className="mt-5 px-5 py-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
            <p className="text-cyan-200 text-sm font-medium">🎯 Haz <span className="text-white font-bold">clic</span> en los círculos cuando el anillo se cierre</p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Visible circles — read directly from ref (no state copy)
  const activeCircles = circlesRef.current.filter(c => !c.hit && !c.missed && elapsed >= c.spawnTime && elapsed < c.spawnTime + c.duration + 400);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/70 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <span className="text-sm">🎯</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">{beat.name}</h3>
            <p className="text-cyan-300/50 text-[10px] mt-0.5">{beat.tempo} BPM • Nivel {level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-[220px] mx-6">
          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white font-bold text-sm tabular-nums min-w-[30px] text-right">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          {displayCombo > 4 && (
            <div className="text-center">
              <div className={`text-lg font-black leading-none ${displayCombo >= 20 ? 'text-orange-300' : 'text-cyan-300'}`}>{displayCombo}x</div>
              <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Combo</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-lg font-black text-white leading-none tabular-nums">{displayScore.toLocaleString()}</div>
            <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Score</div>
          </div>
          <button onClick={togglePause} className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs hover:bg-white/20" title="Pausar (Esc)">⏸</button>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs hover:bg-red-500/20 transition">✕</button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden cursor-pointer select-none bg-[#0a0a15]">
        {/* Studio ambiance decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 85%, rgba(34,211,238,0.08) 0%, transparent 45%), radial-gradient(ellipse at 15% 30%, rgba(255,45,85,0.06) 0%, transparent 35%), radial-gradient(ellipse at 85% 30%, rgba(167,139,250,0.06) 0%, transparent 35%)' }} />
          <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col items-center justify-between py-6">
            <div className="flex items-end gap-[3px] h-36 w-full px-3">{[...Array(10)].map((_, i) => (<div key={i} className="flex-1 rounded-full" style={{ height: `${25+Math.sin(i*0.7)*25+20}%`, background: `linear-gradient(to top, ${['#ff2d55','#a78bfa','#22d3ee','#fbbf24'][i%4]}, ${['#ff2d55','#a78bfa','#22d3ee','#fbbf24'][i%4]}30)`, animation: `rd-eq ${0.5+i*0.08}s ease-in-out infinite alternate`, animationDelay: `${i*0.06}s` }} />))}</div>
            <div className="flex flex-col items-center gap-3 text-2xl"><span className="opacity-30">🎯</span><span className="opacity-25">🎧</span><span className="opacity-30">🎵</span></div>
            <div className="flex items-end gap-[3px] h-28 w-full px-3">{[...Array(10)].map((_, i) => (<div key={i} className="flex-1 rounded-full" style={{ height: `${20+Math.cos(i*0.9)*20+18}%`, background: `linear-gradient(to top, ${['#22d3ee','#fbbf24','#ff2d55','#a78bfa'][i%4]}60, ${['#22d3ee','#fbbf24','#ff2d55','#a78bfa'][i%4]}15)`, animation: `rd-eq ${0.6+i*0.09}s ease-in-out infinite alternate-reverse`, animationDelay: `${i*0.07}s` }} />))}</div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-20 flex flex-col items-center justify-between py-6">
            <div className="flex items-end gap-[3px] h-36 w-full px-3">{[...Array(10)].map((_, i) => (<div key={i} className="flex-1 rounded-full" style={{ height: `${30+Math.cos(i*0.6)*20+20}%`, background: `linear-gradient(to top, ${['#fbbf24','#22d3ee','#a78bfa','#ff2d55'][i%4]}, ${['#fbbf24','#22d3ee','#a78bfa','#ff2d55'][i%4]}30)`, animation: `rd-eq ${0.55+i*0.09}s ease-in-out infinite alternate-reverse`, animationDelay: `${i*0.05}s` }} />))}</div>
            <div className="flex flex-col items-center gap-3 text-2xl"><span className="opacity-30">🎤</span><span className="opacity-25">🎶</span><span className="opacity-30">♫</span></div>
            <div className="flex items-end gap-[3px] h-28 w-full px-3">{[...Array(10)].map((_, i) => (<div key={i} className="flex-1 rounded-full" style={{ height: `${22+Math.sin(i*1.1)*22+18}%`, background: `linear-gradient(to top, ${['#a78bfa','#ff2d55','#fbbf24','#22d3ee'][i%4]}60, ${['#a78bfa','#ff2d55','#fbbf24','#22d3ee'][i%4]}15)`, animation: `rd-eq ${0.65+i*0.1}s ease-in-out infinite alternate`, animationDelay: `${i*0.08}s` }} />))}</div>
          </div>
          <div className="absolute left-[80px] top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(168,85,247,0.25) 30%, rgba(34,211,238,0.25) 70%, transparent 90%)' }} />
          <div className="absolute right-[80px] top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(34,211,238,0.25) 30%, rgba(251,191,36,0.25) 70%, transparent 90%)' }} />
        </div>

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
      <div className="flex items-center justify-center gap-5 px-5 py-2.5 bg-black/70 border-t border-white/[0.08] text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">★</span>
          <span className="text-yellow-300 font-bold">{displayStats.perfectHits}</span>
          <span className="text-white/25">Perfect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400">●</span>
          <span className="text-emerald-300 font-bold">{displayStats.goodHits}</span>
          <span className="text-white/25">Great</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400">○</span>
          <span className="text-cyan-300 font-bold">{displayStats.okHits}</span>
          <span className="text-white/25">OK</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400">✕</span>
          <span className="text-red-300 font-bold">{displayStats.misses}</span>
          <span className="text-white/25">Miss</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <span className={`font-bold ${accuracy >= 90 ? 'text-yellow-300' : accuracy >= 70 ? 'text-emerald-300' : 'text-white/50'}`}>{accuracy}%</span>
      </div>

      {/* PAUSE OVERLAY */}
      {paused && (
        <div className="absolute inset-0 z-[200] bg-black/70 flex items-center justify-center">
          <div className="bg-[#1a1a30]/95 rounded-2xl border border-purple-400/20 p-8 text-center shadow-2xl max-w-xs w-full mx-4">
            <div className="text-4xl mb-3">⏸️</div>
            <h3 className="text-2xl font-black text-white mb-1">PAUSA</h3>
            <p className="text-purple-200/60 text-sm mb-6">{beat.name} • {beat.tempo} BPM</p>
            <div className="flex flex-col gap-3">
              <button onClick={togglePause} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 active:scale-95 shadow-[0_4px_15px_rgba(34,211,238,0.3)] transition-all">▶ Continuar</button>
              <button onClick={handleRestart} className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold text-sm hover:bg-white/10 active:scale-95 transition-all">🔄 Reiniciar</button>
              <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-semibold text-sm hover:bg-red-500/20 active:scale-95 transition-all">✕ Salir</button>
            </div>
            <p className="text-white/30 text-[10px] mt-4">Presiona ESC para continuar</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
