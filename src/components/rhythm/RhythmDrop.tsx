/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style
 * ARCHITECTURE: Zero-lag game loop.
 * - ALL visual feedback uses direct DOM manipulation (no React re-renders)
 * - React state only updates every 150ms for HUD numbers
 * - Notes positioned via refs, not state
 * - CSS @keyframes for all particle effects
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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
const DURATION = 30000;
const FALL_TIME = 2200;

// Inject CSS keyframes once
const STYLE_ID = 'rhythm-drop-fx';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes rd-particle {
      0% { opacity:1; transform: translate(0,0) scale(1.2) rotate(0deg); }
      100% { opacity:0; transform: translate(var(--dx), var(--dy)) scale(0.2) rotate(var(--rot)); }
    }
    @keyframes rd-feedback {
      0% { opacity:1; transform: translate(-50%,0) scale(0.8); }
      100% { opacity:0; transform: translate(-50%,-50px) scale(1.8); }
    }
    @keyframes rd-flash {
      0% { opacity:0.7; }
      100% { opacity:0; }
    }
    .rd-particle { animation: rd-particle 0.75s cubic-bezier(0.25,0.46,0.45,0.94) forwards; position:fixed; pointer-events:none; z-index:200; font-weight:bold; }
    .rd-feedback { animation: rd-feedback 0.45s ease-out forwards; position:absolute; pointer-events:none; z-index:100; white-space:nowrap; }
    .rd-flash { animation: rd-flash 0.12s ease-out forwards; position:absolute; inset:0; border-radius:16px; pointer-events:none; }
  `;
  document.head.appendChild(style);
}

let audioCtx: AudioContext | null = null;
function beep(freq: number, dur = 0.06, vol = 0.12, wave: OscillatorType = 'sine') {
  if (!audioCtx) audioCtx = new AudioContext();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.frequency.value = freq; o.type = wave;
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.start(); o.stop(audioCtx.currentTime + dur);
}

export function RhythmDrop({ beat, level, onComplete, onCancel }: RhythmDropProps) {
  const [phase, setPhase] = useState<'countdown' | 'playing'>('countdown');
  const [countdown, setCountdown] = useState(3);
  
  // HUD state — updated every 150ms, NOT per frame
  const [hud, setHud] = useState({ score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, ok: 0, miss: 0, elapsed: 0 });

  // All fast-changing data in refs
  const t0 = useRef(0);
  const raf = useRef(0);
  const hudInterval = useRef(0);
  const notesRef = useRef<GameNote[]>([]);
  const statsRef = useRef({ perfect: 0, good: 0, ok: 0, miss: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const elapsedRef = useRef(0);
  const musicRef = useRef<Howl | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<(HTMLDivElement | null)[]>([]);
  const completedRef = useRef(false);

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
    notesRef.current = arr;
  }, [level, beat.tempo]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      t0.current = performance.now();
      musicRef.current = new Howl({ src: [beat.audioFile], volume: 0.35, loop: true });
      musicRef.current.play();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // GAME LOOP — pure RAF, zero React state updates
  useEffect(() => {
    if (phase !== 'playing') return;

    const loop = () => {
      const el = performance.now() - t0.current;
      elapsedRef.current = el;

      // Mark missed notes
      for (const n of notesRef.current) {
        if (!n.hit && !n.missed && n.targetTime < el - 280) {
          n.missed = true;
          statsRef.current.miss++;
          comboRef.current = 0;
        }
      }

      // End check
      if (el >= DURATION && !completedRef.current) {
        completedRef.current = true;
        musicRef.current?.stop();
        onComplete(scoreRef.current, maxComboRef.current, {
          perfectHits: statsRef.current.perfect,
          goodHits: statsRef.current.good,
          okHits: statsRef.current.ok,
          misses: statsRef.current.miss,
        });
        return;
      }

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    // HUD updates at ~7fps (every 150ms) — cheap
    hudInterval.current = window.setInterval(() => {
      setHud({
        score: scoreRef.current,
        combo: comboRef.current,
        maxCombo: maxComboRef.current,
        perfect: statsRef.current.perfect,
        good: statsRef.current.good,
        ok: statsRef.current.ok,
        miss: statsRef.current.miss,
        elapsed: elapsedRef.current,
      });
    }, 150);

    return () => {
      cancelAnimationFrame(raf.current);
      clearInterval(hudInterval.current);
    };
  }, [phase, onComplete]);

  // KEYBOARD — zero React state for visuals, DOM-only feedback
  useEffect(() => {
    if (phase !== 'playing') return;

    const handle = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      // Visual flash via DOM (no setState)
      const laneEl = lanesRef.current[lane];
      if (laneEl) {
        const flash = document.createElement('div');
        flash.className = 'rd-flash';
        flash.style.background = `linear-gradient(to top, ${LANE_COLORS[lane]}50, transparent)`;
        laneEl.appendChild(flash);
        setTimeout(() => flash.remove(), 130);
      }

      const now = performance.now() - t0.current;
      const diff = getRhythmDifficulty(level);
      if (!diff) return;

      // Find closest note
      let best: GameNote | null = null, bestD = Infinity;
      for (const n of notesRef.current) {
        if (n.lane !== lane || n.hit || n.missed) continue;
        const d = Math.abs(n.targetTime - now);
        if (d < bestD && d <= diff.okWindow) { best = n; bestD = d; }
      }

      if (!best) {
        comboRef.current = 0;
        statsRef.current.miss++;
        showFeedback('MISS', '#ff3b30');
        beep(100, 0.08, 0.08, 'sawtooth');
      } else {
        best.hit = true;
        let pts: number, txt: string, col: string;
        if (bestD <= diff.perfectWindow) { pts = 100; txt = '★ PERFECT'; col = '#ffd60a'; statsRef.current.perfect++; beep(1200); }
        else if (bestD <= diff.goodWindow) { pts = 75; txt = 'GREAT'; col = '#34d399'; statsRef.current.good++; beep(800); }
        else { pts = 50; txt = 'OK'; col = '#22d3ee'; statsRef.current.ok++; beep(500); }

        comboRef.current++;
        if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
        const mult = 1 + Math.floor(comboRef.current / 10) * 0.1;
        scoreRef.current += Math.floor(pts * mult);

        showFeedback(txt, col);
        spawnParticles(lane, col, pts);
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, level]);

  // DOM feedback text (no React)
  function showFeedback(text: string, color: string) {
    const area = gameAreaRef.current;
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'rd-feedback';
    el.style.cssText = `left:50%;top:30%;color:${color};font-size:32px;font-weight:900;letter-spacing:2px;text-shadow:0 0 20px ${color},0 0 40px ${color}`;
    el.textContent = text;
    area.appendChild(el);
    setTimeout(() => el.remove(), 500);
  }

  // DOM particles (no React)
  function spawnParticles(lane: number, color: string, pts: number) {
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const symbols = ['♪', '♫', '✦', '★', '♬'];
    const count = pts >= 100 ? 4 : pts >= 75 ? 3 : 2;
    const laneX = rect.left + rect.width * (0.2 + lane * 0.2);
    const baseY = rect.bottom - 70;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'rd-particle';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const dx = (Math.random() - 0.5) * 120;
      const dy = -80 - Math.random() * 100;
      const rot = (Math.random() - 0.5) * 360;
      el.style.cssText += `left:${laneX}px;top:${baseY}px;color:${color};font-size:${26 + Math.random() * 14}px;text-shadow:0 0 12px ${color},0 0 24px ${color};--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  }

  // Cleanup
  useEffect(() => () => {
    musicRef.current?.stop();
    cancelAnimationFrame(raf.current);
    clearInterval(hudInterval.current);
  }, []);

  // Derived values from hud state
  const progress = hud.elapsed / DURATION;
  const timeLeft = Math.max(0, Math.ceil((DURATION - hud.elapsed) / 1000));
  const totalHits = hud.perfect + hud.good + hud.ok + hud.miss;
  const accuracy = totalHits > 0 ? Math.round(((hud.perfect + hud.good + hud.ok) / totalHits) * 100) : 100;

  // COUNTDOWN
  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          className="text-[120px] font-black text-white leading-none"
          style={{ textShadow: '0 0 80px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.4)' }}>
          {countdown}
        </motion.div>
        <div className="mt-8 text-center">
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
        </div>
      </motion.div>
    );
  }

  // PLAYING — Notes render via NoteRenderer (separate component to isolate re-renders)
  return (
    <div className="relative z-10 w-full h-full flex flex-col">
      <div className="absolute inset-0 bg-black/55" />

      {/* HUD */}
      <div className="relative shrink-0 px-5 py-2.5 bg-black/70 border-b border-white/[0.1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xs">🎹</div>
            <div>
              <h3 className="text-white font-bold text-sm leading-none">{beat.name}</h3>
              <p className="text-cyan-300/40 text-[10px]">{beat.tempo} BPM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-[220px] mx-6">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #22d3ee, #a78bfa, #ff2d55)' }} />
            </div>
            <span className="text-white font-bold text-sm tabular-nums min-w-[28px] text-right">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-4">
            {hud.combo > 4 && <span className={`text-lg font-black ${hud.combo >= 20 ? 'text-orange-300' : 'text-cyan-300'}`}>{hud.combo}x</span>}
            <span className="text-lg font-black text-white tabular-nums">{hud.score.toLocaleString()}</span>
            <button onClick={() => { musicRef.current?.stop(); onCancel(); }} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs">✕</button>
          </div>
        </div>
      </div>

      {/* GAME AREA */}
      <div ref={gameAreaRef} className="relative flex-1 flex justify-center gap-3 px-6 sm:px-16 lg:px-24 py-1 overflow-hidden">
        {/* Combo glow */}
        {hud.combo >= 10 && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: hud.combo >= 20
              ? 'radial-gradient(ellipse at 50% 100%, rgba(255,150,0,0.15) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.08) 0%, transparent 50%)',
          }} />
        )}

        {[0, 1, 2, 3].map(lane => (
          <div
            key={lane}
            ref={el => { lanesRef.current[lane] = el; }}
            className="relative flex-1 max-w-28 rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${LANE_COLORS[lane]}08, rgba(0,0,0,0.35), ${LANE_COLORS[lane]}10)`,
              border: `2px solid ${LANE_COLORS[lane]}25`,
            }}
          >
            {/* Lane label */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
              <span className="text-[10px] font-bold" style={{ color: `${LANE_COLORS[lane]}40` }}>{KEYS[lane].toUpperCase()}</span>
            </div>

            {/* Hit zone */}
            <div className="absolute bottom-0 left-0 right-0 h-14" style={{
              background: `linear-gradient(to top, ${LANE_COLORS[lane]}12, transparent)`,
              borderTop: `2px solid ${LANE_COLORS[lane]}30`,
            }} />

            {/* Notes — rendered inline, positioned by elapsed from hud (updates at 7fps for position, smooth enough with will-change) */}
            <NoteRenderer notes={notesRef.current} lane={lane} elapsed={hud.elapsed} color={LANE_COLORS[lane]} glow={LANE_GLOWS[lane]} />
          </div>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="relative shrink-0 bg-black/70 border-t border-white/[0.1]">
        <div className="flex justify-center gap-3 py-2.5">
          {KEYS.map((k, i) => (
            <div key={k} className="w-13 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: 'rgba(255,255,255,0.03)', border: `2px solid ${LANE_COLORS[i]}25`, color: `${LANE_COLORS[i]}70` }}>
              {k.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 py-1.5 border-t border-white/[0.04] text-[11px]">
          <span className="text-yellow-300 font-bold">★{hud.perfect}</span>
          <span className="text-emerald-300 font-bold">●{hud.good}</span>
          <span className="text-cyan-300 font-bold">○{hud.ok}</span>
          <span className="text-red-300 font-bold">✕{hud.miss}</span>
          <span className="text-white/30">|</span>
          <span className={`font-bold ${accuracy >= 90 ? 'text-yellow-300' : accuracy >= 70 ? 'text-emerald-300' : 'text-white/50'}`}>{accuracy}%</span>
          <span className="text-orange-300 font-bold">{hud.maxCombo}x best</span>
        </div>
      </div>
    </div>
  );
}

/** Isolated note renderer — only re-renders when elapsed changes (every 150ms) */
function NoteRenderer({ notes, lane, elapsed, color, glow }: { notes: GameNote[]; lane: number; elapsed: number; color: string; glow: string }) {
  const visible = notes.filter(n => n.lane === lane && !n.hit && !n.missed && n.targetTime > elapsed - 200 && n.targetTime < elapsed + FALL_TIME + 100);
  
  return (
    <>
      {visible.map(note => {
        const pct = (1 - (note.targetTime - elapsed) / FALL_TIME) * 86;
        if (pct < -5 || pct > 100) return null;
        return (
          <div key={note.id} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{
              top: `${pct}%`, width: '72%', height: '22px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              boxShadow: `0 0 10px ${glow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
              border: `1.5px solid ${color}`,
              willChange: 'top',
            }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
          </div>
        );
      })}
    </>
  );
}
