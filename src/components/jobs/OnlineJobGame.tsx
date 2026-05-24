/**
 * 🎮 LEGENDS: Online Job Game
 * Minijuego de trabajos online — trivia, redacción, diseño
 * El jugador responde preguntas o completa tareas para ganar dinero
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

// Job types available
interface OnlineJob {
  id: string;
  name: string;
  icon: string;
  pay: number;
  energyCost: number;
  description: string;
  color: string;
  minLevel: number;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const ONLINE_JOBS: OnlineJob[] = [
  { id: 'emails', name: 'Redacción de Correos', icon: '📧', pay: 200, energyCost: 15, description: 'Responde correos de clientes', color: '#22d3ee', minLevel: 1 },
  { id: 'fichas', name: 'Fichas Técnicas', icon: '📋', pay: 350, energyCost: 20, description: 'Completa fichas de productos', color: '#a78bfa', minLevel: 2 },
  { id: 'logos', name: 'Diseño de Logos', icon: '🎨', pay: 500, energyCost: 25, description: 'Crea logos para empresas', color: '#f59e0b', minLevel: 3 },
  { id: 'video', name: 'Edición de Video', icon: '🎬', pay: 700, energyCost: 30, description: 'Edita videos promocionales', color: '#ec4899', minLevel: 4 },
  { id: 'web', name: 'Desarrollo Web', icon: '💻', pay: 1000, energyCost: 40, description: 'Desarrolla sitios web freelance', color: '#10b981', minLevel: 5 },
];

// Question bank — cultura general, música, tecnología, 50+ preguntas
const QUESTIONS: Question[] = [
  { question: '¿Cuál es el formato de audio sin pérdida más común?', options: ['MP3', 'WAV', 'AAC', 'OGG'], correct: 1, category: 'música' },
  { question: '¿Qué significa BPM en música?', options: ['Beats Per Minute', 'Bass Per Mix', 'Bars Per Melody', 'Bits Per Music'], correct: 0, category: 'música' },
  { question: '¿Cuál es la red social para músicos independientes?', options: ['Facebook', 'SoundCloud', 'LinkedIn', 'Pinterest'], correct: 1, category: 'música' },
  { question: '¿Qué software se usa para producción musical?', options: ['Photoshop', 'Excel', 'FL Studio', 'Word'], correct: 2, category: 'música' },
  { question: '¿Cuántas teclas tiene un piano estándar?', options: ['76', '88', '92', '64'], correct: 1, category: 'música' },
  { question: '¿Qué es un DAW?', options: ['Digital Audio Workstation', 'Digital Art Work', 'Dynamic Audio Wave', 'Direct Audio Writer'], correct: 0, category: 'tecnología' },
  { question: '¿Qué lenguaje se usa para hacer páginas web?', options: ['Python', 'Java', 'HTML', 'C++'], correct: 2, category: 'tecnología' },
  { question: '¿Cuántos bytes tiene un kilobyte?', options: ['100', '1000', '1024', '512'], correct: 2, category: 'tecnología' },
  { question: '¿Qué es un pixel?', options: ['Un color', 'Un punto en pantalla', 'Un archivo', 'Un programa'], correct: 1, category: 'tecnología' },
  { question: '¿Cuál es el navegador más usado del mundo?', options: ['Firefox', 'Safari', 'Chrome', 'Edge'], correct: 2, category: 'tecnología' },
  { question: '¿En qué país nació el reggaetón?', options: ['Colombia', 'Puerto Rico', 'México', 'Cuba'], correct: 1, category: 'cultura' },
  { question: '¿Quién pintó la Mona Lisa?', options: ['Picasso', 'Da Vinci', 'Van Gogh', 'Miguel Ángel'], correct: 1, category: 'cultura' },
  { question: '¿Cuál es el océano más grande?', options: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'], correct: 2, category: 'cultura' },
  { question: '¿En qué año llegó el hombre a la luna?', options: ['1965', '1969', '1972', '1959'], correct: 1, category: 'cultura' },
  { question: '¿Cuál es el planeta más cercano al sol?', options: ['Venus', 'Marte', 'Mercurio', 'Tierra'], correct: 2, category: 'cultura' },
  { question: '¿Qué significa "streaming" en música?', options: ['Descargar', 'Escuchar en vivo online', 'Grabar', 'Mezclar'], correct: 1, category: 'música' },
  { question: '¿Cuál es la moneda de Japón?', options: ['Yuan', 'Won', 'Yen', 'Ringgit'], correct: 2, category: 'cultura' },
  { question: '¿Qué es el Wi-Fi?', options: ['Un cable', 'Red inalámbrica', 'Un programa', 'Un chip'], correct: 1, category: 'tecnología' },
  { question: '¿Cuántos minutos tiene una hora?', options: ['30', '60', '90', '120'], correct: 1, category: 'cultura' },
  { question: '¿Qué instrumento toca un DJ?', options: ['Guitarra', 'Batería', 'Tornamesa', 'Piano'], correct: 2, category: 'música' },
  { question: '¿Qué género musical usa 808s?', options: ['Jazz', 'Trap', 'Rock', 'Country'], correct: 1, category: 'música' },
  { question: '¿Quién creó Spotify?', options: ['Elon Musk', 'Daniel Ek', 'Mark Zuckerberg', 'Steve Jobs'], correct: 1, category: 'tecnología' },
  { question: '¿Qué es un sample en música?', options: ['Un volumen', 'Un fragmento de audio reutilizado', 'Una nota', 'Un efecto'], correct: 1, category: 'música' },
  { question: '¿Cuál es la capital de Australia?', options: ['Sídney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2, category: 'cultura' },
  { question: '¿Qué significa MIDI?', options: ['Music In Digital Interface', 'Musical Instrument Digital Interface', 'Media Input Device', 'Mix Digital Input'], correct: 1, category: 'música' },
  { question: '¿Cuántos continentes hay?', options: ['5', '6', '7', '8'], correct: 2, category: 'cultura' },
  { question: '¿Qué es lo-fi en música?', options: ['Alta fidelidad', 'Baja fidelidad intencional', 'Un instrumento', 'Un género de rock'], correct: 1, category: 'música' },
  { question: '¿Cuál es el metal más ligero?', options: ['Hierro', 'Aluminio', 'Litio', 'Titanio'], correct: 2, category: 'cultura' },
  { question: '¿Qué es un hook en una canción?', options: ['El verso', 'La parte más pegajosa', 'El final', 'La introducción'], correct: 1, category: 'música' },
  { question: '¿Cuántos gramos tiene un kilogramo?', options: ['100', '500', '1000', '10000'], correct: 2, category: 'cultura' },
  { question: '¿Qué es Auto-Tune?', options: ['Un amplificador', 'Corrector de tono vocal', 'Un micrófono', 'Un tipo de ecualizador'], correct: 1, category: 'música' },
  { question: '¿Cuál es el animal más rápido?', options: ['León', 'Guepardo', 'Águila', 'Caballo'], correct: 1, category: 'cultura' },
  { question: '¿Qué tipo de archivo es un .mp3?', options: ['Imagen', 'Video', 'Audio', 'Texto'], correct: 2, category: 'tecnología' },
  { question: '¿Quién inventó el teléfono?', options: ['Edison', 'Tesla', 'Bell', 'Newton'], correct: 2, category: 'cultura' },
  { question: '¿Qué es mastering en producción musical?', options: ['Grabar la voz', 'Proceso final de sonido', 'Escribir letra', 'Tocar en vivo'], correct: 1, category: 'música' },
  { question: '¿Cuál es el río más largo del mundo?', options: ['Nilo', 'Amazonas', 'Misisipi', 'Yangtsé'], correct: 1, category: 'cultura' },
  { question: '¿Qué es un EQ en audio?', options: ['Efecto Químico', 'Ecualizador', 'Eco Quality', 'Extra Quality'], correct: 1, category: 'música' },
  { question: '¿En qué país se inventó la pizza?', options: ['Francia', 'España', 'Italia', 'Grecia'], correct: 2, category: 'cultura' },
  { question: '¿Qué es un freestyle en rap?', options: ['Una canción escrita', 'Improvisación', 'Un baile', 'Un instrumento'], correct: 1, category: 'música' },
  { question: '¿Cuál es el hueso más largo del cuerpo?', options: ['Húmero', 'Fémur', 'Tibia', 'Radio'], correct: 1, category: 'cultura' },
  { question: '¿Qué es reverb en audio?', options: ['Eco artificial', 'Volumen alto', 'Bajo fuerte', 'Ritmo rápido'], correct: 0, category: 'música' },
  { question: '¿Cuántos colores tiene el arcoíris?', options: ['5', '6', '7', '8'], correct: 2, category: 'cultura' },
  { question: '¿Qué es un beat en producción?', options: ['Una letra', 'Una pista instrumental', 'Un micrófono', 'Un escenario'], correct: 1, category: 'música' },
  { question: '¿Cuál es el país más grande del mundo?', options: ['China', 'EEUU', 'Canadá', 'Rusia'], correct: 3, category: 'cultura' },
  { question: '¿Qué significa USB?', options: ['Universal Serial Bus', 'Ultra Speed Byte', 'United System Board', 'Universal System Base'], correct: 0, category: 'tecnología' },
  { question: '¿Quién es el "Rey del Pop"?', options: ['Elvis', 'Michael Jackson', 'Prince', 'Freddie Mercury'], correct: 1, category: 'música' },
  { question: '¿Cuántos lados tiene un hexágono?', options: ['5', '6', '7', '8'], correct: 1, category: 'cultura' },
  { question: '¿Qué es un plugin en música?', options: ['Un cable', 'Software de efectos/instrumentos', 'Un altavoz', 'Un formato'], correct: 1, category: 'música' },
  { question: '¿En qué año se fundó YouTube?', options: ['2003', '2005', '2007', '2009'], correct: 1, category: 'tecnología' },
  { question: '¿Qué es una colaboración musical?', options: ['Tocar solo', 'Grabar con otro artista', 'Vender discos', 'Hacer un video'], correct: 1, category: 'música' },
];

type GamePhase = 'select_job' | 'loading' | 'working' | 'results';

// AI models to try in order (cheapest first, fallback chain)
const AI_MODELS = ['deepseek/deepseek-v4-flash', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku'];

// Generate questions — tries AI models in order, falls back to static
async function generateQuestionsAsync(jobName: string): Promise<Question[]> {
  try {
    const { insforge } = await import('../../services/insforge');
    
    const { data: user } = await insforge.auth.getCurrentUser();
    if (!user) throw new Error('No session');

    for (const model of AI_MODELS) {
      try {
        const completion = await insforge.ai.chat.completions.create({
          model,
          messages: [{
            role: 'user',
            content: `Genera 5 preguntas de trivia en español para un minijuego de "${jobName}". 
Las preguntas deben ser de cultura general, música, tecnología o datos curiosos. Nivel medio-fácil.
Responde SOLO con un JSON array sin markdown: [{"question":"...","options":["a","b","c","d"],"correct":0,"category":"música"}]
"correct" es el índice (0-3) de la respuesta correcta.`
          }],
          temperature: 0.9,
          maxTokens: 800,
        });

        const content = completion.choices[0]?.message?.content || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as Question[];
          if (Array.isArray(parsed) && parsed.length >= 3) {
            console.log(`[OnlineJob] AI questions generated with ${model}`);
            return parsed.slice(0, 5);
          }
        }
      } catch (err) {
        console.log(`[OnlineJob] Model ${model} failed, trying next...`);
        continue;
      }
    }
  } catch (error) {
    console.log('[OnlineJob] Using static questions (no session)');
  }
  return [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
}

export function OnlineJobGame({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<GamePhase>('select_job');
  const [selectedJob, setSelectedJob] = useState<OnlineJob | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<number>(0);

  const currentLevel = useGameStore(s => s.currentLevel);
  const energy = usePlayerStore(s => s.energy);
  const addMoney = usePlayerStore(s => s.addMoney);
  const consumeEnergy = usePlayerStore(s => s.consumeEnergy);
  const addNotification = useUIStore(s => s.addNotification);

  const availableJobs = ONLINE_JOBS.filter(j => j.minLevel <= currentLevel);

  // Start a job
  const handleSelectJob = async (job: OnlineJob) => {
    if (energy < job.energyCost) {
      addNotification('warning', `⚡ Necesitas ${job.energyCost} de energía`);
      return;
    }
    setSelectedJob(job);
    setPhase('loading');
    consumeEnergy(job.energyCost);

    const generatedQuestions = await generateQuestionsAsync(job.name);
    setQuestions(generatedQuestions);
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setTimeLeft(15);
    setPhase('working');
  };

  // Timer countdown
  useEffect(() => {
    if (phase !== 'working' || showResult) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time's up — mark as wrong, move next
          handleAnswer(-1);
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQuestion, showResult]);

  // Handle answer selection
  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    clearInterval(timerRef.current);
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    if (isCorrect) setCorrectAnswers(c => c + 1);

    // Move to next after 1.2s
    setTimeout(() => {
      if (currentQuestion >= questions.length - 1) {
        // Done
        finishJob();
      } else {
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(15);
      }
    }, 1200);
  };

  // Finish job and give reward
  const finishJob = () => {
    if (!selectedJob) return;
    const ratio = correctAnswers / questions.length;
    const earned = Math.floor(selectedJob.pay * (0.5 + ratio * 0.5)); // Min 50% pay, max 100%
    addMoney(earned);
    setPhase('results');
  };

  // LOADING
  if (phase === 'loading') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <div className="bg-gradient-to-b from-[#1e1e38]/95 to-[#141428]/95 rounded-2xl border border-purple-400/20 p-8 max-w-xs w-full mx-4 shadow-2xl text-center">
          <div className="text-4xl mb-4 animate-bounce">{selectedJob?.icon || '💻'}</div>
          <h3 className="text-lg font-bold text-white mb-2">Generando preguntas...</h3>
          <p className="text-purple-200/60 text-sm">{selectedJob?.name}</p>
          <div className="mt-4 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </motion.div>
    );
  }

  // JOB SELECTION
  if (phase === 'select_job') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <div className="bg-gradient-to-b from-[#1e1e38]/95 to-[#141428]/95 rounded-2xl border border-purple-400/20 p-6 max-w-lg w-full mx-4 shadow-2xl">
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">💻 Trabajos Online</h2>
              <p className="text-purple-200/60 text-sm mt-0.5">Elige un trabajo para ganar dinero</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-sm">✕</button>
          </div>

          <div className="space-y-2.5">
            {availableJobs.map(job => (
              <button
                key={job.id}
                onClick={() => handleSelectJob(job)}
                disabled={energy < job.energyCost}
                className={`w-full p-4 rounded-xl border text-left transition-all group ${
                  energy >= job.energyCost 
                    ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-400/20' 
                    : 'bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${job.color}15`, border: `1px solid ${job.color}30` }}>
                    {job.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">{job.name}</h3>
                    <p className="text-purple-200/50 text-xs">{job.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-300 font-bold text-sm">${job.pay}</div>
                    <div className="text-purple-200/40 text-[10px]">-{job.energyCost} ⚡</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {availableJobs.length === 0 && (
            <p className="text-center text-purple-200/50 py-8">Necesitas nivel 2 para desbloquear trabajos online</p>
          )}
        </div>
      </motion.div>
    );
  }

  // WORKING — Quiz
  if (phase === 'working' && questions.length > 0) {
    const q = questions[currentQuestion];
    const isCorrect = selectedAnswer === q.correct;
    const progress = ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <div className="bg-gradient-to-b from-[#1e1e38]/95 to-[#141428]/95 rounded-2xl border border-purple-400/20 p-6 max-w-lg w-full mx-4 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedJob?.icon}</span>
              <span className="text-white font-semibold text-sm">{selectedJob?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-purple-200/60 text-xs">{currentQuestion + 1}/{questions.length}</span>
              <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${timeLeft <= 5 ? 'bg-red-500/20 text-red-300' : 'bg-cyan-400/10 text-cyan-300'}`}>
                ⏱ {timeLeft}s
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <div className="mb-5">
            <p className="text-xs text-purple-200/40 uppercase tracking-wider mb-1.5">Pregunta {currentQuestion + 1}</p>
            <h3 className="text-lg font-bold text-white leading-snug">{q.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {q.options.map((option, i) => {
              let btnStyle = 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-purple-400/20 text-white';
              if (showResult) {
                if (i === q.correct) btnStyle = 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200';
                else if (i === selectedAnswer && !isCorrect) btnStyle = 'bg-red-500/20 border-red-400/40 text-red-200';
                else btnStyle = 'bg-white/[0.02] border-white/[0.04] text-white/40';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all text-sm font-medium ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-purple-200/70">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                    {showResult && i === q.correct && <span className="ml-auto text-emerald-400">✓</span>}
                    {showResult && i === selectedAnswer && !isCorrect && i !== q.correct && <span className="ml-auto text-red-400">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Correct counter */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-200/50">
            <span className="text-emerald-400">✓ {correctAnswers}</span>
            <span>correctas</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // RESULTS
  if (phase === 'results' && selectedJob) {
    const ratio = correctAnswers / questions.length;
    const earned = Math.floor(selectedJob.pay * (0.5 + ratio * 0.5));
    const percentage = Math.round(ratio * 100);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
        <div className="bg-gradient-to-b from-[#1e1e38]/95 to-[#141428]/95 rounded-2xl border border-purple-400/20 p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-3">
            {ratio >= 0.8 ? '🎉' : ratio >= 0.6 ? '👍' : '💪'}
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-1">¡Trabajo Completado!</h2>
          <p className="text-purple-200/60 text-sm mb-5">{selectedJob.name}</p>

          {/* Score */}
          <div className="bg-white/[0.04] rounded-xl p-4 mb-4 border border-white/[0.06]">
            <p className="text-purple-200/50 text-xs uppercase tracking-wider mb-1">Respuestas correctas</p>
            <p className="text-3xl font-black text-white">{correctAnswers}/{questions.length}</p>
            <p className="text-sm text-purple-200/40 mt-0.5">{percentage}% de precisión</p>
          </div>

          {/* Earnings */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl p-4 mb-5 border border-amber-400/20">
            <p className="text-amber-300/70 text-xs uppercase tracking-wider mb-1">Dinero ganado</p>
            <p className="text-4xl font-black text-amber-300" style={{ textShadow: '0 0 15px rgba(251,191,36,0.3)' }}>
              +${earned.toLocaleString()}
            </p>
          </motion.div>

          <button 
            onClick={() => { useGameStore.getState().setGamePhase('playing'); onClose(); }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#0a0318] font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 active:scale-95 shadow-[0_4px_15px_rgba(34,211,238,0.3)] transition-all"
          >
            Continuar →
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
