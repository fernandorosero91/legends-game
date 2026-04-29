import { useState, useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useInsForge';
import { CityBackground } from './CityBackground';

/* SVG Icons */
const IconMic = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const IconDisc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconTrophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const IconSliders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="4" y1="21" y2="14"/>
    <line x1="4" x2="4" y1="10" y2="3"/>
    <line x1="12" x2="12" y1="21" y2="12"/>
    <line x1="12" x2="12" y1="8" y2="3"/>
    <line x1="20" x2="20" y1="21" y2="16"/>
    <line x1="20" x2="20" y1="12" y2="3"/>
    <line x1="2" x2="6" y1="14" y2="14"/>
    <line x1="10" x2="14" y1="8" y2="8"/>
    <line x1="18" x2="22" y1="16" y2="16"/>
  </svg>
);

const IconHeadphones = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
  </svg>
);

export function MainMenu() {
  const setScreen = useUIStore((s) => s.setScreen);
  const { isAuthenticated, user } = useAuth();
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const btnSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);

    // Pick up music from loading screen
    const existing = (window as unknown as Record<string, unknown>).__legendsMusic as HTMLAudioElement | undefined;
    if (existing) bgMusicRef.current = existing;
  }, []);

  const playBtnSound = useCallback(() => {
    if (btnSfxRef.current) {
      btnSfxRef.current.currentTime = 0;
      btnSfxRef.current.play().catch(() => {});
    } else {
      const sfx = new Audio('/audio/button.mp3');
      sfx.volume = 0.5;
      btnSfxRef.current = sfx;
      sfx.play().catch(() => {});
    }
  }, []);

  const handleHover = useCallback((id: string) => {
    setHovered(id);
    playBtnSound();
  }, [playBtnSound]);

  const handleClick = useCallback((target: Parameters<typeof setScreen>[0]) => {
    playBtnSound();
    if (bgMusicRef.current) bgMusicRef.current.pause();
    
    // Si presiona JUGAR
    if (target === 'game') {
      if (!isAuthenticated) {
        // No hay sesión, ir a auth
        setScreen('auth' as any);
        return;
      }
      if (user?.needsCharacterSetup) {
        // Tiene sesión pero necesita elegir personaje
        setScreen('character_select' as any);
        return;
      }
      // Tiene sesión y personaje, ir al juego
      setScreen('game');
      return;
    }
    
    // Si presiona CONTINUAR y no está autenticado, ir a auth
    if (target === 'save_load' && !isAuthenticated) {
      setScreen('auth' as any);
      return;
    }
    
    setScreen(target);
  }, [setScreen, playBtnSound, isAuthenticated, user]);

  const secondaryBtns = [
    { id: 'continue', label: 'CONTINUAR', icon: <IconDisc />, target: 'save_load' as const },
    { id: 'ranking', label: 'RANKING', icon: <IconTrophy />, target: 'leaderboard' as const },
    { id: 'options', label: 'OPCIONES', icon: <IconSliders />, target: 'settings' as const },
    { id: 'credits', label: 'CRÉDITOS', icon: <IconHeadphones />, target: 'credits' as const },
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <CityBackground />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
      }} />

      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-12 px-6">

        {/* ===== PLAY BUTTON ===== */}
        <div className={`mb-5 transition-all duration-500 delay-200 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={() => handleClick('game')}
            onMouseEnter={() => handleHover('new')}
            onMouseLeave={() => { setHovered(null); setPressed(null); }}
            onMouseDown={() => setPressed('new')}
            onMouseUp={() => setPressed(null)}
            className="relative cursor-pointer select-none focus:outline-none group"
            style={{
              transform: pressed === 'new' ? 'translateY(4px)' : hovered === 'new' ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'transform 0.12s ease',
            }}>

            {/* Hover glow behind button */}
            <div className="absolute -inset-2 rounded-3xl transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse, rgba(34,211,238,0.2), transparent 70%)',
                opacity: hovered === 'new' ? 1 : 0,
              }} />

            <div className="relative flex items-center justify-center gap-3 px-24 md:px-32 py-5 md:py-6 rounded-2xl"
              style={{
                background: hovered === 'new'
                  ? 'linear-gradient(180deg, #40e0f0 0%, #18bcd8 45%, #0a9ab5 100%)'
                  : 'linear-gradient(180deg, #34d4e8 0%, #0ea5c7 45%, #0880a0 100%)',
                border: '3px solid rgba(6,90,114,0.8)',
                borderTop: '3px solid rgba(100,230,255,0.3)',
                boxShadow: pressed === 'new'
                  ? '0 2px 0 #043a4a, inset 0 2px 6px rgba(0,0,0,0.25)'
                  : '0 6px 0 #043a4a, 0 10px 20px rgba(0,0,0,0.5)',
              }}>

              {/* Inner gloss */}
              <div className="absolute top-[3px] left-4 right-4 h-[42%] rounded-t-xl pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)' }} />
              
              {/* Bottom inner shadow */}
              <div className="absolute bottom-0 left-2 right-2 h-[20%] rounded-b-xl pointer-events-none"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.15) 0%, transparent 100%)' }} />

              <span className="text-white"><IconMic /></span>
              <span className="text-2xl md:text-3xl font-black tracking-[0.18em] uppercase"
                style={{
                  color: '#fff',
                  fontFamily: "'Arial Black', 'Impact', sans-serif",
                  textShadow: '0 2px 0 rgba(0,0,0,0.3)',
                }}>
                JUGAR
              </span>
            </div>
          </button>
        </div>

        {/* ===== SECONDARY BUTTONS ===== */}
        <div className={`flex items-center gap-3 md:gap-4 flex-wrap justify-center transition-all duration-500 delay-400 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {secondaryBtns.map((btn) => {
            const isH = hovered === btn.id;
            const isP = pressed === btn.id;
            return (
              <button key={btn.id}
                onClick={() => handleClick(btn.target)}
                onMouseEnter={() => handleHover(btn.id)}
                onMouseLeave={() => { setHovered(null); setPressed(null); }}
                onMouseDown={() => setPressed(btn.id)}
                onMouseUp={() => setPressed(null)}
                className="relative cursor-pointer select-none focus:outline-none"
                style={{
                  transform: isP ? 'translateY(3px)' : isH ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.12s ease',
                }}>

                {/* Hover glow */}
                {isH && (
                  <div className="absolute -inset-1.5 rounded-2xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.12), transparent 70%)' }} />
                )}

                <div className="relative flex items-center gap-2.5 px-7 md:px-8 py-3.5 md:py-4 rounded-xl"
                  style={{
                    background: isH
                      ? 'linear-gradient(180deg, #3e3e58 0%, #2e2e46 45%, #242438 100%)'
                      : 'linear-gradient(180deg, #333348 0%, #262638 45%, #1e1e30 100%)',
                    border: '2px solid',
                    borderColor: isH ? 'rgba(34,211,238,0.35)' : 'rgba(60,60,90,0.6)',
                    borderTopColor: isH ? 'rgba(120,120,170,0.4)' : 'rgba(80,80,110,0.5)',
                    boxShadow: isP
                      ? '0 1px 0 #0a0a14, inset 0 2px 4px rgba(0,0,0,0.3)'
                      : '0 4px 0 #0c0c18, 0 6px 14px rgba(0,0,0,0.45)',
                  }}>

                  {/* Inner gloss */}
                  <div className="absolute top-[2px] left-3 right-3 h-[38%] rounded-t-lg pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)' }} />

                  <span className="transition-colors duration-150"
                    style={{ color: isH ? '#22d3ee' : '#7a7a9a' }}>
                    {btn.icon}
                  </span>
                  <span className="text-sm md:text-base font-bold tracking-[0.1em] uppercase transition-colors duration-150"
                    style={{
                      color: isH ? '#f0f0f8' : '#a0a0b8',
                      fontFamily: "'Arial Black', 'Impact', sans-serif",
                      textShadow: '0 1px 0 rgba(0,0,0,0.35)',
                    }}>
                    {btn.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Version + Session info */}
        {isAuthenticated && user && (
          <p className={`mt-4 text-xs font-mono transition-all duration-700 delay-600 ${show ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: 'rgba(34,211,238,0.5)', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
            🎤 {user.username}
          </p>
        )}
        <p className={`mt-2 text-[10px] font-mono transition-all duration-700 delay-700 ${show ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: 'rgba(130,130,160,0.25)', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
          v1.0 · Purple City, 2015
        </p>
      </div>
    </div>
  );
}

export default MainMenu;