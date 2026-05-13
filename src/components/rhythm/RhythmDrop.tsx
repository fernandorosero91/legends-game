/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style Minigame
 * Notas caen por 4 carriles brillantes. Presiona A/S/D/F cuando lleguen abajo.
 * Diseño vibrante con neon, partículas y feedback visual intenso.
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

const LANE_KEYS = ['a', 's', 'd', 'f'];
const LANE_COLORS = ['#ff2d55', '#5856d6', '#30d158', '#ff9f0a'];
const LANE_BG = ['rgba(255,45,85,0.12)', 'rgba(88,86,214,0.12)', 'rgba(48,209,88,0.12)', 'rgba(255,159,10,0.12)'];
const LANE_GLOW = ['0 0 25px rgba(255,45,85,0.6)', '0 0 25px rgba(88,86,214,0.6)', '0 0 25px rgba(48,209,88,0.6)', '0 0 25px rgba(255,159,10,0.6)'];
const GAME_DURATION = 30000;
const NOTE_TRAVEL_TIME = 2000; // Notes take 2s to fall from top to hit zone

// Web Audio for instant feedback
let audioCtx: AudioContext | null = null;
function playHit(type: 'perfect' | 'good' | 'ok' | 'miss') {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const config = {
    perfect: { freq: 1200, vol: 0.2, dur: 0.08, wave: 'sine' as OscillatorType },
    good: { freq: 800, vol: 0.15, dur: 0.08, wave: 'sine' as OscillatorType },
    ok: { freq: 500, vol: 0.12, dur: 0.08, wave: 'triangle' as OscillatorType },
    miss: { freq: 120, vol: 0.08, dur: 0.12, wave: 'sawtooth' as OscillatorType },
  }[type];
  osc.frequency.value = config.freq;
  osc.type = config.wave;
  gain.gain.setValueAtTime(config.vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + config.dur);
  osc.start();
  osc.stop(audioCtx.currentTime + config.dur);
}

export function RhythmDrop({ beat, level, onComplete, onCancel }: RhythmDropProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [laneFlash, setLaneFlash] = useState<boolean[]>([false, false, false, false]);
  const [feedbackText, setFeedbackText] = useState<{ text: string; color: string; key: number } | null>(null);
  const [visibleNotes, setVisibleNotes] = useState<GameNote[]>([]);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const notesRef = useRef<GameNote[]>([]);
  const statsRef = useRef({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const bgMusic = useRef<Howl | null>(null);

  // Generate notes
  useEffect(() => {
    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    const generated: GameNote[] = [];
    // Generate notes at regular intervals based on BPM
    const bpm = beat.tempo || 120;
    const beatInterval = 60000 / bpm; // ms per beat
    const notesPerBeat = difficulty.notesPerBeat;
    const noteInterval = beatInterval / notesPerBeat;
    
    let time = 1500; // Start 1.5s in
    let id = 0;
    while (time < GAME_DURATION - 1000) {
      generated.push({
        id: `n${id++}`,
        lane: Math.floor(Math.random() * 4),
        targetTime: time,
        hit: false,
        missed: false,
      });
      time += noteInterval;
    }

    console.log(`[RhythmDrop] Generated ${generated.length} notes for level ${level}, BPM ${bpm}`);
    notesRef.current = generated;
  }, [level, beat.tempo]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = performance.now();
      bgMusic.current = new Howl({ src: ['/audio/inicio.mp3'], volume: 0.3, loop: true });
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

      // Mark missed notes
      let newMissCount = 0;
      for (const note of notesRef.current) {
        if (!note.hit && !note.missed && note.targetTime < el - 250) {
          note.missed = true;
          newMissCount++;
        }
      }
      if (newMissCount > 0) {
        comboRef.current = 0;
        setCombo(0);
        statsRef.current.misses += newMissCount;
        setStats({ ...statsRef.current });
      }

      // Get visible notes (within travel window)
      const visible = notesRef.current.filter(
        n => !n.hit && !n.missed && n.targetTime > el - 300 && n.targetTime < el + NOTE_TRAVEL_TIME + 200
      );
      setVisibleNotes(visible);

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
      const lane = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      // Flash lane
      setLaneFlash(prev => { const n = [...prev]; n[lane] = true; return n; });
      setTimeout(() => setLaneFlash(prev => { const n = [...prev]; n[lane] = false; return n; }), 120);

      const currentTime = performance.now() - startTimeRef.current;
      const difficulty = getRhythmDifficulty(level);
      if (!difficulty) return;

      // Find closest note in lane
      let closest: GameNote | null = null;
      let closestDiff = Infinity;
      for (const note of notesRef.current) {
        if (note.lane !== lane || note.hit || note.missed) continue;
        const d = Math.abs(note.targetTime - currentTime);
        if (d < closestDiff && d <= difficulty.okWindow) {
          closest = note;
          closestDiff = d;
        }
      }

      if (!closest) {
        comboRef.current = 0;
        setCombo(0);
        statsRef.current.misses++;
        setStats({ ...statsRef.current });
        setFeedbackText({ text: 'MISS', color: '#ff3b30', key: Date.now() });
        playHit('miss');
        return;
      }

      closest.hit = true;
      let accuracy: 'perfect' | 'good' | 'ok';
      let points: number;
      let text: string;
      let color: string;

      if (closestDiff <= difficulty.perfectWindow) {
        accuracy = 'perfect'; points = 100; text = '✦ PERFECT'; color = '#ffd60a';
        statsRef.current.perfectHits++;
      } else if (closestDiff <= difficulty.goodWindow) {
        accuracy = 'good'; points = 75; text = 'GREAT'; color = '#30d158';
        statsRef.current.goodHits++;
      } else {
        accuracy = 'ok'; points = 50; text = 'OK'; color = '#64d2ff';
        statsRef.current.okHits++;
      }

      comboRef.current++;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      const multiplier = 1 + Math.floor(comboRef.current / 10) * 0.1;
      const finalPoints = Math.floor(points * multiplier);

      scoreRef.current += finalPoints;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setStats({ ...statsRef.current });
      setFeedbackText({ text, color, key: Date.now() });
      playHit(accuracy);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, level]);

  // Cleanup
  useEffect(() => () => { bgMusic.current?.stop(); cancelAnimationFrame(animRef.current); }, []);

  const progress = elapsed / GAME_DURATION;

  // Countdown
  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center">
        <motion.div key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          className="text-9xl font-black text-white" style={{ textShadow: '0 0 60px #a855f7, 0 0 120px #7c3aed' }}>
          {countdown}
        </motion.div>
        <p className="text-purple-200 text-xl mt-6 font-semibold">{beat.name}</p>
        <p className="text-white/50 text-sm mt-2">Presiona <span className="text-white font-bold">A S D F</span> cuando las notas lleguen abajo</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full h-full flex flex-col bg-gradient-to-b from-[#1a0533] via-[#0d001a] to-[#000]">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-black/50 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">🎹 {beat.name}</span>
          <span className="text-white/30 text-xs">{beat.tempo} BPM</span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[200px] mx-6">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <span className="text-white/50 text-xs font-mono">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase">Score</div>
            <div className="text-white font-black text-base tabular-nums">{score.toLocaleString()}</div>
          </div>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xs hover:bg-red-500/30 transition">✕</button>
        </div>
      </div>

      {/* Combo bar */}
      <div className="flex items-center justify-between px-5 py-1.5">
        <div className="flex items-center gap-2">
          {combo > 0 && (
            <motion.div key={combo} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: combo >= 20 ? 'rgba(255,159,10,0.15)' : 'rgba(168,85,247,0.1)', border: `1px solid ${combo >= 20 ? 'rgba(255,159,10,0.4)' : 'rgba(168,85,247,0.3)'}` }}>
              {combo >= 20 && <span className="animate-pulse">🔥</span>}
              <span className={`font-black text-sm ${combo >= 20 ? 'text-orange-300' : 'text-purple-300'}`}>{combo}x</span>
              {combo >= 10 && <span className="text-[10px] text-cyan-300 font-bold">×{(1 + Math.floor(combo / 10) * 0.1).toFixed(1)}</span>}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-yellow-300">★{stats.perfectHits}</span>
          <span className="text-green-300">●{stats.goodHits}</span>
          <span className="text-cyan-300">○{stats.okHits}</span>
          <span className="text-red-400">✕{stats.misses}</span>
        </div>
      </div>

      {/* GAME AREA */}
      <div className="flex-1 flex justify-center gap-1 sm:gap-2 px-2 sm:px-8 relative overflow-hidden">
        {[0, 1, 2, 3].map(lane => (
          <div key={lane} className="relative flex-1 max-w-20 sm:max-w-28" style={{ background: LANE_BG[lane], borderRadius: '12px', border: `1px solid ${LANE_COLORS[lane]}20` }}>
            
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px opacity-20" style={{ background: LANE_COLORS[lane] }} />

            {/* Hit zone at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-xl transition-all duration-75" style={{
              background: laneFlash[lane]
                ? `linear-gradient(to top, ${LANE_COLORS[lane]}50, ${LANE_COLORS[lane]}10, transparent)`
                : `linear-gradient(to top, ${LANE_COLORS[lane]}20, transparent)`,
              borderTop: `3px solid ${laneFlash[lane] ? LANE_COLORS[lane] : LANE_COLORS[lane] + '40'}`,
              boxShadow: laneFlash[lane] ? LANE_GLOW[lane] : 'none',
            }}>
              {/* Pulse ring on flash */}
              {laneFlash[lane] && (
                <motion.div initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full" style={{ border: `2px solid ${LANE_COLORS[lane]}` }} />
              )}
            </div>

            {/* NOTES */}
            {visibleNotes.filter(n => n.lane === lane).map(note => {
              const timeUntil = note.targetTime - elapsed;
              const progress = 1 - (timeUntil / NOTE_TRAVEL_TIME);
              const topPct = Math.max(0, Math.min(100, progress * 88)); // 88% = hit zone position

              return (
                <div
                  key={note.id}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{
                    top: `${topPct}%`,
                    width: '80%',
                    height: '24px',
                    background: `linear-gradient(135deg, ${LANE_COLORS[lane]}, ${LANE_COLORS[lane]}cc)`,
                    borderRadius: '8px',
                    boxShadow: `0 0 12px ${LANE_COLORS[lane]}80, 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)`,
                    border: `1px solid ${LANE_COLORS[lane]}`,
                  }}
                >
                  <div className="w-3 h-3 rounded-full bg-white" style={{ boxShadow: '0 0 6px white' }} />
                </div>
              );
            })}
          </div>
        ))}

        {/* Center feedback text */}
        <AnimatePresence>
          {feedbackText && (
            <motion.div
              key={feedbackText.key}
              initial={{ opacity: 1, scale: 0.8, y: 0 }}
              animate={{ opacity: 0, scale: 1.4, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
            >
              <span className="text-2xl font-black drop-shadow-lg" style={{ color: feedbackText.color, textShadow: `0 0 20px ${feedbackText.color}` }}>
                {feedbackText.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Key indicators */}
      <div className="flex justify-center gap-2 px-4 py-3 bg-black/30">
        {LANE_KEYS.map((key, i) => (
          <div key={key} className="w-14 h-11 rounded-xl flex items-center justify-center text-base font-black transition-all duration-75"
            style={{
              background: laneFlash[i] ? `${LANE_COLORS[i]}40` : 'rgba(255,255,255,0.04)',
              border: `2px solid ${laneFlash[i] ? LANE_COLORS[i] : 'rgba(255,255,255,0.1)'}`,
              color: laneFlash[i] ? LANE_COLORS[i] : 'rgba(255,255,255,0.5)',
              boxShadow: laneFlash[i] ? LANE_GLOW[i] : 'none',
              transform: laneFlash[i] ? 'scale(0.92)' : 'scale(1)',
            }}>
            {key.toUpperCase()}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
