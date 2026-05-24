/**
 * LEGENDS: CashierGame — Minijuego "Cajero Express"
 * Suma rápida: el jugador suma los precios de los productos y escribe el total.
 * La dificultad aumenta con cada cliente atendido.
 * Progreso guardado en localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';

// ─── Productos ───────────────────────────────────────────
const PRODUCT_POOL = [
  { name: 'Leche', emoji: '🥛' },
  { name: 'Pan', emoji: '🍞' },
  { name: 'Manzanas', emoji: '🍎' },
  { name: 'Pollo', emoji: '🍗' },
  { name: 'Arroz', emoji: '🍚' },
  { name: 'Jugo', emoji: '🧃' },
  { name: 'Huevos', emoji: '🥚' },
  { name: 'Queso', emoji: '🧀' },
  { name: 'Bananas', emoji: '🍌' },
  { name: 'Agua', emoji: '💧' },
  { name: 'Papas', emoji: '🥔' },
  { name: 'Refresco', emoji: '🥤' },
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Tomates', emoji: '🍅' },
  { name: 'Cereal', emoji: '🥣' },
  { name: 'Galletas', emoji: '🍪' },
  { name: 'Yogurt', emoji: '🥛' },
  { name: 'Café', emoji: '☕' },
];

// ─── Dificultad por nivel ────────────────────────────────
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

// ─── Generar cliente ─────────────────────────────────────
interface Product {
  name: string;
  emoji: string;
  price: number;
}

function generateClient(difficulty: DifficultyConfig): Product[] {
  const shuffled = [...PRODUCT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, difficulty.products).map(p => {
    let price: number;
    if (difficulty.useDecimals) {
      price = Math.round((Math.random() * (difficulty.maxPrice - 1) + 1) * 4) / 4; // .25 increments
    } else {
      price = Math.floor(Math.random() * (difficulty.maxPrice - 1)) + 1;
    }
    return { ...p, price };
  });
}

// ─── Guardar/cargar progreso ─────────────────────────────
const STORAGE_KEY = 'legends-cashier-progress';

function loadProgress(): { bestLevel: number; totalEarnings: number } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { bestLevel: 1, totalEarnings: 0 };
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setGamePhase = useGameStore(state => state.setGamePhase);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const addNotification = useUIStore(state => state.addNotification);

  const correctTotal = products.reduce((sum, p) => sum + p.price, 0);
  const difficulty = getDifficulty(level);

  // ─── Generar nuevo cliente ───────────────────────────
  const nextClient = useCallback(() => {
    const diff = getDifficulty(level);
    setProducts(generateClient(diff));
    setInput('');
    setTimeLeft(diff.timeLimit);
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [level]);

  // ─── Iniciar juego ──────────────────────────────────
  const startGame = () => {
    setShowIntro(false);
    setLives(3);
    setClientsServed(0);
    setEarnings(0);
    setLevel(1);
    setGameOver(false);
    const diff = getDifficulty(1);
    setProducts(generateClient(diff));
    setTimeLeft(diff.timeLimit);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  // ─── Timer ──────────────────────────────────────────
  useEffect(() => {
    if (showIntro || gameOver || paused || feedback) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Tiempo agotado = respuesta incorrecta
          setLives(l => l - 1);
          setFeedback('wrong');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showIntro, gameOver, paused, feedback, products]);

  // ─── Check game over ────────────────────────────────
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      const progress = loadProgress();
      const newBest = Math.max(progress.bestLevel, level);
      saveProgress(newBest, progress.totalEarnings + earnings);
    }
  }, [lives, gameOver, level, earnings]);

  // ─── Después del feedback, siguiente cliente ────────
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      if (lives <= 0) return;
      if (feedback === 'correct') {
        // Subir nivel cada 3 clientes
        if ((clientsServed + 1) % 3 === 0) {
          setLevel(l => l + 1);
        }
      }
      nextClient();
    }, 1200);
    return () => clearTimeout(timer);
  }, [feedback, lives, clientsServed, nextClient]);

  // ─── Verificar respuesta ────────────────────────────
  const handleSubmit = () => {
    if (!input || feedback) return;
    const answer = parseFloat(input);
    const expected = Math.round(correctTotal * 100) / 100;

    if (Math.abs(answer - expected) < 0.01) {
      // Correcto
      setFeedback('correct');
      setClientsServed(c => c + 1);
      setEarnings(e => e + 50);
    } else {
      // Incorrecto
      setFeedback('wrong');
      setLives(l => l - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setPaused(true);
  };

  // ─── Salir del juego ───────────────────────────────
  const handleExit = () => {
    const totalPay = 350 + (clientsServed * 50);
    if (clientsServed > 0) {
      addMoney(totalPay);
      consumeEnergy(20);
      advanceTime();
      addNotification('success', `¡Turno completado! ${clientsServed} clientes atendidos. +$${totalPay}`);
    }
    setGamePhase('playing');
  };

  const handleExitNoSave = () => {
    setGamePhase('playing');
  };

  const timePercent = (timeLeft / difficulty.timeLimit) * 100;
  const isUrgent = timeLeft <= 4;

  // ─── PANTALLA INTRO ─────────────────────────────────
  if (showIntro) {
    const progress = loadProgress();
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
      >
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-3xl font-bold text-white mb-2">Cajero Express</h1>
          <p className="text-gray-400 mb-6">
            Suma los precios de los productos y cobra el total correcto. 
            ¡Cada cliente es más difícil!
          </p>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-300">📊 Tu récord: <span className="text-purple-400 font-bold">Nivel {progress.bestLevel}</span></p>
            <p className="text-sm text-gray-300">💰 Ganado total: <span className="text-yellow-400 font-bold">${progress.totalEarnings}</span></p>
          </div>

          <div className="space-y-3">
            <button
              onClick={startGame}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors text-lg"
            >
              ▶️ Empezar Turno
            </button>
            <button
              onClick={handleExitNoSave}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
            >
              ← Volver al supermercado
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── PANTALLA PAUSA ─────────────────────────────────
  if (paused) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
      >
        <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-purple-500/30">
          <h2 className="text-xl font-bold text-white text-center mb-4">⏸️ Pausa</h2>
          <div className="space-y-3">
            <button
              onClick={() => { setPaused(false); inputRef.current?.focus(); }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
            >
              ▶️ Continuar
            </button>
            <button
              onClick={handleExit}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
            >
              💰 Cobrar y salir ({clientsServed} clientes = ${350 + clientsServed * 50})
            </button>
            <button
              onClick={handleExitNoSave}
              className="w-full py-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-lg text-sm"
            >
              ❌ Salir sin cobrar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── PANTALLA GAME OVER ─────────────────────────────
  if (gameOver) {
    const totalPay = 350 + (clientsServed * 50);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
      >
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-3">{clientsServed >= 5 ? '🎉' : '💼'}</div>
          <h2 className="text-2xl font-bold text-white mb-1">Turno Terminado</h2>
          <p className="text-gray-400 mb-4">Se acabaron tus vidas</p>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 space-y-2">
            <p className="text-gray-300">👥 Clientes atendidos: <span className="text-white font-bold">{clientsServed}</span></p>
            <p className="text-gray-300">📈 Nivel alcanzado: <span className="text-purple-400 font-bold">{level}</span></p>
            <p className="text-gray-300">💰 Pago total: <span className="text-yellow-400 font-bold">${totalPay}</span></p>
          </div>

          <button
            onClick={handleExit}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-lg"
          >
            💰 Cobrar ${totalPay}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── PANTALLA DE JUEGO ──────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40">
        <div className="flex items-center gap-4">
          {/* Vidas */}
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                ❤️
              </span>
            ))}
          </div>
          {/* Nivel */}
          <span className="text-purple-400 text-sm font-bold">Nv.{level}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Clientes */}
          <span className="text-gray-300 text-sm">👥 {clientsServed}</span>
          {/* Ganancias */}
          <span className="text-yellow-400 text-sm font-bold">${earnings}</span>
          {/* Pausa */}
          <button
            onClick={() => setPaused(true)}
            className="text-gray-400 hover:text-white text-lg"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-gray-800">
        <motion.div
          className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Caja registradora */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* Pantalla de la caja */}
          <div className="bg-gray-800 rounded-t-2xl border-2 border-gray-600 p-5 relative">
            {/* Pantalla LED */}
            <div className="bg-black rounded-lg p-4 mb-4 border border-gray-700">
              <p className="text-green-400 text-xs font-mono mb-2 opacity-70">CLIENTE #{clientsServed + 1}</p>
              
              {/* Productos */}
              <div className="space-y-2 mb-3">
                <AnimatePresence>
                  {products.map((p, i) => (
                    <motion.div
                      key={`${p.name}-${i}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex justify-between items-center"
                    >
                      <span className="text-green-300 font-mono text-sm">
                        {p.emoji} {p.name}
                      </span>
                      <span className="text-green-400 font-mono font-bold">
                        ${p.price.toFixed(2)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Línea separadora */}
              <div className="border-t border-green-900 my-2" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-green-500 font-mono text-sm">TOTAL:</span>
                <span className="text-green-400 font-mono text-xl font-bold">
                  {feedback === 'correct' ? `$${correctTotal.toFixed(2)}` : '$???'}
                </span>
              </div>
            </div>

            {/* Input de respuesta */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  ref={inputRef}
                  type="number"
                  step="0.01"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!!feedback}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white text-lg font-mono focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!input || !!feedback}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
              >
                ✓
              </button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center rounded-2xl ${
                    feedback === 'correct' ? 'bg-green-900/80' : 'bg-red-900/80'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{feedback === 'correct' ? '✅' : '❌'}</div>
                    <p className="text-white font-bold text-lg">
                      {feedback === 'correct' ? '¡Correcto! +$50' : `Incorrecto. Era $${correctTotal.toFixed(2)}`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Base de la caja registradora */}
          <div className="bg-gray-700 h-4 rounded-b-2xl border-x-2 border-b-2 border-gray-600" />
          <div className="bg-gray-600 h-2 mx-4 rounded-b-lg" />
        </div>
      </div>

      {/* Teclado numérico (mobile) */}
      <div className="px-4 pb-4 md:hidden">
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {['7','8','9','','4','5','6','','1','2','3','.','0','00','←','✓'].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === '←') setInput(prev => prev.slice(0, -1));
                else if (key === '✓') handleSubmit();
                else if (key === '') return;
                else setInput(prev => prev + key);
              }}
              disabled={key === '' || !!feedback}
              className={`py-3 rounded-lg font-bold text-lg transition-colors ${
                key === '✓' ? 'bg-purple-600 text-white' :
                key === '←' ? 'bg-red-900/50 text-red-300' :
                key === '' ? 'invisible' :
                'bg-gray-700 text-white hover:bg-gray-600'
              } disabled:opacity-30`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
