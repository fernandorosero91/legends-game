import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { CityBackground } from './CityBackground';
import { useMusic } from '../../hooks/useAudio';

export function LoadingScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const music = useMusic('/audio/inicio.mp3', 0.35);

  useEffect(() => { setTimeout(() => setShow(true), 200); }, []);

  useEffect(() => {
    const handler = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStarted(true);
      music.play();
      setPhase('Inicializando Purple City...');
    };
    window.addEventListener('click', handler);
    window.addEventListener('touchstart', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [music]);

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

      {show && (
        <div className="relative z-10 flex flex-col items-center justify-end h-full px-4 sm:px-8 pb-8 sm:pb-12">
          <div className="w-full max-w-2xl animate-fade-in">

            <p className="text-sm sm:text-base md:text-lg font-mono mb-2 sm:mb-3 tracking-wide"
              style={{
                color: !started ? 'rgba(34,211,238,0.9)' : 'rgba(200,220,240,0.7)',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                animation: !started ? 'pulse-neon 1.5s ease-in-out infinite' : 'none',
              }}>
              {!started ? '▶ Toca para iniciar' : phase}
            </p>

            <div className="relative h-4 sm:h-5 md:h-6 rounded-full overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(34,211,238,0.15)',
                boxShadow: '0 0 20px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.5)',
              }}>
              <div className="h-full rounded-full transition-all duration-200 ease-out relative"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9)',
                  boxShadow: '0 0 15px rgba(34,211,238,0.5)',
                }}>
                <div className="absolute inset-0 rounded-full"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
              </div>
            </div>

            <div className="flex justify-end mt-1.5 sm:mt-2">
              <span className="text-lg sm:text-xl md:text-2xl font-black font-mono"
                style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34,211,238,0.6)' }}>
                {started ? `${pct}%` : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
