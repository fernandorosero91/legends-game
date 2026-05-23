/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style
 * ZERO-LAG ARCHITECTURE: Everything visual is direct DOM.
 * React only renders the static HUD shell once.
 * Game loop + notes + feedback + particles = all RAF + DOM.
 */

import { useState, useEffect, useRef } from 'react';
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
  lane: number;
  targetTime: number;
  hit: boolean;
  missed: boolean;
  el: HTMLDivElement | null;
}

const KEYS = ['a', 's', 'd', 'f'];
const LANE_COLORS = ['#ff2d55', '#a78bfa', '#22d3ee', '#fbbf24'];
const DURATION = 30000;
const FALL_TIME = 2000;

// Inject styles once
const STYLE_ID = 'rd-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes rd-fb{0%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-40px) scale(1.4)}}
    @keyframes rd-pt{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0.3) rotate(var(--r))}}
    .rd-note{position:absolute;left:50%;transform:translateX(-50%);width:72%;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;will-change:top}
    .rd-note::after{content:'';width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.9)}
    .rd-fb{position:absolute;left:50%;top:28%;pointer-events:none;z-index:50;font-size:28px;font-weight:900;letter-spacing:1px;animation:rd-fb .4s ease-out forwards;white-space:nowrap}
    .rd-pt{position:absolute;pointer-events:none;z-index:40;font-weight:bold;animation:rd-pt .65s ease-out forwards}
  `;
  document.head.appendChild(s);
}

let audioCtx: AudioContext | null = null;
function beep(freq: number, dur = 0.05, vol = 0.1, wave: OscillatorType = 'sine') {
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

  const containerRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement[]>([]);
  const scoreElRef = useRef<HTMLSpanElement>(null);
  const comboElRef = useRef<HTMLSpanElement>(null);
  const timeElRef = useRef<HTMLSpanElement>(null);
  const progressElRef = useRef<HTMLDivElement>(null);
  const statsElRef = useRef<HTMLDivElement>(null);

  const notesRef = useRef<GameNote[]>([]);
  const musicRef = useRef<Howl | null>(null);
  const rafRef = useRef(0);
  const t0 = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const statsRef = useRef({ perfect: 0, good: 0, ok: 0, miss: 0 });
  const doneRef = useRef(false);

  // Generate notes
  useEffect(() => {
    const diff = getRhythmDifficulty(level);
    if (!diff) return;
    const bpm = beat.tempo || 120;
    const interval = (60000 / bpm) / Math.max(1, diff.notesPerBeat * 0.7);
    const arr: GameNote[] = [];
    let time = 1500;
    while (time < DURATION - 800) {
      arr.push({ lane: Math.floor(Math.random() * 4), targetTime: time, hit: false, missed: false, el: null });
      time += interval;
    }
    notesRef.current = arr;
  }, [level, beat.tempo]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // START GAME — all game logic runs in ONE useEffect, pure DOM
  useEffect(() => {
    if (phase !== 'playing') return;

    t0.current = performance.now();
    doneRef.current = false;
    musicRef.current = new Howl({ src: [beat.audioFile], volume: 0.35, loop: true });
    musicRef.current.play();

    // Create note DOM elements and append to lanes
    const notes = notesRef.current;
    for (const note of notes) {
      const el = document.createElement('div');
      el.className = 'rd-note';
      el.style.background = `linear-gradient(135deg, ${LANE_COLORS[note.lane]}, ${LANE_COLORS[note.lane]}aa)`;
      el.style.border = `1.5px solid ${LANE_COLORS[note.lane]}`;
      el.style.boxShadow = `0 0 8px ${LANE_COLORS[note.lane]}60`;
      el.style.top = '-30px';
      el.style.display = 'none';
      const laneEl = lanesRef.current[note.lane];
      if (laneEl) laneEl.appendChild(el);
      note.el = el;
    }

    // GAME LOOP — pure RAF, zero React
    const loop = () => {
      if (doneRef.current) return;
      const el = performance.now() - t0.current;

      // Position notes
      for (const n of notes) {
        if (n.hit || n.missed) {
          if (n.el && n.el.style.display !== 'none') n.el.style.display = 'none';
          continue;
        }
        const timeDiff = n.targetTime - el;
        if (timeDiff > FALL_TIME || timeDiff < -300) {
          if (timeDiff < -300) {
            n.missed = true;
            statsRef.current.miss++;
            comboRef.current = 0;
            if (n.el) n.el.style.display = 'none';
          } else if (n.el) {
            n.el.style.display = 'none';
          }
          continue;
        }
        const pct = (1 - timeDiff / FALL_TIME) * 86;
        if (n.el) {
          n.el.style.display = 'flex';
          n.el.style.top = `${pct}%`;
        }
      }

      // Update HUD elements directly
      if (scoreElRef.current) scoreElRef.current.textContent = scoreRef.current.toLocaleString();
      if (comboElRef.current) {
        comboElRef.current.textContent = comboRef.current > 4 ? `${comboRef.current}x` : '';
        comboElRef.current.style.color = comboRef.current >= 20 ? '#fdba74' : '#67e8f9';
      }
      const timeLeft = Math.max(0, Math.ceil((DURATION - el) / 1000));
      if (timeElRef.current) timeElRef.current.textContent = `${timeLeft}s`;
      if (progressElRef.current) progressElRef.current.style.width = `${(el / DURATION) * 100}%`;
      if (statsElRef.current) {
        statsElRef.current.textContent = `★${statsRef.current.perfect}  ●${statsRef.current.good}  ○${statsRef.current.ok}  ✕${statsRef.current.miss}`;
      }

      // End
      if (el >= DURATION) {
        doneRef.current = true;
        musicRef.current?.stop();
        onComplete(scoreRef.current, maxComboRef.current, {
          perfectHits: statsRef.current.perfect,
          goodHits: statsRef.current.good,
          okHits: statsRef.current.ok,
          misses: statsRef.current.miss,
        });
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // KEYBOARD
    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat || doneRef.current) return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      // Flash lane
      const laneEl = lanesRef.current[lane];
      if (laneEl) {
        laneEl.style.borderColor = LANE_COLORS[lane];
        laneEl.style.boxShadow = `inset 0 0 25px ${LANE_COLORS[lane]}40, 0 0 12px ${LANE_COLORS[lane]}40`;
        setTimeout(() => {
          laneEl.style.borderColor = `${LANE_COLORS[lane]}25`;
          laneEl.style.boxShadow = '';
        }, 90);
      }

      const now = performance.now() - t0.current;
      const diff = getRhythmDifficulty(level);
      if (!diff) return;

      let best: GameNote | null = null, bestD = Infinity;
      for (const n of notes) {
        if (n.lane !== lane || n.hit || n.missed) continue;
        const d = Math.abs(n.targetTime - now);
        if (d < bestD && d <= diff.okWindow) { best = n; bestD = d; }
      }

      if (!best) {
        comboRef.current = 0;
        statsRef.current.miss++;
        showFb('MISS', '#ff3b30');
        beep(100, 0.06, 0.06, 'sawtooth');
      } else {
        best.hit = true;
        if (best.el) best.el.style.display = 'none';
        let pts: number, txt: string, col: string;
        if (bestD <= diff.perfectWindow) { pts = 100; txt = '★ PERFECT'; col = '#ffd60a'; statsRef.current.perfect++; beep(1200); }
        else if (bestD <= diff.goodWindow) { pts = 75; txt = 'GREAT'; col = '#34d399'; statsRef.current.good++; beep(800); }
        else { pts = 50; txt = 'OK'; col = '#22d3ee'; statsRef.current.ok++; beep(500); }

        comboRef.current++;
        if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
        scoreRef.current += Math.floor(pts * (1 + Math.floor(comboRef.current / 10) * 0.1));

        showFb(txt, col);
        spawnPt(lane, col, pts);
      }
    };
    window.addEventListener('keydown', handleKey);

    // Feedback text
    function showFb(text: string, color: string) {
      const c = containerRef.current;
      if (!c) return;
      const el = document.createElement('div');
      el.className = 'rd-fb';
      el.style.color = color;
      el.style.textShadow = `0 0 15px ${color}, 0 0 30px ${color}`;
      el.textContent = text;
      c.appendChild(el);
      setTimeout(() => el.remove(), 450);
    }

    // Particles
    function spawnPt(lane: number, color: string, pts: number) {
      const c = containerRef.current;
      if (!c) return;
      const syms = ['♪', '♫', '✦', '★'];
      const count = pts >= 100 ? 3 : pts >= 75 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'rd-pt';
        el.textContent = syms[Math.floor(Math.random() * syms.length)];
        el.style.left = `${20 + lane * 20}%`;
        el.style.bottom = '50px';
        el.style.color = color;
        el.style.fontSize = `${20 + Math.random() * 8}px`;
        el.style.textShadow = `0 0 8px ${color}`;
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
        el.style.setProperty('--dy', `${-50 - Math.random() * 60}px`);
        el.style.setProperty('--r', `${(Math.random() - 0.5) * 200}deg`);
        c.appendChild(el);
        setTimeout(() => el.remove(), 700);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(rafRef.current);
      musicRef.current?.stop();
      // Cleanup note elements
      for (const n of notes) { n.el?.remove(); }
    };
  }, [phase, level, beat, onComplete, onCancel]);

  // COUNTDOWN
  if (phase === 'countdown') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full h-full flex flex-col items-center justify-center bg-black/60">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          className="text-[120px] font-black text-white leading-none"
          style={{ textShadow: '0 0 60px rgba(34,211,238,0.7)' }}>
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

  // PLAYING — static shell, all movement is DOM-direct
  return (
    <div className="relative z-10 w-full h-full flex flex-col bg-[#0a0a15]">
      {/* HUD — static, updated via refs */}
      <div className="shrink-0 px-5 py-2 bg-[#0d0d18] border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">🎹</span>
            <span className="text-white font-bold text-sm">{beat.name}</span>
            <span className="text-white/30 text-[10px]">{beat.tempo}</span>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-[200px] mx-4">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div ref={progressElRef} className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg, #22d3ee, #a78bfa, #ff2d55)' }} />
            </div>
            <span ref={timeElRef} className="text-white font-bold text-sm tabular-nums">30s</span>
          </div>
          <div className="flex items-center gap-3">
            <span ref={comboElRef} className="text-lg font-black text-cyan-300"></span>
            <span ref={scoreElRef} className="text-lg font-black text-white tabular-nums">0</span>
            <button onClick={() => { doneRef.current = true; musicRef.current?.stop(); cancelAnimationFrame(rafRef.current); onCancel(); }} className="w-6 h-6 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-[10px]">✕</button>
          </div>
        </div>
      </div>

      {/* GAME AREA */}
      <div ref={containerRef} className="relative flex-1 flex justify-center gap-2 px-4 sm:px-12 lg:px-20 py-1 overflow-hidden">
        {[0, 1, 2, 3].map(lane => (
          <div
            key={lane}
            ref={el => { if (el) lanesRef.current[lane] = el; }}
            className="relative flex-1 max-w-24 rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${LANE_COLORS[lane]}06, rgba(0,0,0,0.4), ${LANE_COLORS[lane]}0a)`,
              border: `2px solid ${LANE_COLORS[lane]}25`,
              transition: 'border-color 0.08s, box-shadow 0.08s',
            }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold" style={{ color: `${LANE_COLORS[lane]}35` }}>{KEYS[lane].toUpperCase()}</div>
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: `linear-gradient(to top, ${LANE_COLORS[lane]}10, transparent)`, borderTop: `2px solid ${LANE_COLORS[lane]}20` }} />
          </div>
        ))}
      </div>

      {/* BOTTOM STATS */}
      <div className="shrink-0 bg-[#0d0d18] border-t border-white/[0.08] py-2 text-center">
        <div className="flex justify-center gap-3 mb-1">
          {KEYS.map((k, i) => (
            <div key={k} className="w-11 h-8 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ border: `1.5px solid ${LANE_COLORS[i]}20`, color: `${LANE_COLORS[i]}60` }}>{k.toUpperCase()}</div>
          ))}
        </div>
        <div ref={statsElRef} className="text-[11px] text-white/60 font-mono">★0  ●0  ○0  ✕0</div>
      </div>
    </div>
  );
}
