/**
 * 🎮 LEGENDS: Character Select Screen — Professional UI
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuth } from '../../hooks/useInsForge';
import { CityBackground } from './CityBackground';

const IcoMale = () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.4 5.4M19 5h-5M19 5v5"/></svg>;
const IcoFemale = () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>;
const IcoCheck = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoPlay = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

export function CharacterSelectScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const setStoreGender = usePlayerStore((s) => s.setCharacterGender);
  const { user, updateCharacterGender, isLoading } = useAuth();
  const [selected, setSelected] = useState<'male' | 'female'>('male');
  const [saving, setSaving] = useState(false);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    setStoreGender(selected);
    await updateCharacterGender(selected);
    setScreen('game');
    setSaving(false);
  }, [selected, setStoreGender, updateCharacterGender, setScreen]);

  return (
    <div className="fixed inset-0 z-50">
      <CityBackground />
      <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.78)', backdropFilter: 'blur(6px)' }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-lg">

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-wider mb-1"
              style={{ background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 50%, #164e63 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
              ELIGE TU ARTISTA
            </h1>
            {user && <p className="text-xs text-cyan-300/50 tracking-wider">Bienvenido, <span className="text-cyan-300/80 font-semibold">{user.username}</span></p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {(['male', 'female'] as const).map((g) => {
              const active = selected === g;
              const c = g === 'male' ? '#22d3ee' : '#f472b6';
              return (
                <motion.button key={g} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelected(g)}
                  className="relative py-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-3"
                  style={{
                    borderColor: active ? `${c}70` : 'rgba(255,255,255,0.05)',
                    background: active ? `linear-gradient(180deg, ${c}12, ${c}06)` : 'rgba(255,255,255,0.02)',
                    boxShadow: active ? `0 0 30px ${c}15, inset 0 1px 0 ${c}10` : 'none',
                  }}>
                  <span style={{ color: active ? c : '#4b5563' }}>{g === 'male' ? <IcoMale /> : <IcoFemale />}</span>
                  <span className="text-sm font-black tracking-[0.15em]" style={{ color: active ? c : '#6b7280' }}>
                    {g === 'male' ? 'MASCULINO' : 'FEMENINO'}
                  </span>
                  {active && (
                    <motion.div layoutId="char-check" className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: c }}>
                      <IcoCheck />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <button onClick={handleConfirm} disabled={saving || isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider text-white transition-all disabled:opacity-40 relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #0ea5c7, #0891b2, #0e7490)', boxShadow: '0 4px 20px rgba(14,165,199,0.3)' }}>
            <span className="absolute inset-0 bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {saving ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Guardando...</> : <><IcoPlay /> COMENZAR AVENTURA</>}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default CharacterSelectScreen;
