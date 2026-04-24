import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { CityBackground } from './CityBackground';

export function LoadingScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Haz click para iniciar...');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { setTimeout(() => setShow(true), 200); }, []);

  // Start loading + music on first user interaction
  const handleStart = () => {
    if (started) return;
    setStarted(true);

    // Play background music
    const music = new Audio('/audio/inicio.mp3');
    music.loop = true;
    music.volume = 0.35;
    musicRef.current = music;
    music.play().catch(() => {});

    // Store music ref globally so MainMenu can access it
    (window as unknown as Record<string, unknown>).__legendsMusic = music;

    setPhase('Inicializando Purple City...');
  };

  // Listen for any click or key to start
  useEffect(() => {
    const handler = () => handleStart();
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [started]);

  // Progress bar runs only after started
  useEffect(() => {
    if (!started) return;

    const phases = [
      { at: 10, text: 'Cargando modelos 3D...' },
      { at: 25, text: 'Renderizando Purple City...' },
      { at: 40, text: 'Preparando beats...' },
      { at: 55, text: 'Conectando con SoundCloud...' },
      { at: 70, text: 'Configurando el estudio...' },
      { at: 85, text: 'Afinando instrumentos...' },
      { at: 95, text: 'Casi listo...' },
    ];
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 2 + 0.8;
        if (next >= 100) {
          clearInterval(iv);
          setDone(true);
          setTimeout(() => setScreen('main_menu'), 1000);
          return 100;
        }
        const ph = phases.filter((x) => x.at <= next).pop();
        if (ph) setPhase(ph.text);
        return next;
      });
    }, 70);
    return () => clearInterval(iv);
  }, [started, setScreen]);

  const pct = Math.floor(progress);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${done ? 'opacity-0' : 'opacity-100'}`}>
      <CityBackground />

      {/* Dark gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
      }} />

      {show && (
        <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-12">
          <div className="w-full max-w-2xl animate-fade-in">

            {/* "Click to start" or phase text */}
            <p className="text-base md:text-lg font-mono mb-3 tracking-wide"
              style={{
                color: !started ? 'rgba(34,211,238,0.8)' : 'rgba(200,220,240,0.7)',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                animation: !started ? 'pulse-neon 1.5s ease-in-out infinite' : 'none',
              }}>
              {!started ? '▶ Haz click para iniciar' : phase}
            </p>

            {/* Bar */}
            <div className="relative h-5 md:h-6 rounded-full overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(34,211,238,0.15)',
                boxShadow: '0 0 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.5)',
              }}>
              <div className="h-full rounded-full transition-all duration-200 ease-out relative"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9)',
                  boxShadow: '0 0 15px rgba(34,211,238,0.5), 0 0 30px rgba(34,211,238,0.2)',
                }}>
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }} />
                </div>
              </div>
            </div>

            {/* Percentage */}
            <div className="flex justify-end mt-2">
              <span className="text-xl md:text-2xl font-black font-mono"
                style={{
                  color: '#22d3ee',
                  textShadow: '0 0 10px rgba(34,211,238,0.6), 0 0 20px rgba(34,211,238,0.3)',
                }}>
                {started ? `${pct}%` : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
