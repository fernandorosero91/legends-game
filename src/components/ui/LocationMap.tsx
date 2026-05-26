/**
 * LEGENDS: LocationMap — Game-style map matching reference design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/* ─── SVG Icons (larger, bolder) ─── */
const IcoHome = () => <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoCoffee = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const IcoMusic = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IcoShirt = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcoUtensils = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>;
const IcoHeadphones = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;
const IcoGrad = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const IcoTruck = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoMic = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IcoClose = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoNav = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;

interface Location {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  /* Position as % of the map container */
  x: number;
  y: number;
  color: string;
  borderColor: string;
}

interface LocationMapProps {
  currentLocation: string;
  onSelectLocation: (locationId: string) => void;
  onClose: () => void;
}

/* Positions tuned to match mapa.png landmarks — only active locations */
const LOCATIONS: Location[] = [
  { id: 'apartment',  shortName: 'Hogar',       name: 'Mi Apartamento',         description: 'Descansa, graba y trabaja online.', icon: <IcoHome />,     x: 48, y: 44, color: '#a5b4fc', borderColor: '#6366f1' },
  { id: 'store',      shortName: 'Almacén',     name: 'Purple Market',          description: 'Trabaja como cajero.',               icon: <IcoShirt />,    x: 10, y: 48, color: '#6ee7b7', borderColor: '#059669' },
  { id: 'restaurant', shortName: 'Restaurante', name: 'Restaurante La Esquina', description: 'Trabaja como mesero.',               icon: <IcoUtensils />, x: 82, y: 50, color: '#fda4af', borderColor: '#e11d48' },
];

export function LocationMap({ currentLocation, onSelectLocation, onClose }: LocationMapProps) {
  const [selected, setSelected] = useState<Location | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const home = LOCATIONS.find((l) => l.id === 'apartment')!;
  const travel = (loc: Location) => { onSelectLocation(loc.id); onClose(); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Map container — NOT fullscreen, centered modal with aspect ratio */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9', boxShadow: '0 0 60px rgba(34,211,238,0.15), 0 20px 60px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Map image */}
        <img src="/mapa.png" alt="Purple City Map" className="absolute inset-0 w-full h-full object-cover" />

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <IcoClose />
        </button>

        {/* Connection lines — bright cyan neon */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.7)) drop-shadow(0 0 10px rgba(34,211,238,0.4))' }}>
          {LOCATIONS.map((loc) => {
            if (loc.id === 'apartment') return null;
            const active = hovered === loc.id;
            return (
              <motion.line key={`l-${loc.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: active ? 1 : 0.6 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                x1={`${home.x}%`} y1={`${home.y}%`}
                x2={`${loc.x}%`} y2={`${loc.y}%`}
                stroke="#22d3ee"
                strokeWidth={active ? 2.5 : 1.8}
                style={{ transition: 'opacity 0.15s, stroke-width 0.15s' }}
              />
            );
          })}
        </svg>

        {/* Location nodes */}
        {LOCATIONS.map((loc, i) => {
          const isCurrent = currentLocation === loc.id;
          const isHov = hovered === loc.id;
          const isSel = selected?.id === loc.id;
          const active = isHov || isSel;

          return (
            <motion.div key={loc.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 350, damping: 22 }}
              className="absolute z-20 cursor-pointer flex flex-col items-center"
              style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              onDoubleClick={() => travel(loc)}
            >
              {/* Pulse for current */}
              {isCurrent && (
                <motion.div className="absolute rounded-2xl"
                  style={{ inset: '-6px', border: `2px solid ${loc.borderColor}` }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              )}

              {/* Node box */}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{
                  background: active || isCurrent
                    ? `linear-gradient(145deg, ${loc.borderColor}50, ${loc.borderColor}25)`
                    : 'rgba(15,12,30,0.88)',
                  border: `2.5px solid ${active || isCurrent ? loc.borderColor : 'rgba(80,80,120,0.4)'}`,
                  boxShadow: active
                    ? `0 0 18px ${loc.borderColor}50, 0 4px 12px rgba(0,0,0,0.5)`
                    : isCurrent
                      ? `0 0 14px ${loc.borderColor}35, 0 4px 12px rgba(0,0,0,0.5)`
                      : '0 4px 12px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(6px)',
                  transform: active ? 'scale(1.12)' : 'scale(1)',
                }}>
                <span style={{ color: active || isCurrent ? loc.color : '#8090a8' }}>{loc.icon}</span>
              </div>

              {/* Label */}
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold tracking-wide whitespace-nowrap"
                style={{
                  background: 'rgba(8,6,18,0.8)',
                  backdropFilter: 'blur(4px)',
                  color: active || isCurrent ? '#fff' : '#c0c8d8',
                  textShadow: '0 1px 4px rgba(0,0,0,1)',
                }}>
                {loc.shortName}
              </span>

              {/* ACTUAL badge */}
              {isCurrent && (
                <span className="px-2 py-0.5 rounded text-[8px] font-black tracking-[0.12em]"
                  style={{ background: loc.borderColor, color: '#fff', boxShadow: `0 0 10px ${loc.borderColor}60` }}>
                  ACTUAL
                </span>
              )}
            </motion.div>
          );
        })}

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-72 rounded-xl overflow-hidden"
              style={{ background: 'rgba(12,8,25,0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              <div className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${selected.borderColor}20`, border: `1.5px solid ${selected.borderColor}40`, color: selected.color }}>
                  {selected.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{selected.name}</h3>
                  <p className="text-[10px] text-gray-400">{selected.description}</p>
                </div>
                <button onClick={() => travel(selected)} disabled={selected.id === currentLocation}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider text-white flex items-center gap-1.5 flex-shrink-0 disabled:opacity-30 transition-all"
                  style={{
                    background: selected.id === currentLocation ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${selected.borderColor}, ${selected.borderColor}cc)`,
                    boxShadow: selected.id === currentLocation ? 'none' : `0 2px 10px ${selected.borderColor}40`,
                  }}>
                  <IcoNav /> {selected.id === currentLocation ? 'AQUÍ' : 'IR'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
