import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';
import { CityBackground } from './CityBackground';

export function LoadingScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const setLoading = useUIStore((s) => s.setLoading);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('Inicializando Purple City...');
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [showBgAfterDone, setShowBgAfterDone] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { 
    setTimeout(() => setShow(true), 200);
    
    // Ocultar el título después de 2.5 segundos
    setTimeout(() => {
      setShowTitle(false);
    }, 2500);
    
    // Iniciar música solo si no existe ya
    setTimeout(() => {
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
    }, 300);
  }, []);

  // Progress bar con lógica de develop pero más lento
  useEffect(() => {
    const phases = [
      { at: 15, text: 'Cargando modelos 3D...' },
      { at: 30, text: 'Renderizando Purple City...' },
      { at: 45, text: 'Preparando beats...' },
      { at: 60, text: 'Conectando con SoundCloud...' },
      { at: 75, text: 'Configurando el estudio...' },
      { at: 90, text: 'Afinando instrumentos...' },
      { at: 98, text: 'Casi listo...' },
    ];
    
    console.log('[LoadingScreen] Starting progress animation');
    
    const iv = setInterval(() => {
      setProgress((p) => {
        // Incremento más controlado: entre 0.5 y 1.5 por tick
        const next = p + Math.random() * 1 + 0.5;
        
        if (next >= 100) {
          console.log('[LoadingScreen] Progress complete, showing background');
          clearInterval(iv);
          setDone(true);
          // Mostrar el fondo con fade-in después de completar
          setTimeout(() => setShowBgAfterDone(true), 300);
          // Transicionar al menú principal después de que el fondo se muestre
          setTimeout(() => {
            console.log('[LoadingScreen] Calling setScreen(main_menu)');
            setLoading(false);
            setScreen('main_menu');
          }, 2000);
          return 100;
        }
        
        const ph = phases.filter((x) => x.at <= next).pop();
        if (ph) setPhase(ph.text);
        return next;
      });
    }, 80); // 80ms por tick = aproximadamente 5-6 segundos total
    
    return () => {
      console.log('[LoadingScreen] Cleaning up interval');
      clearInterval(iv);
    };
  }, [setScreen, setLoading]);

  const pct = Math.floor(progress);

  return (
    <div className="fixed inset-0 z-50">
      {/* Fondo negro inicial */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-purple-900 to-black" />
      
      {/* Fondo de ciudad que aparece SOLO después de completar la carga */}
      <div className={`absolute inset-0 transition-opacity duration-1500 ${showBgAfterDone ? 'opacity-100' : 'opacity-0'}`}>
        <CityBackground />
      </div>

      {/* Partículas flotantes */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${done ? 'opacity-0' : 'opacity-100'}`}>
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
      <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 transition-opacity duration-700 ${done ? '!opacity-0' : ''}`} />

      {show && (
        <div className={`relative z-10 flex flex-col items-center justify-center h-full px-8 transition-opacity duration-700 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="w-full max-w-2xl">
            
            {/* Logo animado */}
            <div className={`text-center mb-12 animate-fade-in transition-opacity duration-1000 ease-out ${showTitle ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-wider"
                style={{
                  background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 50%, #164e63 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(34,211,238,0.3)',
                  fontFamily: "'Arial Black', 'Impact', sans-serif",
                }}>
                LEGENDS
              </h1>
              <p className="text-lg md:text-xl text-cyan-300 tracking-[0.3em] font-light"
                style={{ textShadow: '0 2px 10px rgba(34,211,238,0.5)' }}>
                THE MUSIC CAREER SIMULATOR
              </p>
            </div>

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