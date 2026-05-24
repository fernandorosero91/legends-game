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
    @keyframes rd-fb{
      0%{opacity:1;transform:translate(-50%,0) scale(0.6);filter:blur(0)}
      30%{transform:translate(-50%,-10px) scale(1.3);filter:blur(0)}
      100%{opacity:0;transform:translate(-50%,-60px) scale(1.6);filter:blur(2px)}
    }
    @keyframes rd-pt{
      0%{opacity:1;transform:translate(0,0) scale(1.3)}
      100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0.2) rotate(var(--r))}
    }
    @keyframes rd-ring{
      0%{opacity:0.8;transform:translate(-50%,-50%) scale(0.3);border-width:4px}
      100%{opacity:0;transform:translate(-50%,-50%) scale(2.5);border-width:1px}
    }
    @keyframes rd-streak{
      0%{opacity:0.6;transform:translateY(0) scaleY(1)}
      100%{opacity:0;transform:translateY(-40px) scaleY(2)}
    }
    @keyframes rd-glow-pulse{
      0%,100%{opacity:0.3}
      50%{opacity:0.7}
    }
    .rd-note{position:absolute;left:50%;transform:translateX(-50%);width:72%;height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;will-change:top;transition:opacity 0.05s}
    .rd-note::after{content:'';width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.95);box-shadow:0 0 6px rgba(255,255,255,0.8)}
    .rd-fb{position:absolute;left:50%;top:25%;pointer-events:none;z-index:50;font-size:36px;font-weight:900;letter-spacing:2px;animation:rd-fb .55s cubic-bezier(0.22,1,0.36,1) forwards;white-space:nowrap}
    .rd-pt{position:absolute;pointer-events:none;z-index:40;font-weight:bold;animation:rd-pt .8s cubic-bezier(0.25,0.46,0.45,0.94) forwards}
    .rd-ring{position:absolute;pointer-events:none;z-index:45;width:80px;height:80px;border-radius:50%;border:4px solid;left:50%;top:50%;transform:translate(-50%,-50%) scale(0.3);animation:rd-ring .5s ease-out forwards}
    .rd-streak{position:absolute;pointer-events:none;z-index:35;width:3px;border-radius:2px;animation:rd-streak .4s ease-out forwards}
    @keyframes rd-eq{0%{height:30%}100%{height:80%}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
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
  const [paused, setPaused] = useState(false);

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
  const pauseTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const statsRef = useRef({ perfect: 0, good: 0, ok: 0, miss: 0 });
  const doneRef = useRef(false);
  const pausedRef = useRef(false);

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
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
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
      if (e.key === 'Escape') {
        togglePause();
        return;
      }
      if (e.repeat || doneRef.current || pausedRef.current) return;
      const lane = KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      // Flash lane — intense glow
      const laneEl = lanesRef.current[lane];
      if (laneEl) {
        laneEl.style.borderColor = LANE_COLORS[lane];
        laneEl.style.boxShadow = `inset 0 0 40px ${LANE_COLORS[lane]}50, 0 0 20px ${LANE_COLORS[lane]}40, 0 0 40px ${LANE_COLORS[lane]}20`;
        laneEl.style.background = `linear-gradient(180deg, ${LANE_COLORS[lane]}15, rgba(0,0,0,0.3), ${LANE_COLORS[lane]}20)`;
        setTimeout(() => {
          laneEl.style.borderColor = `${LANE_COLORS[lane]}25`;
          laneEl.style.boxShadow = '';
          laneEl.style.background = `linear-gradient(180deg, ${LANE_COLORS[lane]}06, rgba(0,0,0,0.4), ${LANE_COLORS[lane]}0a)`;
        }, 100);
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

    // Feedback text + shockwave ring on perfect
    function showFb(text: string, color: string) {
      const c = containerRef.current;
      if (!c) return;
      // Text
      const el = document.createElement('div');
      el.className = 'rd-fb';
      el.style.color = color;
      el.style.textShadow = `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}50`;
      el.textContent = text;
      c.appendChild(el);
      setTimeout(() => el.remove(), 600);
    }

    // Particles + shockwave + streaks
    function spawnPt(lane: number, color: string, pts: number) {
      const c = containerRef.current;
      if (!c) return;
      const laneEl = lanesRef.current[lane];
      if (!laneEl) return;
      const laneRect = laneEl.getBoundingClientRect();
      const containerRect = c.getBoundingClientRect();
      const cx = laneRect.left - containerRect.left + laneRect.width / 2;
      const cy = laneRect.bottom - containerRect.top - 50;

      // Musical note particles
      const syms = ['♪', '♫', '✦', '★', '♬', '🎵'];
      const count = pts >= 100 ? 6 : pts >= 75 ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'rd-pt';
        el.textContent = syms[Math.floor(Math.random() * syms.length)];
        el.style.left = `${cx + (Math.random() - 0.5) * 30}px`;
        el.style.top = `${cy}px`;
        el.style.color = color;
        el.style.fontSize = `${22 + Math.random() * 14}px`;
        el.style.textShadow = `0 0 12px ${color}, 0 0 24px ${color}`;
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 140}px`);
        el.style.setProperty('--dy', `${-80 - Math.random() * 100}px`);
        el.style.setProperty('--r', `${(Math.random() - 0.5) * 360}deg`);
        c.appendChild(el);
        setTimeout(() => el.remove(), 850);
      }

      // Shockwave ring on PERFECT
      if (pts >= 100) {
        const ring = document.createElement('div');
        ring.className = 'rd-ring';
        ring.style.borderColor = color;
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        ring.style.boxShadow = `0 0 15px ${color}, inset 0 0 15px ${color}50`;
        c.appendChild(ring);
        setTimeout(() => ring.remove(), 550);
      }

      // Streak lines shooting up
      if (pts >= 75) {
        const streakCount = pts >= 100 ? 4 : 2;
        for (let i = 0; i < streakCount; i++) {
          const streak = document.createElement('div');
          streak.className = 'rd-streak';
          streak.style.left = `${cx + (Math.random() - 0.5) * 40}px`;
          streak.style.top = `${cy - 10}px`;
          streak.style.height = `${20 + Math.random() * 30}px`;
          streak.style.background = `linear-gradient(to top, ${color}, transparent)`;
          c.appendChild(streak);
          setTimeout(() => streak.remove(), 450);
        }
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

  // Pause/Resume
  function togglePause() {
    if (pausedRef.current) {
      // Resume — adjust t0 to account for paused time
      const pausedDuration = performance.now() - pauseTimeRef.current;
      t0.current += pausedDuration;
      pausedRef.current = false;
      musicRef.current?.play();
      setPaused(false);
    } else {
      pausedRef.current = true;
      pauseTimeRef.current = performance.now();
      musicRef.current?.pause();
      setPaused(true);
    }
  }

  // Restart
  function handleRestart() {
    // Stop everything
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    musicRef.current?.stop();
    pausedRef.current = false;
    setPaused(false);
    // Reset to countdown
    setPhase('countdown');
    setCountdown(3);
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    statsRef.current = { perfect: 0, good: 0, ok: 0, miss: 0 };
    doneRef.current = false;
    // Notes will be regenerated by useEffect
    for (const n of notesRef.current) { n.el?.remove(); }
    notesRef.current = [];
  }

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
      
      {/* Background decorations — immersive studio ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Gradient ambient background — more colorful */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 85%, rgba(99,102,241,0.12) 0%, transparent 45%), radial-gradient(ellipse at 15% 30%, rgba(255,45,85,0.08) 0%, transparent 35%), radial-gradient(ellipse at 85% 30%, rgba(34,211,238,0.08) 0%, transparent 35%), radial-gradient(ellipse at 50% 10%, rgba(167,139,250,0.06) 0%, transparent 40%)' }} />

        {/* LEFT PANEL — full height, wider */}
        <div className="absolute left-0 top-8 bottom-8 w-24 flex flex-col items-center justify-between py-6 gap-4">
          {/* Large EQ bars */}
          <div className="flex items-end gap-[3px] h-40 w-full px-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: `${25 + Math.sin(i * 0.7) * 25 + 25}%`,
                background: `linear-gradient(to top, ${LANE_COLORS[i % 4]}, ${LANE_COLORS[i % 4]}30)`,
                animation: `rd-eq ${0.5 + i * 0.08}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.06}s`,
              }} />
            ))}
          </div>
          
          {/* Spinning vinyl */}
          <div className="w-16 h-16 rounded-full border-[3px] border-purple-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]" style={{ animation: 'spin 3s linear infinite' }}>
            <div className="w-10 h-10 rounded-full border-2 border-purple-300/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400/60 to-pink-400/60" />
            </div>
          </div>

          {/* Music icons — larger, more visible */}
          <div className="flex flex-col items-center gap-4 text-2xl">
            <span className="opacity-30 drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]">🎵</span>
            <span className="opacity-25 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]">🎧</span>
            <span className="opacity-30 drop-shadow-[0_0_4px_rgba(255,45,85,0.5)]">🎤</span>
            <span className="opacity-25 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">♫</span>
          </div>

          {/* Bottom large EQ */}
          <div className="flex items-end gap-[3px] h-32 w-full px-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: `${20 + Math.cos(i * 0.9) * 20 + 20}%`,
                background: `linear-gradient(to top, ${LANE_COLORS[(i + 2) % 4]}, ${LANE_COLORS[(i + 2) % 4]}25)`,
                animation: `rd-eq ${0.6 + i * 0.09}s ease-in-out infinite alternate-reverse`,
                animationDelay: `${i * 0.07}s`,
              }} />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — full height, wider */}
        <div className="absolute right-0 top-8 bottom-8 w-24 flex flex-col items-center justify-between py-6 gap-4">
          {/* Large EQ bars */}
          <div className="flex items-end gap-[3px] h-40 w-full px-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: `${30 + Math.cos(i * 0.6) * 20 + 20}%`,
                background: `linear-gradient(to top, ${LANE_COLORS[(i + 1) % 4]}, ${LANE_COLORS[(i + 1) % 4]}30)`,
                animation: `rd-eq ${0.55 + i * 0.09}s ease-in-out infinite alternate-reverse`,
                animationDelay: `${i * 0.05}s`,
              }} />
            ))}
          </div>
          
          {/* Waveform circle — larger */}
          <div className="w-16 h-16 rounded-full border-[3px] border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <svg width="36" height="36" viewBox="0 0 36 36" className="opacity-50">
              <path d="M2,18 Q6,6 10,18 Q14,30 18,18 Q22,6 26,18 Q30,30 34,18" fill="none" stroke="#22d3ee" strokeWidth="2"/>
            </svg>
          </div>

          {/* Music icons — larger */}
          <div className="flex flex-col items-center gap-4 text-2xl">
            <span className="opacity-30 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">🎹</span>
            <span className="opacity-25 drop-shadow-[0_0_4px_rgba(48,209,88,0.5)]">🎶</span>
            <span className="opacity-30 drop-shadow-[0_0_4px_rgba(167,139,250,0.5)]">🎙️</span>
            <span className="opacity-25 drop-shadow-[0_0_4px_rgba(255,159,10,0.5)]">♬</span>
          </div>

          {/* Bottom EQ */}
          <div className="flex items-end gap-[3px] h-32 w-full px-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{
                height: `${22 + Math.sin(i * 1.1) * 22 + 18}%`,
                background: `linear-gradient(to top, ${LANE_COLORS[(i + 3) % 4]}, ${LANE_COLORS[(i + 3) % 4]}25)`,
                animation: `rd-eq ${0.65 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        </div>

        {/* Horizontal waveforms — wider, more visible */}
        <svg className="absolute left-24 right-24 top-[12%] h-6 opacity-25" preserveAspectRatio="none" viewBox="0 0 500 24">
          <path d="M0,12 Q20,3 40,12 Q60,21 80,12 Q100,3 120,12 Q140,21 160,12 Q180,3 200,12 Q220,21 240,12 Q260,3 280,12 Q300,21 320,12 Q340,3 360,12 Q380,21 400,12 Q420,3 440,12 Q460,21 480,12 Q500,6 500,12" fill="none" stroke="url(#waveGrad1)" strokeWidth="1.5"/>
          <defs><linearGradient id="waveGrad1"><stop offset="0%" stopColor="#ff2d55"/><stop offset="50%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
        </svg>
        <svg className="absolute left-24 right-24 bottom-[15%] h-6 opacity-20" preserveAspectRatio="none" viewBox="0 0 500 24">
          <path d="M0,12 Q25,4 50,12 Q75,20 100,12 Q125,4 150,12 Q175,20 200,12 Q225,4 250,12 Q275,20 300,12 Q325,4 350,12 Q375,20 400,12 Q425,4 450,12 Q475,20 500,12" fill="none" stroke="url(#waveGrad2)" strokeWidth="1.5"/>
          <defs><linearGradient id="waveGrad2"><stop offset="0%" stopColor="#22d3ee"/><stop offset="50%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#ff2d55"/></linearGradient></defs>
        </svg>

        {/* Neon vertical separators */}
        <div className="absolute left-[96px] top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(168,85,247,0.3) 30%, rgba(255,45,85,0.3) 50%, rgba(34,211,238,0.3) 70%, transparent 90%)' }} />
        <div className="absolute right-[96px] top-0 bottom-0 w-[2px]" style={{ background: 'linear-gradient(to bottom, transparent 10%, rgba(34,211,238,0.3) 30%, rgba(251,191,36,0.3) 50%, rgba(167,139,250,0.3) 70%, transparent 90%)' }} />
      </div>
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
            <button onClick={togglePause} className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px] hover:bg-white/20" title="Pausar (Esc)">⏸</button>
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

      {/* PAUSE OVERLAY */}
      {paused && (
        <div className="absolute inset-0 z-[200] bg-black/70 flex items-center justify-center">
          <div className="bg-[#1a1a30]/95 rounded-2xl border border-purple-400/20 p-8 text-center shadow-2xl max-w-xs w-full mx-4">
            <div className="text-4xl mb-3">⏸️</div>
            <h3 className="text-2xl font-black text-white mb-1">PAUSA</h3>
            <p className="text-purple-200/60 text-sm mb-6">{beat.name} • {beat.tempo} BPM</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={togglePause}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 active:scale-95 shadow-[0_4px_15px_rgba(34,211,238,0.3)] transition-all"
              >
                ▶ Continuar
              </button>
              <button 
                onClick={handleRestart}
                className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold text-sm hover:bg-white/10 active:scale-95 transition-all"
              >
                🔄 Reiniciar
              </button>
              <button 
                onClick={() => { doneRef.current = true; musicRef.current?.stop(); cancelAnimationFrame(rafRef.current); onCancel(); }}
                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-semibold text-sm hover:bg-red-500/20 active:scale-95 transition-all"
              >
                ✕ Salir
              </button>
            </div>
            
            <p className="text-white/30 text-[10px] mt-4">Presiona ESC para continuar</p>
          </div>
        </div>
      )}
    </div>
  );
}
