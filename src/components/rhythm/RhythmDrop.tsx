/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style (Performance Optimized)
 * NO Framer Motion on notes — pure CSS for 60fps.
 * Notes fall smoothly using top% calculated each frame.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
const COLORS = ['#ff2d55', '#5856d6', '#30d158', '#ff9f0a'];
const GLOWS = ['rgba(255,45,85,0.5)', 'rgba(88,86,214,0.5)', 'rgba(48,209,88,0.5)', 'rgba(255,159,10,0.5)'];
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
  const [renderTick, setRenderTick] = useState(0);

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
    const interval = (60000 / bpm) / diff.notesPerBeat;
    const arr: GameNote[] = [];
    let time = 1500, id = 0;
    while (time < DURATION - 800) {
      arr.push({ id: `n${id++}`, lane: Math.floor(Math.random() * 4), targetTime: time, hit: false, missed: false });
      time += interval;
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

  // Game loop — lightweight, no state updates for notes
  useEffect(() => {
    if (phase !== 'playing') return;
    let lastRender = 0;

    const loop = () => {
      const el = performance.now() - t0.current;
      setElapsed(el);

      // Mark missed
      let miss = 0;
      for (const n of notes.current) {
        if (!n.hit && !n.missed && n.targetTime < el - 280) { n.missed = true; miss++; }
      }
      if (miss > 0) { co.current = 0; setCombo(0); st.current.misses += miss; setStats({ ...st.current }); }

      // Trigger re-render every 2 frames for note positions (performance)
      const now = performance.now();
      if (now - lastRender > 16) { setRenderTick(t => t + 1); lastRender = now; }

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

      // Flash
      setFlash(p => { const n = [...p]; n[lane] = true; return n; });
      setTimeout(() => setFlash(p => { const n = [...p]; n[lane] = false; return n; }), 100);

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
        co.current = 0; setCombo(0); st.current.misses++; setStats({ ...st.current });
        setFb({ text: 'MISS', color: '#ff3b30', id: Date.now() }); beep(100, 0.1, 0.08, 'sawtooth');
      } else {
        best.hit = true;
        let pts: number, txt: string, col: string;
        if (bestD <= diff.perfectWindow) { pts = 100; txt = '✦ PERFECT'; col = '#ffd60a'; st.current.perfectHits++; beep(1200); }
        else if (bestD <= diff.goodWindow) { pts = 75; txt = 'GREAT'; col = '#30d158'; st.current.goodHits++; beep(800); }
        else { pts = 50; txt = 'OK'; col = '#64d2ff'; st.current.okHits++; beep(500); }

        co.current++;
        if (co.current > mx.current) mx.current = co.current;
        const mult = 1 + Math.floor(co.current / 10) * 0.1;
        sc.current += Math.floor(pts * mult);

        setScore(sc.current); setCombo(co.current); setMaxCombo(mx.current); setStats({ ...st.current });
        setFb({ text: txt, color: col, id: Date.now() });
      }
      setTimeout(() => setFb(null), 350);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, level]);

  useEffect(() => () => { music.current?.stop(); cancelAnimationFrame(raf.current); }, []);

  const progress = elapsed / DURATION;

  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
        <motion.div key={countdown} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          className="text-9xl font-black text-white" style={{ textShadow: '0 0 60px #a855f7' }}>{countdown}</motion.div>
        <p className="text-purple-200 text-xl mt-6 font-semibold">{beat.name}</p>
        <p className="text-white/50 mt-2">Presiona <b className="text-white">A S D F</b> al ritmo</p>
      </motion.div>
    );
  }

  // Visible notes (no framer motion — pure divs)
  const visibleNotes = notes.current.filter(n => !n.hit && !n.missed && n.targetTime > elapsed - 200 && n.targetTime < elapsed + FALL_TIME + 100);

  return (
    <div className="relative z-10 w-full h-full flex flex-col bg-gradient-to-b from-[#1a0533] via-[#0d001a] to-black">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">🎹 {beat.name}</span>
          <span className="text-white/30 text-xs">{beat.tempo} BPM</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[180px] mx-4">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/50 text-[10px] font-mono">{Math.ceil((DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-3">
          {combo > 0 && <span className={`font-black text-sm ${combo >= 20 ? 'text-orange-300' : 'text-purple-300'}`}>{combo}x{combo >= 20 ? '🔥' : ''}</span>}
          <span className="text-white font-black tabular-nums">{score.toLocaleString()}</span>
          <button onClick={() => { music.current?.stop(); onCancel(); }} className="text-red-400 text-xs px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/10">✕</button>
        </div>
      </div>

      {/* LANES */}
      <div className="flex-1 flex justify-center gap-1 px-2 sm:px-12 py-1 relative overflow-hidden">
        {[0, 1, 2, 3].map(lane => (
          <div key={lane} className="relative flex-1 max-w-24 rounded-xl overflow-hidden"
            style={{ background: `linear-gradient(180deg, ${COLORS[lane]}08, ${COLORS[lane]}04, ${COLORS[lane]}12)`, border: `1px solid ${COLORS[lane]}20` }}>
            
            {/* Hit zone */}
            <div className="absolute bottom-0 left-0 right-0 h-14 transition-all duration-[60ms]" style={{
              background: flash[lane] ? `linear-gradient(to top, ${COLORS[lane]}50, transparent)` : `linear-gradient(to top, ${COLORS[lane]}18, transparent)`,
              borderTop: `3px solid ${flash[lane] ? COLORS[lane] : COLORS[lane] + '40'}`,
              boxShadow: flash[lane] ? `0 0 30px ${GLOWS[lane]}` : 'none',
            }} />

            {/* Notes — pure CSS, no framer */}
            {visibleNotes.filter(n => n.lane === lane).map(note => {
              const pct = (1 - (note.targetTime - elapsed) / FALL_TIME) * 88;
              if (pct < -5 || pct > 100) return null;
              return (
                <div key={note.id} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{
                    top: `${pct}%`, width: '78%', height: '22px', borderRadius: '8px',
                    background: `linear-gradient(135deg, ${COLORS[lane]}, ${COLORS[lane]}bb)`,
                    boxShadow: `0 0 10px ${GLOWS[lane]}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                    border: `1px solid ${COLORS[lane]}`,
                    willChange: 'top',
                  }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
                </div>
              );
            })}
          </div>
        ))}

        {/* Feedback */}
        <AnimatePresence>
          {fb && (
            <motion.div key={fb.id} initial={{ opacity: 1, scale: 0.8 }} animate={{ opacity: 0, scale: 1.3, y: -30 }} transition={{ duration: 0.35 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50">
              <span className="text-2xl font-black" style={{ color: fb.color, textShadow: `0 0 15px ${fb.color}` }}>{fb.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keys */}
      <div className="flex justify-center gap-2 py-3 bg-black/40 shrink-0">
        {KEYS.map((k, i) => (
          <div key={k} className="w-14 h-10 rounded-xl flex items-center justify-center text-base font-black transition-all duration-[60ms]"
            style={{
              background: flash[i] ? `${COLORS[i]}35` : 'rgba(255,255,255,0.04)',
              border: `2px solid ${flash[i] ? COLORS[i] : 'rgba(255,255,255,0.1)'}`,
              color: flash[i] ? COLORS[i] : 'rgba(255,255,255,0.5)',
              boxShadow: flash[i] ? `0 0 15px ${GLOWS[i]}` : 'none',
              transform: flash[i] ? 'scale(0.92)' : 'scale(1)',
            }}>{k.toUpperCase()}</div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-4 py-1.5 bg-black/50 text-xs font-bold shrink-0">
        <span className="text-yellow-300">★{stats.perfectHits}</span>
        <span className="text-green-300">●{stats.goodHits}</span>
        <span className="text-cyan-300">○{stats.okHits}</span>
        <span className="text-red-400">✕{stats.misses}</span>
      </div>
    </div>
  );
}
