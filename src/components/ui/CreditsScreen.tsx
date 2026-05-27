/**
 * LEGENDS: Credits Screen — Professional glassmorphism UI
 */

import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { CityBackground } from './CityBackground';

/* ─── SVG Icons ─── */
const IcoBack = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoPalette = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.24-.3-.39-.65-.39-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9.42-10-9.92z" />
  </svg>
);
const IcoCode = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IcoLink = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IcoBook = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IcoHeart = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IcoFilm = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    <line x1="17" y1="17" x2="22" y2="17" />
  </svg>
);

/* ─── Tech icons (inline SVG) ─── */
const IcoReact = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5">
    <circle cx="12" cy="12" r="2.5" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);
const IcoTS = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178c6" /><text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="monospace">TS</text></svg>
);
const IcoCube = () => (
  <svg width="20" height="20" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IcoWind = () => (
  <svg width="20" height="20" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);
const IcoBear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="6" r="3" /><circle cx="16" cy="6" r="3" /><path d="M6 9a6 6 0 0 0 12 0v2a6 6 0 0 1-12 0V9z" /><ellipse cx="12" cy="16" rx="7" ry="5" />
  </svg>
);
const IcoZap = () => (
  <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IcoMotion = () => (
  <svg width="20" height="20" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" /><path d="M12 6v6l4 2" />
  </svg>
);
const IcoFlame = () => (
  <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.5-2.5 1.5-3.5l1 1z" />
  </svg>
);

const sectionIcons: Record<string, React.ReactNode> = {
  'UI/UX Design & Frontend': <IcoPalette />,
  'Narrative Design & Content': <IcoBook />,
  'Systems & Game Logic': <IcoCode />,
  'Backend & Integration': <IcoLink />,
};

const sectionColors: Record<string, string> = {
  'UI/UX Design & Frontend': '#22d3ee',
  'Narrative Design & Content': '#c084fc',
  'Systems & Game Logic': '#34d399',
  'Backend & Integration': '#f59e0b',
};

export function CreditsScreen() {
  const setScreen = useUIStore((s) => s.setScreen);

  const handleBack = () => setScreen('main_menu');

  const credits = [
    {
      title: 'Desarrolladores',
      team: [
        { name: 'Nicol', role: '', contributions: '' },
        { name: 'Yeraldin', role: '', contributions: '' },
        { name: 'Felipe', role: '', contributions: '' },
        { name: 'Fernando', role: '', contributions: '' },
      ],
    },
  ];

  const technologies = [
    { name: 'React 19', icon: <IcoReact /> },
    { name: 'TypeScript 6', icon: <IcoTS /> },
    { name: 'Three.js', icon: <IcoCube /> },
    { name: 'Tailwind CSS 4', icon: <IcoWind /> },
    { name: 'Zustand', icon: <IcoBear /> },
    { name: 'Framer Motion', icon: <IcoMotion /> },
    { name: 'Vite', icon: <IcoZap /> },
    { name: 'InsForge', icon: <IcoFlame /> },
  ];

  const specialThanks = [
    'Universidad Cooperativa de Colombia',
    'Docente: Jonathan Mideros',
    'A todos los que creyeron en este proyecto',
    'A ti, por jugar LEGENDS',
  ];

  return (
    <div className="fixed inset-0 z-50">
      <CityBackground />
      <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.82)', backdropFilter: 'blur(6px)' }} />

      {/* Sticky header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6"
        style={{ background: 'linear-gradient(to bottom, rgba(5,3,12,0.95) 0%, rgba(5,3,12,0.6) 70%, transparent 100%)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all">
            <IcoBack /> VOLVER
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)' }}>
              <IcoFilm />
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-wider"
              style={{ background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CREDITOS
            </h1>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 h-full overflow-y-auto pt-20 pb-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Game title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center space-y-3 py-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-wider"
              style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LEGENDS
            </h2>
            <p className="text-lg text-cyan-400 font-semibold tracking-wider">The Music Career Simulator</p>
            <p className="text-sm text-gray-500 italic">"Si algo vale la pena, vale la pena la lucha."</p>
          </motion.div>

          {/* Team — un solo cuadro bonito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl border border-white/[0.08] p-6 md:p-8 text-center"
            style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.7), rgba(10,6,22,0.8))', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(124,58,237,0.1)' }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">👨‍💻</span>
              <h3 className="text-lg font-black text-white tracking-wider uppercase">Desarrolladores</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Nicol Muñoz', 'Fernando Rosero', 'Yeraldin Araujo', 'Felipe Narvaez'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${['#22d3ee','#c084fc','#34d399','#f59e0b'][i]}30, ${['#22d3ee','#c084fc','#34d399','#f59e0b'][i]}10)`,
                      border: `2px solid ${['#22d3ee','#c084fc','#34d399','#f59e0b'][i]}40`,
                      color: ['#22d3ee','#c084fc','#34d399','#f59e0b'][i],
                      boxShadow: `0 0 20px ${['#22d3ee','#c084fc','#34d399','#f59e0b'][i]}20`,
                    }}>
                    {name[0]}
                  </div>
                  <p className="text-sm font-bold text-white">{name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Universidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-2xl border border-white/[0.06] p-5 md:p-6 text-center"
            style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.6), rgba(10,6,22,0.7))', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">🎓</span>
              <h3 className="text-base font-bold text-cyan-400 tracking-wider">Universidad Cooperativa de Colombia</h3>
            </div>
            <p className="text-sm text-gray-300">Docente: <span className="font-semibold text-white">Jonathan Mideros</span></p>
          </motion.div>

          {/* Technologies */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="rounded-2xl border border-white/[0.06] p-5 md:p-6 space-y-4"
            style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.6), rgba(10,6,22,0.7))', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-400"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}>
                <IcoCode />
              </div>
              <h3 className="text-base font-bold text-purple-400 tracking-wider">Tecnologias Utilizadas</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {technologies.map((tech) => (
                <div key={tech.name}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] transition-all hover:border-white/[0.12]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {tech.icon}
                  <span className="text-xs font-semibold text-gray-300 tracking-wide">{tech.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Special thanks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
            className="rounded-2xl border border-white/[0.06] p-5 md:p-6 space-y-3"
            style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.6), rgba(10,6,22,0.7))', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-pink-400"
                style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.15)' }}>
                <IcoHeart />
              </div>
              <h3 className="text-base font-bold text-pink-400 tracking-wider">Agradecimientos Especiales</h3>
            </div>
            <ul className="space-y-2 pl-1">
              {specialThanks.map((thanks, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 flex-shrink-0" />
                  <span>{thanks}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Footer info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}
            className="text-center space-y-2 py-6">
            <p className="text-xs text-gray-600 tracking-wider">
              &copy; 2026 LEGENDS Team. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-600 tracking-wider flex items-center justify-center gap-1.5">
              Desarrollado con <span className="text-pink-400"><IcoHeart /></span> en Purple City
            </p>
            <p className="text-[11px] text-gray-700 font-mono tabular-nums tracking-wider">
              v1.0.0 &middot; Build 2026.04.26
            </p>
          </motion.div>

          {/* Easter egg */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="text-center pb-4">
            <p className="text-[11px] text-gray-700 italic tracking-wider">
              "Keep grinding, keep creating, keep being legendary."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CreditsScreen;
