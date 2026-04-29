import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { CityBackground } from './CityBackground';

export function LoadingScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const setLoading = useUIStore((s) => s.setLoading);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Inicializando Purple City...');
  const [show, setShow] = useState(false);
  const [showBg, setShowBg] = useState(false);
  const [done, setDone] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { 
    setShow(true);
    
    // Iniciar música solo si no existe ya
    const existingMusic = (window as unknown as Record<string, unknown>).__legendsMusic as HTMLAudioElement | undefined;
    
    if (!existingMusic) {
      const music = new Audio('/audio/inicio.mp3');
      music.loop = true;
      music.volume = 0.35;
      musicRef.current = music;
      music.play().catch(() => {});
      (window as unknown as Record<string, unknown>).__legendsMusic = music;
    } else {
      musicRef.current = existingMusic;
    }
  }, []);

  // Progress bar con lógica de develop pero más lento
  useEffect(() => {
    const phases = [
      { at: 15, text: 'Cargando modelos 3D...' },
      { at: 30, text: 'Renderizando Purple City...' },
      { at: 50, text: 'Preparando beats...' },
      { at: 70, text: 'Configurando el estudio...' },
      { at: 90, text: 'Casi listo...' },
    ];
    
    const iv = setInterval(() => {
      setProgress((p) => {
        // Incremento rápido: 2-4 por tick para completar en ~2 segundos
        const next = p + Math.random() * 2 + 2;
        
        // Mostrar fondo al 20%
        if (next >= 20 && !showBg) {
          setShowBg(true);
        }
        
        if (next >= 100) {
          clearInterval(iv);
          setDone(true);
          setTimeout(() => {
            setLoading(false);
            setScreen('main_menu');
          }, 400); // Reduced from 1000ms
          return 100;
        }
        
        const ph = phases.filter((x) => x.at <= next).pop();
        if (ph) setPhase(ph.text);
        return next;
      });
    }, 50); // 50ms per tick = ~2 seconds total
    
    return () => clearInterval(iv);
  }, [setScreen, setLoading, showBg]);

  const pct = Math.floor(progress);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${done ? 'opacity-0' : 'opacity-100'}`}>
      {/* Fondo negro inicial */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-purple-900 to-black" />
      
      {/* Fondo de ciudad que aparece gradualmente */}
      <div className={`absolute inset-0 transition-opacity duration-2000 ${showBg ? 'opacity-100' : 'opacity-0'}`}>
        <CityBackground />
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

      {show && (
        <div className="relative z-10 flex flex-col items-center justify-end h-full px-8 pb-16">
          <div className="w-full max-w-2xl">

            {/* Contenedor de carga con efecto glassmorphism */}
            <div className="backdrop-blur-md bg-black/40 border border-cyan-500/20 rounded-2xl p-8 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(34,211,238,0.1), inset 0 0 20px rgba(0,0,0,0.3)' }}>
              
              {/* Phase text */}
              <p className="text-base md:text-lg font-mono mb-4 tracking-wide text-center"
                style={{
                  color: 'rgba(200,220,240,0.9)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}>
                {phase}
              </p>

              {/* Barra de progreso con múltiples capas */}
              <div className="relative">
                {/* Glow exterior */}
                <div className="absolute -inset-1 rounded-full blur-sm"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) ${progress}%, transparent ${progress}%)`,
                  }} />
                
                {/* Barra principal */}
                <div className="relative h-6 md:h-7 rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(0,0,0,0.7)',
                    border: '2px solid rgba(34,211,238,0.2)',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 2px 6px rgba(0,0,0,0.6)',
                  }}>
                  
                  {/* Progreso con gradiente animado */}
                  <div className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9, #22d3ee, #0891b2)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s linear infinite',
                      boxShadow: '0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.3)',
                    }}>
                    
                    {/* Brillo superior */}
                    <div className="absolute inset-0 rounded-full"
                      style={{ 
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      }} />
                    
                    {/* Onda animada */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        animation: 'shimmer 2s ease-in-out infinite',
                      }} />
                    </div>
                    
                    {/* Puntos de luz */}
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-full bg-white/30"
                        style={{
                          left: `${i * 20}%`,
                          animation: `pulse-neon ${1 + i * 0.2}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Porcentaje con efecto neon */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      style={{
                        animation: `pulse-neon ${0.6 + i * 0.2}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                
                <span className="text-2xl md:text-3xl font-black font-mono"
                  style={{
                    color: '#22d3ee',
                    textShadow: '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.5), 0 0 30px rgba(34,211,238,0.3)',
                  }}>
                  {pct}%
                </span>
              </div>
            </div>

            {/* Texto inferior */}
            <p className="text-center mt-8 text-xs md:text-sm text-cyan-300/50 font-mono tracking-wider">
              Purple City, 2015 · Preparando tu carrera musical...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;