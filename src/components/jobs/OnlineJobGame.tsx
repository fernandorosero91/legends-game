/**
 * 🎮 LEGENDS: Online Job Game
 * Minijuego de trabajos online — estilo pantalla de computadora decorada.
 * Usa banco de preguntas estático (inmediato) y genera con IA en background para la siguiente ronda.
 * Dificultad escala por nivel del juego.
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

const ONLINE_JOBS: OnlineJob[] = [
  { id: 'emails', name: 'Redacción de Correos', icon: '📧', pay: 200, energyCost: 15, description: 'Responde correos de clientes', color: '#22d3ee', minLevel: 1 },
  { id: 'fichas', name: 'Fichas Técnicas', icon: '📋', pay: 350, energyCost: 20, description: 'Completa fichas de productos', color: '#a78bfa', minLevel: 2 },
  { id: 'logos', name: 'Diseño de Logos', icon: '🎨', pay: 500, energyCost: 25, description: 'Crea logos para empresas', color: '#f59e0b', minLevel: 3 },
  { id: 'video', name: 'Edición de Video', icon: '🎬', pay: 700, energyCost: 30, description: 'Edita videos promocionales', color: '#ec4899', minLevel: 4 },
  { id: 'web', name: 'Desarrollo Web', icon: '💻', pay: 1000, energyCost: 40, description: 'Desarrolla sitios web freelance', color: '#10b981', minLevel: 5 },
];

// ─── Question bank — por categoría de trabajo ────────────────────────────────

const QUESTIONS_BY_JOB: Record<string, Question[]> = {
  emails: [
    { question: '¿Cuál es el saludo formal más apropiado en un email?', options: ['Hola amigo', 'Estimado/a', 'Hey', 'Qué más'], correct: 1 },
    { question: '¿Qué significa CC en un correo?', options: ['Correo Confirmado', 'Con Copia', 'Correo Certificado', 'Copia Central'], correct: 1 },
    { question: '¿Qué NO debes hacer en un email de trabajo?', options: ['Ser claro', 'Revisar ortografía', 'ESCRIBIR TODO EN MAYÚSCULAS', 'Ser conciso'], correct: 2 },
    { question: '¿Qué significa BCC?', options: ['Big Carbon Copy', 'Blind Carbon Copy', 'Best Copy Contact', 'Basic Copy Control'], correct: 1 },
    { question: '¿Qué es un "follow up"?', options: ['Un saludo', 'Un seguimiento', 'Una queja', 'Un adiós'], correct: 1 },
    { question: '¿Cuál es el tono ideal para un email comercial?', options: ['Informal', 'Agresivo', 'Profesional y amable', 'Indiferente'], correct: 2 },
    { question: '¿Qué debe ir siempre en un email profesional?', options: ['Emojis', 'Asunto claro', 'Colores', 'Memes'], correct: 1 },
    { question: '¿Cuánto debe durar máximo un email efectivo?', options: ['10 páginas', '2-3 párrafos', '1 palabra', '50 párrafos'], correct: 1 },
  ],
  fichas: [
    { question: '¿Qué es RAM en un computador?', options: ['Disco duro', 'Memoria temporal', 'Procesador', 'Pantalla'], correct: 1 },
    { question: '¿Qué significa WiFi?', options: ['Wireless Fidelity', 'Wide Finder', 'Web Interface', 'Wire Free'], correct: 0 },
    { question: '¿Qué es un SSD?', options: ['Un procesador', 'Disco de estado sólido', 'Una tarjeta gráfica', 'Un monitor'], correct: 1 },
    { question: '¿Cuántos bits tiene un byte?', options: ['4', '8', '16', '32'], correct: 1 },
    { question: '¿Qué es la nube (cloud)?', options: ['El cielo', 'Servidores remotos', 'Un programa', 'Un cable'], correct: 1 },
    { question: '¿Qué significa USB?', options: ['Universal Serial Bus', 'Ultra Speed Byte', 'United System Board', 'Universal System'], correct: 0 },
    { question: '¿Qué es un firewall?', options: ['Un virus', 'Una pared real', 'Protección de red', 'Un navegador'], correct: 2 },
    { question: '¿Qué es Bluetooth?', options: ['Un cable', 'Conexión inalámbrica corta', 'Un disco', 'Una app'], correct: 1 },
  ],
  logos: [
    { question: '¿Qué es RGB?', options: ['Un formato de audio', 'Colores: Rojo, Verde, Azul', 'Un tipo de letra', 'Una marca'], correct: 1 },
    { question: '¿Qué programa se usa para diseño gráfico?', options: ['Excel', 'Photoshop', 'PowerPoint', 'Notepad'], correct: 1 },
    { question: '¿Qué es un logo isotipo?', options: ['Logo con texto', 'Solo símbolo sin texto', 'Logo animado', 'Logo en 3D'], correct: 1 },
    { question: '¿Qué formato es mejor para logos con transparencia?', options: ['JPG', 'BMP', 'PNG', 'MP3'], correct: 2 },
    { question: '¿Qué es el kerning?', options: ['Un color', 'Espacio entre letras', 'Un tipo de fuente', 'Una imagen'], correct: 1 },
    { question: '¿Qué es un mockup?', options: ['Un error', 'Una vista previa/maqueta', 'Un cliente', 'Un pago'], correct: 1 },
    { question: '¿Qué es CMYK?', options: ['Colores para pantalla', 'Colores para impresión', 'Un formato', 'Un programa'], correct: 1 },
    { question: '¿Qué es tipografía?', options: ['Un color', 'El arte de las letras', 'Una foto', 'Un sonido'], correct: 1 },
  ],
  video: [
    { question: '¿Qué significa FPS en video?', options: ['Files Per Second', 'Frames Per Second', 'Format Per Size', 'Fast Play Speed'], correct: 1 },
    { question: '¿Qué resolución es 4K?', options: ['1920x1080', '2560x1440', '3840x2160', '1280x720'], correct: 2 },
    { question: '¿Qué programa se usa para editar video?', options: ['Photoshop', 'Premiere Pro', 'Excel', 'Word'], correct: 1 },
    { question: '¿Qué es el bitrate?', options: ['El color', 'Calidad/peso por segundo', 'El sonido', 'La duración'], correct: 1 },
    { question: '¿Qué es un storyboard?', options: ['Un juego', 'Guión visual con dibujos', 'Una animación', 'Un poster'], correct: 1 },
    { question: '¿Qué formato de video es más universal?', options: ['AVI', 'MP4', 'FLV', 'WMV'], correct: 1 },
    { question: '¿Qué es color grading?', options: ['Pintar', 'Ajustar colores del video', 'Borrar colores', 'Añadir texto'], correct: 1 },
    { question: '¿Qué es un corte en edición?', options: ['Borrar todo', 'Transición entre tomas', 'Un efecto', 'Un sonido'], correct: 1 },
  ],
  web: [
    { question: '¿Qué lenguaje se usa para páginas web?', options: ['Python', 'Java', 'HTML/CSS/JS', 'C++'], correct: 2 },
    { question: '¿Qué significa API?', options: ['Application Programming Interface', 'Auto Program Install', 'Advanced PC Input', 'App Index'], correct: 0 },
    { question: '¿Qué es un bug?', options: ['Un insecto', 'Un error en el código', 'Un programa', 'Un computador'], correct: 1 },
    { question: '¿Qué es GitHub?', options: ['Red social', 'Plataforma para código', 'Un juego', 'Un navegador'], correct: 1 },
    { question: '¿Qué hace un frontend developer?', options: ['Servidores', 'Lo que ve el usuario', 'Bases de datos', 'Redes'], correct: 1 },
    { question: '¿Qué es responsive design?', options: ['Diseño rápido', 'Se adapta a pantallas', 'Diseño 3D', 'Diseño animado'], correct: 1 },
    { question: '¿Qué es una base de datos?', options: ['Programa de dibujo', 'Almacén de información', 'Un virus', 'Un cable'], correct: 1 },
    { question: '¿Qué es CSS?', options: ['Un lenguaje de estilos', 'Un servidor', 'Una base de datos', 'Un navegador'], correct: 0 },
  ],
};

function getQuestionsForJob(jobId: string): Question[] {
  const pool = QUESTIONS_BY_JOB[jobId] || QUESTIONS_BY_JOB['emails'];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
}

// ─── AI background generation (for next round, not blocking) ─────────────────

const AI_CACHE_KEY = 'legends-ai-questions-cache';

function getCachedQuestions(jobId: string): Question[] | null {
  try {
    const raw = sessionStorage.getItem(`${AI_CACHE_KEY}-${jobId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      sessionStorage.removeItem(`${AI_CACHE_KEY}-${jobId}`); // Use once
      return parsed;
    }
  } catch {}
  return null;
}

function generateAIQuestionsInBackground(level: number, jobId: string, jobName: string) {
  const cacheKey = `${AI_CACHE_KEY}-${jobId}`;
  // Fire and forget — generates questions for next time
  (async () => {
    try {
      const { insforge } = await import('../../services/insforge');
      const { data: user } = await insforge.auth.getCurrentUser();
      if (!user) return;

      const difficulty = level <= 2 ? 'fáciles' : level <= 4 ? 'dificultad media' : 'difíciles';
      const completion = await insforge.ai.chat.completions.create({
        model: 'deepseek/deepseek-v4-flash',
        messages: [{
          role: 'user',
          content: `Genera 5 preguntas de trivia en español sobre "${jobName}", ${difficulty}. Las preguntas deben ser sobre temas relacionados con ese trabajo. Responde SOLO JSON: [{"question":"...","options":["a","b","c","d"],"correct":0}]. "correct" = índice 0-3.`
        }],
        temperature: 0.95,
        maxTokens: 500,
      });
      const content = completion.choices[0]?.message?.content || '';
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          sessionStorage.setItem(cacheKey, JSON.stringify(parsed.slice(0, 5)));
        }
      }
    } catch {}
  })();
}

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = 'select_job' | 'working' | 'results';

export function OnlineJobGame({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('select_job');
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

  // Play completion sound when results show
  useEffect(() => {
    if (phase === 'results') {
      try {
        const audio = new Audio('/audio/level-complete.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch {}
    }
  }, [phase]);

  // On mount: trigger AI generation for all available jobs in background
  useEffect(() => {
    availableJobs.forEach(job => {
      generateAIQuestionsInBackground(currentLevel, job.id, job.name);
    });
  }, [currentLevel]);

  const handleSelectJob = (job: OnlineJob) => {
    if (energy < job.energyCost) {
      addNotification('warning', `⚡ Necesitas ${job.energyCost} de energía`);
      return;
    }
    setSelectedJob(job);
    consumeEnergy(job.energyCost);

    // Use AI cache for this specific job if available, otherwise static
    const cached = getCachedQuestions(job.id);
    const finalQuestions = cached || getQuestionsForJob(job.id);
    setQuestions(finalQuestions);
    setCurrentQuestion(0);
    setCorrectAnswers(0);
    setTimeLeft(currentLevel <= 2 ? 15 : currentLevel <= 4 ? 12 : 10);
    setPhase('working');

    // Generate new AI questions for this job in background for next round
    generateAIQuestionsInBackground(currentLevel, job.id, job.name);
  };

  // Timer
  useEffect(() => {
    if (phase !== 'working' || showResult) return;
    const maxTime = currentLevel <= 2 ? 15 : currentLevel <= 4 ? 12 : 10;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleAnswer(-1); return maxTime; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, currentQuestion, showResult, currentLevel]);

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    clearInterval(timerRef.current);
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === questions[currentQuestion]?.correct) setCorrectAnswers(c => c + 1);

    const maxTime = currentLevel <= 2 ? 15 : currentLevel <= 4 ? 12 : 10;
    setTimeout(() => {
      if (currentQuestion >= questions.length - 1) {
        setPhase('results');
      } else {
        setCurrentQuestion(q => q + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(maxTime);
      }
    }, 900);
  };

  const handleFinish = () => {
    if (!selectedJob) return;
    const ratio = correctAnswers / questions.length;
    const earned = Math.floor(selectedJob.pay * (0.5 + ratio * 0.5));
    addMoney(earned);
    addNotification('success', `💼 +$${earned} por ${selectedJob.name}`);
    onClose();
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background — Purple city ambient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1450] via-[#1a0d35] to-[#0f0920]" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-5%] left-[5%] w-[35%] h-[35%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Floating icons */}
        {['💼', '📧', '💻', '📊', '🎨', '📱'].map((emoji, i) => (
          <div key={i} className="absolute select-none opacity-[0.08] text-3xl"
            style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 25}%`, transform: `rotate(${i * 12 - 30}deg)` }}>
            {emoji}
          </div>
        ))}
      </div>

      {/* Monitor frame */}
      <div className="absolute inset-3 sm:inset-4 lg:inset-6 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_80px_rgba(124,58,237,0.15),0_20px_60px_rgba(0,0,0,0.7)] border border-purple-500/20">

        {/* Monitor bezel */}
        <div className="h-10 bg-gradient-to-b from-[#2d2d38] to-[#1e1e28] border-b border-white/[0.08] flex items-center px-5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_4px_rgba(255,95,87,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_4px_rgba(254,188,46,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_4px_rgba(40,200,64,0.4)]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-purple-200/80 text-[11px] font-semibold tracking-[0.15em] uppercase">
              {selectedJob ? `${selectedJob.icon} ${selectedJob.name}` : '💼 Freelance Hub — Trabajos Online'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm transition-colors px-2">✕</button>
        </div>

        {/* Screen content */}
        <div className="flex-1 relative overflow-hidden">

          {/* ── Wallpaper decorativo ───────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e0a4a 0%, #0f1a3d 30%, #0a1628 50%, #12082e 70%, #1a0a3e 100%)' }} />
            {/* Large glowing orbs */}
            <div className="absolute top-[-15%] right-[5%] w-[55%] h-[55%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(99,102,241,0.12) 40%, transparent 70%)' }} />
            <div className="absolute bottom-[-10%] left-[0%] w-[50%] h-[50%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 40%, transparent 70%)' }} />
            <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 60%)' }} />
            <div className="absolute bottom-[25%] right-[15%] w-[35%] h-[35%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />
            {/* Floating work icons */}
            {[
              { symbol: '💼', x: 4, y: 10, size: 56, glow: '#22d3ee', rot: -10, opacity: 0.6 },
              { symbol: '📧', x: 90, y: 8, size: 48, glow: '#fbbf24', rot: 15, opacity: 0.55 },
              { symbol: '💻', x: 6, y: 70, size: 52, glow: '#06b6d4', rot: -5, opacity: 0.55 },
              { symbol: '📊', x: 88, y: 65, size: 44, glow: '#f59e0b', rot: 12, opacity: 0.5 },
              { symbol: '🎨', x: 94, y: 35, size: 50, glow: '#67e8f9', rot: -20, opacity: 0.55 },
              { symbol: '📱', x: 2, y: 42, size: 44, glow: '#fcd34d', rot: 8, opacity: 0.5 },
              { symbol: '🖥️', x: 78, y: 5, size: 42, glow: '#22d3ee', rot: -8, opacity: 0.45 },
              { symbol: '📋', x: 12, y: 88, size: 40, glow: '#fbbf24', rot: 18, opacity: 0.45 },
              { symbol: '✉️', x: 48, y: 3, size: 38, glow: '#a78bfa', rot: -12, opacity: 0.4 },
              { symbol: '🎬', x: 58, y: 92, size: 42, glow: '#ec4899', rot: 10, opacity: 0.45 },
              { symbol: '⚡', x: 30, y: 6, size: 36, glow: '#fbbf24', rot: 5, opacity: 0.4 },
              { symbol: '🌐', x: 72, y: 88, size: 38, glow: '#22d3ee', rot: -6, opacity: 0.4 },
            ].map((n, i) => (
              <div key={i} className="absolute select-none" style={{ left: `${n.x}%`, top: `${n.y}%`, fontSize: `${n.size}px`, opacity: n.opacity, transform: `rotate(${n.rot}deg)`, filter: `drop-shadow(0 0 12px ${n.glow}) drop-shadow(0 0 25px ${n.glow})` }}>{n.symbol}</div>
            ))}
            {/* Sparkles */}
            {[
              { x: 15, y: 20, s: 3 }, { x: 80, y: 15, s: 2.5 }, { x: 45, y: 80, s: 3 },
              { x: 90, y: 55, s: 2.5 }, { x: 25, y: 60, s: 3 }, { x: 70, y: 30, s: 2.5 },
              { x: 55, y: 10, s: 2 }, { x: 35, y: 45, s: 2 },
            ].map((s, i) => (
              <div key={`s${i}`} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: 0.5, boxShadow: `0 0 6px rgba(255,255,255,0.8), 0 0 12px rgba(200,200,255,0.4)` }} />
            ))}
            {/* Bottom wave */}
            <svg className="absolute bottom-1 left-0 right-0 h-10 opacity-[0.1]" preserveAspectRatio="none" viewBox="0 0 1000 30">
              <path d="M0,15 Q50,5 100,15 Q150,25 200,15 Q250,5 300,15 Q350,25 400,15 Q450,5 500,15 Q550,25 600,15 Q650,5 700,15 Q750,25 800,15 Q850,5 900,15 Q950,25 1000,15" fill="none" stroke="url(#wg)" strokeWidth="2"/>
              <defs><linearGradient id="wg"><stop offset="0%" stopColor="#7c3aed"/><stop offset="50%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#fbbf24"/></linearGradient></defs>
            </svg>
          </div>

          {/* ── SELECT JOB ─────────────────────────────────────── */}
          {phase === 'select_job' && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
              <div className="w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/[0.06]">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-3">
                    <span className="text-3xl">💼</span>
                  </div>
                  <h2 className="text-xl font-black text-white">Trabajos Disponibles</h2>
                  <p className="text-purple-300/50 text-xs mt-1">5 preguntas de conocimiento general • Nivel {currentLevel}</p>
                </div>
                <div className="space-y-2">
                  {availableJobs.map(job => (
                    <button key={job.id} onClick={() => handleSelectJob(job)}
                      disabled={energy < job.energyCost}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                        energy >= job.energyCost
                          ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                          : 'bg-white/[0.01] border-white/[0.04] opacity-40 cursor-not-allowed'
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${job.color}12`, border: `1px solid ${job.color}25` }}>
                          {job.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{job.name}</h3>
                          <p className="text-gray-500 text-[11px]">{job.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-300 font-bold text-sm">${job.pay}</div>
                          <div className="text-gray-600 text-[10px]">-{job.energyCost} ⚡</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── WORKING (QUIZ) ─────────────────────────────────── */}
          {phase === 'working' && questions.length > 0 && (() => {
            const q = questions[currentQuestion];
            if (!q) return null;
            const isCorrect = selectedAnswer === q.correct;
            const progress = ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100;
            const maxTime = currentLevel <= 2 ? 15 : currentLevel <= 4 ? 12 : 10;
            const timePercent = (timeLeft / maxTime) * 100;

            return (
              <div className="absolute inset-0 flex flex-col z-10">
                {/* Header bar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
                  <div className="flex-1">
                    <div className="h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className={`w-20 h-2.5 rounded-full overflow-hidden ${timeLeft <= 4 ? 'bg-red-900/40' : 'bg-white/[0.08]'}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 4 ? 'bg-red-500' : 'bg-emerald-400'}`}
                      style={{ width: `${timePercent}%` }} />
                  </div>
                  <span className={`text-sm font-bold min-w-[2.5rem] text-right ${timeLeft <= 4 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
                    {timeLeft}s
                  </span>
                </div>

                {/* Question card — centered with glassmorphism */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="w-full max-w-xl bg-black/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/[0.1] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                    {/* Question header badges */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-[11px] text-cyan-300 uppercase tracking-widest font-bold bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                        Pregunta {currentQuestion + 1} de {questions.length}
                      </span>
                      <span className="text-[11px] text-emerald-300 font-bold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                        ✓ {correctAnswers} correctas
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-snug mb-7">{q.question}</h3>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option, i) => {
                        let style = 'bg-white/[0.06] border-white/[0.12] hover:bg-purple-500/15 hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)] text-white';
                        if (showResult) {
                          if (i === q.correct) style = 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
                          else if (i === selectedAnswer && !isCorrect) style = 'bg-red-500/20 border-red-400/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
                          else style = 'bg-white/[0.02] border-white/[0.04] text-white/20';
                        }

                        return (
                          <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
                            className={`p-4 rounded-xl border-2 text-left transition-all text-sm font-medium ${style}`}>
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-xs font-black text-purple-300 shrink-0 border border-white/[0.1]">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="font-semibold leading-tight">{option}</span>
                              {showResult && i === q.correct && <span className="ml-auto text-emerald-400 text-lg">✓</span>}
                              {showResult && i === selectedAnswer && !isCorrect && i !== q.correct && <span className="ml-auto text-red-400 text-lg">✗</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── RESULTS ────────────────────────────────────────── */}
          {phase === 'results' && selectedJob && (() => {
            const ratio = correctAnswers / questions.length;
            const earned = Math.floor(selectedJob.pay * (0.5 + ratio * 0.5));
            const percentage = Math.round(ratio * 100);

            return (
              <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                <div className="text-center max-w-sm w-full bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/[0.06]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                    className="text-6xl mb-3">
                    {ratio >= 0.8 ? '🎉' : ratio >= 0.6 ? '👍' : '💪'}
                  </motion.div>

                  <h2 className="text-2xl font-black text-white">¡Felicidades!</h2>
                  <p className="text-purple-300/50 text-sm mb-5">Completaste: {selectedJob.name}</p>

                  <div className="bg-white/[0.04] rounded-xl p-4 mb-4 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">Correctas</span>
                      <span className="text-white font-black text-lg">{correctAnswers}/{questions.length}</span>
                    </div>
                    <div className="mt-2 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${ratio >= 0.8 ? 'bg-emerald-400' : ratio >= 0.6 ? 'bg-amber-400' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-5 mb-6 border border-amber-400/20">
                    <p className="text-amber-400/70 text-[10px] uppercase tracking-widest font-bold">Dinero ganado</p>
                    <p className="text-4xl font-black text-amber-300 mt-1" style={{ textShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
                      +${earned.toLocaleString()}
                    </p>
                  </motion.div>

                  <button onClick={handleFinish}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm hover:from-purple-500 hover:to-cyan-500 active:scale-[0.97] transition-all shadow-[0_4px_20px_rgba(124,58,237,0.25)]">
                    Continuar →
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
