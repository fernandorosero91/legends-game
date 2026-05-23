/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style
 * UI premium: HUD grande informativo, lanes anchas, feedback visual potente
 * Performance: Pure CSS positioning, no Framer on notes
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import type { Beat } from '../../data/songs';
import { getRhythmDifficulty } from '../../data/levels';

interface RhythmDropProps {
  beat: Beat;
  level: number;
  onComplete: (score: number, maxCombo: number, stats: { perfectHits: number; goodHits: number; okHits: number; misses: number }) => void;
  onCancel: () => void;
}

interface GameNote {
  id: string;
  lane: number;
  targetTime: number;
  hit: boolean;
  missed: boolean;
}

const KEYS = ['a', 's', 'd', 'f'];
const LANE_COLORS = ['#ff2d55', '#a78bfa', '#22d3ee', '#fbbf24'];
const LANE_GLOWS = ['rgba(255,45,85,0.6)', 'rgba(167,139,250,0.6)', 'rgba(34,211,238,0.6)', 'rgba(251,191,36,0.6)'];
const LANE_LABELS = ['A', 'S', 'D', 'F'];
const DURATION = 30000;
const FALL_TIME = 2200;

let ctx: AudioContext | null = null;
function beep(freq: number, dur = 0.08, vol = 0.15, wave: OscillatorType = 'sine') {
  if (!ctx) ctx = new AudioContext();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = freq; o.type = wave;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.start(); o.stop(ctx.currentTime + dur);
}

export function RhythmDrop({ beat, level, onComplete, onCancel }: RhythmDropProps) {
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState([false, false, false, false]);
  const [fb, setFb] = useState<{ text: string; color: string; id: number } | null>(null);

  const t0 = useRef(0);
  const raf = useRef(0);
  const notes = useRef<GameNote[]>([]);
  const st = useRef({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const sc = useRef(0);
  const co = useRef(0);
  const mx = useRef(0);
  const music = useRef<Howl | null>(null);

  // Generate notes
  useEffect(() => {
    const diff = getRhythmDifficulty(level);
    if (!diff) return;
    const bpm = beat.tempo || 120;
    const beatInterval = 60000 / bpm;
    const noteInterval = beatInterval / Math.max(1, diff.notesPerBeat * 0.7);
    const arr: GameNote[] = [];
    let time = 1500, id = 0;
    while (time < DURATION - 800) {
      arr.push({ id: `n${id++}`, lane: Math.floor(Math.random() * 4), targetTime: time, hit: false, missed: false });
      time += noteInterval;
    }
    notes.current = arr;
  }, [level, beat.tempo]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      t0.current = performance.now();
      music.current = new Howl({ src: ['/audio/inicio.mp3'], volume: 0.3, loop: true });
      music.current.play();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Game loop — render at 30fps for UI, notes move via refs
  const elapsedRef = useRef(0);
  const frameCount = useRef(0);
  
  useEffect(() => {
    if (phase !== 'playing') return;
    const loop = () => {
      const el = performance.now() - t0.current;
      elapsedRef.current = el;
      
      for (const n of notes.current) {
        if (!n.hit && !n.missed && n.targetTime < el - 280) { n.missed = true; st.current.misses++; co.current = 0; }
      }

      // Only update React state every other frame (~30fps) to reduce re-renders
      frameCount.current++;
      if (frameCount.current % 2 === 0) {
        setElapsed(el);
      }

      if (el >= DURATION) { music.current?.stop(); onComplete(sc.current, mx.current, st.current); return; }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, onComplete]);

  // Keyboard
  useEffect(() => {
    if (phase !== 'playing') return;
    const handle = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      setFlash(p => { const n = [...p]; n[lane] = true; return n; });
      setTimeout(() => setFlash(p => { const n = [...p]; n[lane] = false; return n; }), 120);

      const now = performance.now() - t0.current;
      const diff = getRhythmDifficulty(level);
      if (!diff) return;

      let best: GameNote | null = null, bestD = Infinity;
      for (const n of notes.current) {
        if (n.lane !== lane || n.hit || n.missed) continue;
        const d = Math.abs(n.targetTime - now);
        if (d < bestD && d <= diff.okWindow) { best = n; bestD = d; }
      }

      if (!best) {
        co.current = 0; st.current.misses++;
        setFb({ text: 'MISS', color: '#ff3b30', id: Date.now() }); beep(100, 0.1, 0.08, 'sawtooth');
      } else {
        best.hit = true;
        let pts: number, txt: string, col: string;
        if (bestD <= diff.perfectWindow) { pts = 100; txt = '★ PERFECT'; col = '#ffd60a'; st.current.perfectHits++; beep(1200); }
        else if (bestD <= diff.goodWindow) { pts = 75; txt = 'GREAT'; col = '#34d399'; st.current.goodHits++; beep(800); }
        else { pts = 50; txt = 'OK'; col: '#22d3ee'; st.current.okHits++; beep(500); col = '#22d3ee'; }

        co.current++;
        if (co.current > mx.current) mx.current = co.current;
        const mult = 1 + Math.floor(co.current / 10) * 0.1;
        sc.current += Math.floor(pts * mult);
        setFb({ text: txt, color: col, id: Date.now() });
      }

      setScore(sc.current); setCombo(co.current); setMaxCombo(mx.current); setStats({ ...st.current });
      setTimeout(() => setFb(null), 400);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, level]);

  useEffect(() => () => { music.current?.stop(); cancelAnimationFrame(raf.current); }, []);

  const progress = elapsed / DURATION;
  const timeLeft = Math.ceil((DURATION - elapsed) / 1000);
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits + stats.misses;
  const accuracy = totalHits > 0 ? Math.round(((stats.perfectHits + stats.goodHits + stats.okHits) / totalHits) * 100) : 100;

  // COUNTDOWN SCREEN
  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <motion.div 
          key={countdown} 
          initial={{ scale: 3, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-[120px] font-black text-white leading-none"
          style={{ textShadow: '0 0 80px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.4)' }}
        >
          {countdown}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-center">
          <p className="text-2xl font-bold text-white">{beat.name}</p>
          <p className="text-cyan-300/60 mt-2 text-sm">{beat.tempo} BPM • Nivel {level}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            {KEYS.map((k, i) => (
              <div key={k} className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-black border-2"
                style={{ borderColor: LANE_COLORS[i], color: LANE_COLORS[i], backgroundColor: `${LANE_COLORS[i]}15` }}>
                {k.toUpperCase()}
              </div>
            ))}
          </div>
          <p className="text-white/40 mt-4 text-xs">Presiona las teclas al ritmo</p>
        </motion.div>
      </motion.div>
    );
  }

  // Visible notes
  const visibleNotes = notes.current.filter(n => !n.hit && !n.missed && n.targetTime > elapsed - 200 && n.targetTime < elapsed + FALL_TIME + 100);

  return (
    <div className="relative z-10 w-full h-full flex flex-col">
      
      {/* Fondo oscuro semi-transparente para el área de juego */}
      <div className="absolute inset-0 bg-black/55" />

      {/* TOP HUD — grande e informativo */}
      <div className="relative shrink-0 px-5 py-3 bg-black/70 border-b border-white/[0.1]">
        <div className="flex items-center justify-between">
          {/* Left: Song info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-sm">🎹</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-none">{beat.name}</h3>
              <p className="text-cyan-300/50 text-[10px] mt-0.5">{beat.tempo} BPM • Nivel {level}</p>
            </div>
          </div>

          {/* Center: Progress + Time */}
          <div className="flex items-center gap-3 flex-1 max-w-[250px] mx-6">
            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-100" style={{ 
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #22d3ee, #a78bfa, #ff2d55)',
              }} />
            </div>
            <div className="text-right min-w-[40px]">
              <span className="text-white font-bold text-sm tabular-nums">{timeLeft}s</span>
            </div>
          </div>

          {/* Right: Score + Combo */}
          <div className="flex items-center gap-4">
            {combo > 4 && (
              <div className="text-center">
                <div className={`text-lg font-black leading-none ${combo >= 20 ? 'text-orange-300' : combo >= 10 ? 'text-cyan-300' : 'text-white/70'}`}>
                  {combo}x
                </div>
                <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Combo</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-lg font-black text-white leading-none tabular-nums">{score.toLocaleString()}</div>
              <div className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Score</div>
            </div>
            <button onClick={() => { music.current?.stop(); onCancel(); }} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs hover:bg-red-500/20 transition">✕</button>
          </div>
        </div>
      </div>

      {/* GAME AREA — lanes */}
      <div className="relative flex-1 flex justify-center gap-3 px-6 sm:px-20 lg:px-28 py-2 overflow-hidden">
        {[0, 1, 2, 3].map(lane => (
          <div key={lane} className="relative flex-1 max-w-28 rounded-2xl overflow-hidden transition-all duration-75"
            style={{ 
              background: `linear-gradient(180deg, ${LANE_COLORS[lane]}10, ${LANE_COLORS[lane]}05, ${LANE_COLORS[lane]}15)`, 
              border: `2px solid ${LANE_COLORS[lane]}${flash[lane] ? '80' : '25'}`,
              boxShadow: flash[lane] ? `inset 0 0 40px ${LANE_GLOWS[lane]}, 0 0 25px ${LANE_GLOWS[lane]}` : `inset 0 0 20px rgba(0,0,0,0.3)`,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}>
            
            {/* Lane label at top */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${LANE_COLORS[lane]}50` }}>
                {LANE_LABELS[lane]}
              </span>
            </div>

            {/* Hit zone — bottom glow area */}
            <div className="absolute bottom-0 left-0 right-0 h-16 transition-all duration-75" style={{
              background: flash[lane] 
                ? `linear-gradient(to top, ${LANE_COLORS[lane]}60, ${LANE_COLORS[lane]}20, transparent)` 
                : `linear-gradient(to top, ${LANE_COLORS[lane]}15, transparent)`,
              borderTop: `3px solid ${flash[lane] ? LANE_COLORS[lane] : LANE_COLORS[lane] + '30'}`,
            }} />

            {/* Notes */}
            {visibleNotes.filter(n => n.lane === lane).map(note => {
              const pct = (1 - (note.targetTime - elapsed) / FALL_TIME) * 86;
              if (pct < -5 || pct > 100) return null;
              return (
                <div key={note.id} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{
                    top: `${pct}%`, width: '75%', height: '24px', borderRadius: '10px',
                    background: `linear-gradient(135deg, ${LANE_COLORS[lane]}, ${LANE_COLORS[lane]}bb)`,
                    boxShadow: `0 0 12px ${LANE_GLOWS[lane]}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                    border: `1.5px solid ${LANE_COLORS[lane]}`,
                    willChange: 'top',
                  }}>
                  <div className="w-3 h-3 rounded-full bg-white/90 shadow-[0_0_6px_white]" />
                </div>
              );
            })}
          </div>
        ))}

        {/* Feedback text */}
        <AnimatePresence>
          {fb && (
            <motion.div key={fb.id} initial={{ opacity: 1, scale: 0.7, y: 0 }} animate={{ opacity: 0, scale: 1.5, y: -40 }} transition={{ duration: 0.4 }}
              className="absolute top-[30%] left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <span className="text-3xl font-black tracking-wider" style={{ color: fb.color, textShadow: `0 0 20px ${fb.color}, 0 0 40px ${fb.color}50` }}>{fb.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM — Keys + Stats */}
      <div className="relative shrink-0 bg-black/70 border-t border-white/[0.1]">
        {/* Key indicators */}
        <div className="flex justify-center gap-3 py-3">
          {KEYS.map((k, i) => (
            <div key={k} className="w-14 h-11 rounded-xl flex items-center justify-center text-base font-black transition-all duration-75"
              style={{
                background: flash[i] ? `${LANE_COLORS[i]}30` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${flash[i] ? LANE_COLORS[i] : 'rgba(255,255,255,0.08)'}`,
                color: flash[i] ? LANE_COLORS[i] : 'rgba(255,255,255,0.4)',
                boxShadow: flash[i] ? `0 0 20px ${LANE_GLOWS[i]}, inset 0 0 10px ${LANE_GLOWS[i]}` : 'none',
                transform: flash[i] ? 'scale(0.9) translateY(2px)' : 'scale(1)',
              }}>{k.toUpperCase()}</div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-5 py-2 border-t border-white/[0.04] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400">★</span>
            <span className="text-yellow-300 font-bold">{stats.perfectHits}</span>
            <span className="text-white/20">Perfect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span className="text-emerald-300 font-bold">{stats.goodHits}</span>
            <span className="text-white/20">Great</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">○</span>
            <span className="text-cyan-300 font-bold">{stats.okHits}</span>
            <span className="text-white/20">OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400">✕</span>
            <span className="text-red-300 font-bold">{stats.misses}</span>
            <span className="text-white/20">Miss</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${accuracy >= 90 ? 'text-yellow-300' : accuracy >= 70 ? 'text-emerald-300' : 'text-white/60'}`}>{accuracy}%</span>
            <span className="text-white/20">Acc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-orange-300 font-bold">{maxCombo}x</span>
            <span className="text-white/20">Best</span>
          </div>
        </div>
      </div>
    </div>
  );
}
