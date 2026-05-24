/**
 * LEGENDS: CashierGame — Minijuego "Cajero Express"
 * Caja registradora visual con pantalla LED, teclado y ticket.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { useAudioStore } from '../../store/audioStore';

// ─── Sonidos ─────────────────────────────────────────────
function playAudio(src: string, volume = 1) {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (_) {}
}

// ─── Productos ───────────────────────────────────────────
const PRODUCT_POOL = [
  { name: 'Leche', emoji: '🥛', color: '#e0f0ff' },
  { name: 'Pan', emoji: '🍞', color: '#f5e6c8' },
  { name: 'Manzanas', emoji: '🍎', color: '#ffe0e0' },
  { name: 'Pollo', emoji: '🍗', color: '#fff0d0' },
  { name: 'Arroz', emoji: '🍚', color: '#f8f8f0' },
  { name: 'Jugo', emoji: '🧃', color: '#e8ffe0' },
  { name: 'Huevos', emoji: '🥚', color: '#fff8e0' },
  { name: 'Queso', emoji: '🧀', color: '#fff5c0' },
  { name: 'Bananas', emoji: '🍌', color: '#fffde0' },
  { name: 'Agua', emoji: '💧', color: '#e0f8ff' },
  { name: 'Papas', emoji: '🥔', color: '#f0e8d8' },
  { name: 'Refresco', emoji: '🥤', color: '#ffe0f0' },
  { name: 'Pasta', emoji: '🍝', color: '#fff0d0' },
  { name: 'Tomates', emoji: '🍅', color: '#ffe0d0' },
  { name: 'Cereal', emoji: '🥣', color: '#f0e8ff' },
  { name: 'Galletas', emoji: '🍪', color: '#f5e0c0' },
  { name: 'Café', emoji: '☕', color: '#e8d8c8' },
  { name: 'Jabón', emoji: '🧼', color: '#e0f8f0' },
];

// ─── Dificultad ──────────────────────────────────────────
interface DifficultyConfig {
  products: number;
  maxPrice: number;
  useDecimals: boolean;
  timeLimit: number;
}

function getDifficulty(level: number): DifficultyConfig {
  if (level <= 1) return { products: 2, maxPrice: 5, useDecimals: false, timeLimit: 15 };
  if (level <= 2) return { products: 2, maxPrice: 8, useDecimals: true, timeLimit: 13 };
  if (level <= 3) return { products: 3, maxPrice: 8, useDecimals: false, timeLimit: 12 };
  if (level <= 4) return { products: 3, maxPrice: 10, useDecimals: true, timeLimit: 11 };
  if (level <= 5) return { products: 4, maxPrice: 10, useDecimals: true, timeLimit: 10 };
  if (level <= 7) return { products: 4, maxPrice: 15, useDecimals: true, timeLimit: 9 };
  return { products: 5, maxPrice: 20, useDecimals: true, timeLimit: 8 };
}

interface Product { name: string; emoji: string; price: number; color: string; }

function generateClient(difficulty: DifficultyConfig): Product[] {
  const shuffled = [...PRODUCT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, difficulty.products).map(p => {
    let price: number;
    if (difficulty.useDecimals) {
      price = Math.round((Math.random() * (difficulty.maxPrice - 1) + 1) * 4) / 4;
    } else {
      price = Math.floor(Math.random() * (difficulty.maxPrice - 1)) + 1;
    }
    return { ...p, price };
  });
}

// ─── Progreso ────────────────────────────────────────────
const STORAGE_KEY = 'legends-cashier-progress';
function loadProgress() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : { bestLevel: 1, totalEarnings: 0 }; }
  catch { return { bestLevel: 1, totalEarnings: 0 }; }
}
function saveProgress(bestLevel: number, totalEarnings: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestLevel, totalEarnings }));
}

// ─── Componente Principal ────────────────────────────────
export function CashierGame() {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [clientsServed, setClientsServed] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setGamePhase = useGameStore(s => s.setGamePhase);
  const advanceTime = useGameStore(s => s.advanceTime);
  const addMoney = usePlayerStore(s => s.addMoney);
  const consumeEnergy = usePlayerStore(s => s.consumeEnergy);
  const addNotification = useUIStore(s => s.addNotification);
  const muted = useAudioStore(s => s.muted);
  const sfxVolume = useAudioStore(s => s.sfxVolume);
  const masterVolume = useAudioStore(s => s.masterVolume);

  const correctTotal = products.reduce((sum, p) => sum + p.price, 0);
  const difficulty = getDifficulty(level);

  const nextClient = useCallback(() => {
    const diff = getDifficulty(level);
    setProducts(generateClient(diff));
    setInput('');
    setTimeLeft(diff.timeLimit);
    setFeedback(null);
    setDrawerOpen(false);
  }, [level]);

  const startGame = () => {
    setShowIntro(false);
    setLives(3); setClientsServed(0); setEarnings(0); setLevel(1); setGameOver(false);
    const diff = getDifficulty(1);
    setProducts(generateClient(diff));
    setTimeLeft(diff.timeLimit);
  };

  // Timer
  useEffect(() => {
    if (showIntro || gameOver || paused || feedback) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!muted) playAudio('/audio/error.mp3', sfxVolume * masterVolume);
          setLives(l => l - 1); setFeedback('wrong'); return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showIntro, gameOver, paused, feedback, products, muted, sfxVolume, masterVolume]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      const p = loadProgress();
      saveProgress(Math.max(p.bestLevel, level), p.totalEarnings + earnings);
    }
  }, [lives, gameOver, level, earnings]);

  // After feedback → next client
  useEffect(() => {
    if (!feedback) return;
    if (feedback === 'correct') setDrawerOpen(true);
    const timer = setTimeout(() => {
      if (lives <= 0) return;
      if (feedback === 'correct' && (clientsServed + 1) % 3 === 0) setLevel(l => l + 1);
      nextClient();
    }, 1500);
    return () => clearTimeout(timer);
  }, [feedback, lives, clientsServed, nextClient]);

  const handleSubmit = () => {
    if (!input || feedback) return;
    const answer = parseFloat(input);
    const expected = Math.round(correctTotal * 100) / 100;
    if (Math.abs(answer - expected) < 0.01) {
      if (!muted) playAudio('/audio/cash_register.mp3', sfxVolume * masterVolume);
      setFeedback('correct'); setClientsServed(c => c + 1); setEarnings(e => e + 50);
    } else {
      if (!muted) playAudio('/audio/error.mp3', sfxVolume * masterVolume);
      setFeedback('wrong'); setLives(l => l - 1);
    }
  };

  const handleKey = (key: string) => {
    if (feedback) return;
    if (key === 'C') { setInput(''); return; }
    if (key === '←') { setInput(prev => prev.slice(0, -1)); return; }
    if (key === '=') { handleSubmit(); return; }
    if (key === '.' && input.includes('.')) return;
    if (input.length >= 7) return;
    setInput(prev => prev + key);
  };

  const handleExit = () => {
    const totalPay = 350 + (clientsServed * 50);
    if (clientsServed > 0) {
      addMoney(totalPay); consumeEnergy(20); advanceTime();
      addNotification('success', `¡Turno completado! ${clientsServed} clientes. +$${totalPay}`);
    }
    setGamePhase('playing');
  };

  const handleExitNoSave = () => { setGamePhase('playing'); };

  const timePercent = (timeLeft / difficulty.timeLimit) * 100;
  const isUrgent = timeLeft <= 4;

  // ─── INTRO ─────────────────────────────────────────
  if (showIntro) {
    const progress = loadProgress();
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-emerald-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-7xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-white mb-1">Cajero Express</h1>
          <p className="text-emerald-400 text-sm mb-4">Suma los precios • Cobra el total</p>
          <div className="bg-gray-800/60 rounded-xl p-4 mb-5 border border-emerald-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">📊 Récord</span>
              <span className="text-emerald-400 font-bold">Nivel {progress.bestLevel}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">💰 Total ganado</span>
              <span className="text-yellow-400 font-bold">${progress.totalEarnings}</span>
            </div>
          </div>
          <button onClick={startGame}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-emerald-600/30">
            ▶️ Empezar Turno
          </button>
          <button onClick={handleExitNoSave}
            className="w-full py-2 mt-3 text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Volver al supermercado
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── PAUSA ─────────────────────────────────────────
  if (paused) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl p-6 max-w-xs w-full mx-4 border border-emerald-500/30">
          <h2 className="text-xl font-bold text-white text-center mb-5">⏸️ Pausa</h2>
          <div className="space-y-3">
            <button onClick={() => setPaused(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">▶️ Continuar</button>
            <button onClick={handleExit}
              className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl text-sm">
              💰 Cobrar ${350 + clientsServed * 50} y salir
            </button>
            <button onClick={handleExitNoSave}
              className="w-full py-2 text-red-400 hover:text-red-300 text-sm">❌ Salir sin cobrar</button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── GAME OVER ─────────────────────────────────────
  if (gameOver) {
    const totalPay = 350 + (clientsServed * 50);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="text-6xl mb-3">{clientsServed >= 5 ? '🎉' : '💼'}</div>
          <h2 className="text-2xl font-bold text-white mb-1">Turno Terminado</h2>
          <p className="text-gray-400 text-sm mb-5">Se acabaron tus vidas</p>
          <div className="bg-gray-800/60 rounded-xl p-4 mb-5 space-y-2 border border-gray-700">
            <div className="flex justify-between"><span className="text-gray-400">👥 Clientes</span><span className="text-white font-bold">{clientsServed}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">📈 Nivel</span><span className="text-emerald-400 font-bold">{level}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">💰 Pago</span><span className="text-yellow-400 font-bold">${totalPay}</span></div>
          </div>
          <button onClick={handleExit}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-600/30">
            💰 Cobrar ${totalPay}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── JUEGO PRINCIPAL ───────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-lg ${i < lives ? '' : 'opacity-20'}`}>❤️</span>
            ))}
          </div>
          <span className="text-emerald-400 text-xs font-bold bg-emerald-900/40 px-2 py-0.5 rounded">Nv.{level}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-xs">👥 {clientsServed}</span>
          <span className="text-yellow-400 text-xs font-bold">${earnings}</span>
          <button onClick={() => setPaused(true)} className="text-gray-400 hover:text-white">⏸️</button>
        </div>
      </div>

      {/* ── Timer ── */}
      <div className="w-full h-1.5 bg-gray-800">
        <motion.div className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-emerald-500'}`}
          animate={{ width: `${timePercent}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* ── Caja Registradora ── */}
      <div className="flex-1 flex items-center justify-center px-3 py-2">
        <div className="w-full max-w-md">

          {/* Ticket de papel */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="bg-white rounded-t-sm mx-8 px-3 py-2 shadow-md border border-gray-200 overflow-hidden"
          >
            <p className="text-[10px] text-gray-400 font-mono text-center mb-1">══ PURPLE MARKET ══</p>
            {products.map((p, i) => (
              <div key={i} className="flex justify-between text-xs font-mono text-gray-700">
                <span>{p.emoji} {p.name}</span>
                <span>${p.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-300 mt-1 pt-1">
              <div className="flex justify-between text-xs font-mono font-bold text-gray-900">
                <span>TOTAL</span>
                <span>{feedback === 'correct' ? `$${correctTotal.toFixed(2)}` : '$ ???'}</span>
              </div>
            </div>
          </motion.div>

          {/* Cuerpo de la caja */}
          <div className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-2xl p-4 border-2 border-gray-600 relative shadow-2xl">

            {/* Pantalla LED */}
            <div className="bg-black rounded-lg p-3 mb-3 border border-gray-600 shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-emerald-700 font-mono">CLIENTE #{clientsServed + 1}</span>
                <span className={`text-[10px] font-mono ${isUrgent ? 'text-red-500 animate-pulse' : 'text-emerald-700'}`}>
                  ⏱ {timeLeft}s
                </span>
              </div>
              {/* Display LED grande */}
              <div className="bg-gray-950 rounded px-3 py-2 border border-emerald-900/50">
                <p className="text-emerald-400 font-mono text-2xl text-right tracking-wider"
                   style={{ textShadow: '0 0 8px #10b981' }}>
                  ${input || '0.00'}
                </p>
              </div>
            </div>

            {/* Teclado numérico */}
            <div className="grid grid-cols-4 gap-1.5">
              {/* Fila 1 */}
              {['7', '8', '9', 'C'].map(key => (
                <button key={key} onClick={() => handleKey(key)}
                  className={`py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                    key === 'C' ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-white text-gray-800'
                  }`}>{key}</button>
              ))}
              {/* Fila 2 */}
              {['4', '5', '6', '←'].map(key => (
                <button key={key} onClick={() => handleKey(key)}
                  className={`py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                    key === '←' ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-white text-gray-800'
                  }`}>{key}</button>
              ))}
              {/* Fila 3 */}
              {['1', '2', '3', '.'].map(key => (
                <button key={key} onClick={() => handleKey(key)}
                  className="py-2.5 rounded-lg font-bold text-sm bg-gray-200 hover:bg-white text-gray-800 transition-all active:scale-95"
                >{key}</button>
              ))}
              {/* Fila 4 */}
              <button onClick={() => handleKey('0')}
                className="py-2.5 rounded-lg font-bold text-sm bg-gray-200 hover:bg-white text-gray-800 col-span-2 transition-all active:scale-95">0</button>
              <button onClick={() => handleKey('=')}
                className="py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white col-span-2 transition-all active:scale-95 shadow-md shadow-emerald-600/30">
                COBRAR ✓
              </button>
            </div>

            {/* Feedback overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center rounded-2xl ${
                    feedback === 'correct' ? 'bg-emerald-900/90' : 'bg-red-900/90'
                  }`}>
                  <div className="text-center">
                    <div className="text-5xl mb-2">{feedback === 'correct' ? '✅' : '❌'}</div>
                    <p className="text-white font-bold text-lg">
                      {feedback === 'correct' ? '¡Correcto! +$50' : `Era $${correctTotal.toFixed(2)}`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cajón de la caja */}
          <motion.div
            animate={{ y: drawerOpen ? 8 : 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 h-10 rounded-b-xl border-x-2 border-b-2 border-gray-600 flex items-center justify-center relative overflow-hidden"
          >
            <div className="w-8 h-2 bg-gray-600 rounded-full" />
            {drawerOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gray-700 flex items-center justify-center gap-1 rounded-b-xl">
                <span className="text-xs">💵</span><span className="text-xs">💵</span><span className="text-xs">💵</span>
              </motion.div>
            )}
          </motion.div>

          {/* Base */}
          <div className="bg-gray-900 h-3 mx-6 rounded-b-lg border-x border-b border-gray-700" />
        </div>
      </div>

      {/* ── Productos del cliente (banda transportadora) ── */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {products.map((p, i) => (
            <motion.div key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm"
              style={{ backgroundColor: p.color, borderColor: `${p.color}88` }}
            >
              <span className="text-lg">{p.emoji}</span>
              <span className="text-xs font-bold text-gray-700">${p.price.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
