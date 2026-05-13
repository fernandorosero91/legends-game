/**
 * 🎮 LEGENDS: Rhythm Drop — Guitar Hero Style Minigame
 * Notas caen por 4 carriles, presiona A/S/D/F al ritmo
 * Diseño ultra-profesional con efectos visuales y audio feedback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
const LANE_COLORS = ['#ff4757', '#3742fa', '#2ed573', '#ffa502'];
const LANE_GLOW = ['rgba(255,71,87,0.4)', 'rgba(55,66,250,0.4)', 'rgba(46,213,115,0.4)', 'rgba(255,165,2,0.4)'];
const GAME_DURATION = 30000;
const VISIBLE_WINDOW = 2500;

// Audio feedback (sintetizado con Web Audio)
let audioCtx: AudioContext | null = null;
function playHitSound(accuracy: 'perfect' | 'good' | 'ok') {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const freqs = { perfect: 880, good: 660, ok: 440 };
  osc.frequency.value = freqs[accuracy];
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function playMissSound() {
  if (!audioCtx) audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 150;
  osc.type = 'sawtooth';
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

export function RhythmDrop({ beat, level, onComplete, onCancel }: RhythmDropProps) {
  const [notes, setNotes] = useState<GameNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [stats, setStats] = useState({ perfectHits: 0, goodHits: 0, okHits: 0, misses: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ lane: number; type: string } | null>(null);
  const [laneFlash, setLaneFlash] = useState<number[]>([]);

  const startTimeRef = useRef(0);
  const animRef = useRef(0);
  const notesRef = useRef<GameNote[]>([]);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>();
  const bgMusic = useRef<Howl | null>(null);

  // Generate notes based on difficulty
  useEffect(() => {
    const difficulty = getRhythmDifficulty(level);
    if (!difficulty) return;

    const generated: GameNote[] = [];
    const interval = 600 / difficulty.noteSpeed;
    const totalNotes = Math.floor(GAME_DURATION / (interval * 1000) * difficulty.notesPerBeat * 2);

    for (let i = 0; i < totalNotes; i++) {
      const time = 1000 + (i * interval * 500 / difficulty.notesPerBeat);
      if (time > GAME_DURATION - 500) break;
      generated.push({
        id: `n-${i}`,
        lane: Math.floor(Math.random() * 4),
        targetTime: time,
        hit: false,
        missed: false,
      });
    }

    notesRef.current = generated;
    setNotes(generated);
  }, [level]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) {
      setStarted(true);
      startTimeRef.current = performance.now();
      // Start background music
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
      const now = performance.now();
      const el = now - startTimeRef.current;
      setElapsed(el);

      // Check missed notes
      const updated = notesRef.current.map(note => {
        if (!note.hit && !note.missed && note.targetTime < el - 200) {
          return { ...note, missed: true };
        }
        return note;
      });

      const newMisses = updated.filter(n => n.missed && !notesRef.current.find(on => on.id === n.id && on.missed));
      if (newMisses.length > 0) {
        setCombo(0);
        setStats(s => ({ ...s, misses: s.misses + newMisses.length }));
        playMissSound();
      }

      notesRef.current = updated;
      setNotes([...updated]);

      if (el >= GAME_DURATION) {
        bgMusic.current?.stop();
        const finalStats = { ...stats, misses: stats.misses + newMisses.length };
        onComplete(score, maxCombo, finalStats);
        return;
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [started]);

  // Keyboard input
  useEffect(() => {
    if (!started) return;

    const handleKey = (e: KeyboardEvent) => {
      const lane = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;

      const currentTime = performance.now() - startTimeRef.current;
      const difficulty = getRhythmDifficulty(level);
      if (!difficulty) return;

      // Find closest unhit note in this lane
      const note = notesRef.current.find(
        n => n.lane === lane && !n.hit && !n.missed && Math.abs(n.targetTime - currentTime) <= difficulty.okWindow
      );

      // Flash the lane
      setLaneFlash(prev => [...prev, lane]);
      setTimeout(() => setLaneFlash(prev => prev.filter(l => l !== lane)), 150);

      if (!note) {
        setCombo(0);
        setStats(s => ({ ...s, misses: s.misses + 1 }));
        setFeedback({ lane, type: 'miss' });
        playMissSound();
      } else {
        const diff = Math.abs(note.targetTime - currentTime);
        let accuracy: 'perfect' | 'good' | 'ok';
        let points: number;

        if (diff <= difficulty.perfectWindow) {
          accuracy = 'perfect'; points = 100;
          setStats(s => ({ ...s, perfectHits: s.perfectHits + 1 }));
        } else if (diff <= difficulty.goodWindow) {
          accuracy = 'good'; points = 75;
          setStats(s => ({ ...s, goodHits: s.goodHits + 1 }));
        } else {
          accuracy = 'ok'; points = 50;
          setStats(s => ({ ...s, okHits: s.okHits + 1 }));
        }

        const newCombo = combo + 1;
        const multiplier = 1 + Math.floor(newCombo / 10) * 0.1;
        const finalPoints = Math.floor(points * multiplier);

        note.hit = true;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        setScore(s => s + finalPoints);
        setFeedback({ lane, type: accuracy });
        playHitSound(accuracy);
      }

      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(null), 400);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started, combo, maxCombo, level, score, stats]);

  // Cleanup
  useEffect(() => {
    return () => {
      bgMusic.current?.stop();
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const progress = elapsed / GAME_DURATION;
  const totalHits = stats.perfectHits + stats.goodHits + stats.okHits;
  const totalAttempts = totalHits + stats.misses;
  const accuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 100;

  // Countdown screen
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 text-center"
      >
        <motion.div
          key={countdown}
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-8xl font-black text-white drop-shadow-2xl"
          style={{ textShadow: '0 0 40px rgba(168,85,247,0.8)' }}
        >
          {countdown}
        </motion.div>
        <p className="text-purple-300 text-lg mt-4 font-medium">{beat.name}</p>
        <p className="text-white/40 text-sm mt-1">Prepárate... usa A, S, D, F</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 w-full h-full flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold">🎹 {beat.name}</span>
          <span className="text-white/40 text-xs">{beat.style.toUpperCase()} • {beat.tempo} BPM</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 flex-1 max-w-xs mx-8">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-white/60 text-xs font-mono w-8">{Math.ceil((GAME_DURATION - elapsed) / 1000)}s</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Score</div>
            <div className="text-white font-black text-lg tabular-nums">{score.toLocaleString()}</div>
          </div>
          <button onClick={() => { bgMusic.current?.stop(); onCancel(); }} className="text-red-400/80 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-400/40 transition-all">
            ✕
          </button>
        </div>
      </div>

      {/* Combo & Accuracy */}
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-lg border ${combo >= 20 ? 'border-orange-400/40 bg-orange-500/10' : combo > 0 ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
            <span className="text-white/40 text-[10px] uppercase">Combo</span>
            <span className={`ml-2 font-black text-lg ${combo >= 20 ? 'text-orange-300' : combo > 0 ? 'text-white' : 'text-white/30'}`}>
              {combo}x
            </span>
            {combo >= 10 && <span className="ml-1 text-xs text-cyan-400">×{(1 + Math.floor(combo / 10) * 0.1).toFixed(1)}</span>}
          </div>
          {combo >= 20 && <span className="text-xl animate-bounce">🔥</span>}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-yellow-300">★{stats.perfectHits}</span>
          <span className="text-green-300">●{stats.goodHits}</span>
          <span className="text-blue-300">○{stats.okHits}</span>
          <span className="text-red-300">✕{stats.misses}</span>
          <div className={`px-2 py-0.5 rounded font-bold ${accuracy >= 90 ? 'text-yellow-300 bg-yellow-500/10' : accuracy >= 70 ? 'text-green-300 bg-green-500/10' : 'text-white/60 bg-white/5'}`}>
            {accuracy}%
          </div>
        </div>
      </div>

      {/* Game area — 4 lanes */}
      <div className="flex-1 flex items-stretch justify-center gap-2 px-4 sm:px-16 py-2 relative">
        {[0, 1, 2, 3].map(lane => (
          <div key={lane} className="relative flex-1 max-w-24 rounded-xl overflow-hidden" style={{ background: `linear-gradient(to bottom, ${LANE_COLORS[lane]}05, ${LANE_COLORS[lane]}02, ${LANE_COLORS[lane]}08)`, border: `1px solid ${LANE_COLORS[lane]}15` }}>
            
            {/* Lane lines */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: LANE_COLORS[lane] }} />
            </div>

            {/* Hit zone */}
            <div
              className="absolute bottom-0 left-0 right-0 h-14 transition-all duration-75"
              style={{
                background: laneFlash.includes(lane)
                  ? `linear-gradient(to top, ${LANE_COLORS[lane]}40, transparent)`
                  : `linear-gradient(to top, ${LANE_COLORS[lane]}15, transparent)`,
                borderTop: `2px solid ${laneFlash.includes(lane) ? LANE_COLORS[lane] : LANE_COLORS[lane] + '30'}`,
                boxShadow: laneFlash.includes(lane) ? `0 0 30px ${LANE_GLOW[lane]}` : 'none',
              }}
            />

            {/* Notes */}
            {notes.filter(n => n.lane === lane && !n.hit && !n.missed).map(note => {
              const timeUntil = note.targetTime - elapsed;
              const pct = 1 - (timeUntil / VISIBLE_WINDOW);
              if (pct < -0.1 || pct > 1.1) return null;
              const top = pct * 85;

              return (
                <motion.div
                  key={note.id}
                  className="absolute left-1/2 -translate-x-1/2 w-12 h-5 rounded-lg flex items-center justify-center"
                  style={{
                    top: `${top}%`,
                    background: `linear-gradient(135deg, ${LANE_COLORS[lane]}, ${LANE_COLORS[lane]}aa)`,
                    boxShadow: `0 0 15px ${LANE_GLOW[lane]}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/80" style={{ boxShadow: `0 0 8px white` }} />
                </motion.div>
              );
            })}

            {/* Hit feedback */}
            <AnimatePresence>
              {feedback?.lane === lane && (
                <motion.div
                  key={`fb-${Date.now()}`}
                  initial={{ opacity: 1, scale: 0.5, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, y: -30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <span className={`text-xs font-black ${
                    feedback.type === 'perfect' ? 'text-yellow-300' :
                    feedback.type === 'good' ? 'text-green-300' :
                    feedback.type === 'ok' ? 'text-blue-300' : 'text-red-400'
                  }`}>
                    {feedback.type === 'perfect' ? '★ PERFECT' : feedback.type === 'good' ? '● GOOD' : feedback.type === 'ok' ? '○ OK' : '✕ MISS'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Key indicators */}
      <div className="flex justify-center gap-2 px-4 pb-4">
        {LANE_KEYS.map((key, i) => (
          <div
            key={key}
            className="w-16 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-75"
            style={{
              background: laneFlash.includes(i) ? `${LANE_COLORS[i]}30` : 'rgba(255,255,255,0.03)',
              border: `2px solid ${laneFlash.includes(i) ? LANE_COLORS[i] : 'rgba(255,255,255,0.08)'}`,
              boxShadow: laneFlash.includes(i) ? `0 0 20px ${LANE_GLOW[i]}` : 'none',
              color: laneFlash.includes(i) ? LANE_COLORS[i] : 'rgba(255,255,255,0.5)',
            }}
          >
            {key.toUpperCase()}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
