/**
 * 🎮 LEGENDS: Settings Screen — Premium UI with SVG icons & CityBackground
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '../../store/audioStore';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useAuth, useInsForge } from '../../hooks/useInsForge';
import { insforge } from '../../services/insforge';
import { CityBackground } from './CityBackground';

/* ─── SVG Icons ─── */
const IcoBack = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>;
const IcoSave = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoUser = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoVolume = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>;
const IcoMute = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const IcoGamepad = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>;
const IcoEdit = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoLogout = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoRefresh = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>;
const IcoCheck = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoMale = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.4 5.4M19 5h-5M19 5v5"/></svg>;
const IcoFemale = () => <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>;
const IcoMusic = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
const IcoWave = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M2 12h2l3-7 4 14 4-10 3 6h4"/></svg>;

/* ─── Slider ─── */
function Slider({ value, onChange, accent = '#22d3ee' }: { value: number; onChange: (v: number) => void; accent?: string }) {
  return (
    <div className="relative h-2.5 rounded-full bg-white/[0.06] group cursor-pointer">
      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-150" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${accent}66, ${accent})` }} />
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer" />
      <div className="absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 transition-all pointer-events-none"
        style={{ left: `calc(${value}% - 9px)`, borderColor: accent, background: '#0d0818', boxShadow: `0 0 10px ${accent}50, 0 0 3px ${accent}30` }} />
    </div>
  );
}

/* ─── Card ─── */
function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      className="rounded-2xl border border-white/[0.06] p-5 md:p-6"
      style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.75) 0%, rgba(10,6,22,0.85) 100%)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
      {children}
    </motion.div>
  );
}

/* ─── Section Header ─── */
function SectionHead({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))', border: '1px solid rgba(124,58,237,0.2)' }}>
          {icon}
        </div>
        <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export function SettingsScreen({ onClose }: { onClose?: () => void } = {}) {
  const setScreen = useUIStore((s) => s.setScreen);
  const { masterVolume, musicVolume, sfxVolume, isMuted, setMasterVolume, setMusicVolume, setSfxVolume, toggleMute } = useAudioStore();
  const { user, updateCharacterGender, logout } = useAuth();
  const { saveGame } = useInsForge();
  const setStoreGender = usePlayerStore((s) => s.setCharacterGender);
  const characterGender = usePlayerStore((s) => s.characterGender);
  const { currentDay, currentLevel } = useGameStore();

  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [genderMsg, setGenderMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState<'reset' | 'logout' | null>(null);

  const goBack = useUIStore((s) => s.goBack);
  const previousScreen = useUIStore((s) => s.previousScreen);
  const handleBack = () => { if (onClose) onClose(); else if (previousScreen) goBack(); else setScreen('main_menu'); };

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim() || newUsername.trim().length < 3) { setProfileMsg('Mínimo 3 caracteres'); return; }
    setSavingProfile(true); setProfileMsg('');
    try {
      const { error } = await insforge.database.from('users').update({ username: newUsername.trim(), updated_at: new Date().toISOString() }).eq('id', user.id);
      setProfileMsg(error ? `Error: ${error.message}` : ''); if (!error) setEditingName(false);
    } catch { setProfileMsg('Error al guardar'); }
    setSavingProfile(false);
  };

  const handleChangeGender = async (g: 'male' | 'female') => {
    setStoreGender(g);
    setGenderMsg('');
    if (user) {
      const r = await updateCharacterGender(g);
      setGenderMsg(r.success ? 'ok' : r.error || 'Error');
      if (r.success) setTimeout(() => setGenderMsg(''), 2500);
    }
  };

  const handleSaveGame = useCallback(async () => {
    setIsSaving(true); setSaveMsg('');
    const r = await saveGame('manual');
    setSaveMsg(r.success ? 'ok' : r.error || 'Error');
    setIsSaving(false);
    if (r.success) setTimeout(() => setSaveMsg(''), 3000);
  }, [saveGame]);

  const handleLogout = async () => { await logout(); setScreen('main_menu'); };
  const handleReset = () => { setMasterVolume(100); setMusicVolume(80); setSfxVolume(70); setShowConfirm(null); };

  return (
    <div className="fixed inset-0 z-50">
      {/* Background */}
      <CityBackground />
      <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.82)', backdropFilter: 'blur(6px)' }} />

      {/* Scrollable content */}
      <div className="relative z-10 h-full overflow-y-auto">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 border-b border-white/[0.04]"
          style={{ background: 'rgba(8,4,18,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3.5">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-sm font-semibold text-purple-300 hover:text-white transition-colors"><IcoBack /> Volver</button>
            <h1 className="text-sm md:text-base font-black tracking-[0.2em] uppercase text-white/90">Configuración</h1>
            <div className="w-20" />
          </div>
        </motion.header>

        <div className="max-w-2xl mx-auto px-5 py-6 space-y-4 pb-20">

          {/* ═══ SAVE ═══ */}
          <Card delay={0}>
            <SectionHead icon={<IcoSave />} title="Guardar Partida" right={
              <span className="text-[11px] font-mono text-gray-500">Día {currentDay} · Nivel {currentLevel}</span>
            } />
            <button onClick={handleSaveGame} disabled={isSaving || !user}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wider text-white transition-all disabled:opacity-30 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9, #5b21b6)', boxShadow: isSaving ? 'none' : '0 4px 20px rgba(124,58,237,0.3)' }}>
              <span className="absolute inset-0 bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                {isSaving ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Guardando...</> : <><IcoSave /> GUARDAR PARTIDA</>}
              </span>
            </button>
            <AnimatePresence>
              {saveMsg && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`text-xs text-center mt-2.5 font-medium ${saveMsg === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {saveMsg === 'ok' ? 'Partida guardada exitosamente' : saveMsg}
                </motion.p>
              )}
            </AnimatePresence>
            {!user && <p className="text-[11px] text-amber-400/60 text-center mt-2">Inicia sesión para guardar</p>}
          </Card>

          {/* ═══ PROFILE ═══ */}
          {user && (
            <Card delay={0.05}>
              <SectionHead icon={<IcoUser />} title="Perfil de Artista" />

              {/* Username */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 block">Nombre</label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} maxLength={50} autoFocus
                      className="flex-1 px-3.5 py-2.5 bg-white/[0.04] text-white rounded-lg border border-purple-500/20 focus:border-cyan-400/50 focus:outline-none text-sm" />
                    <button onClick={handleSaveUsername} disabled={savingProfile}
                      className="px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-xs disabled:opacity-50">
                      {savingProfile ? '...' : 'Guardar'}
                    </button>
                    <button onClick={() => { setEditingName(false); setNewUsername(user.username); setProfileMsg(''); }}
                      className="px-3 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 rounded-lg transition-colors text-xs">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                    <span className="text-cyan-300 font-semibold text-sm">{user.username}</span>
                    <button onClick={() => setEditingName(true)} className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                      <IcoEdit /> Editar
                    </button>
                  </div>
                )}
                {profileMsg && <p className="text-[11px] mt-1.5 text-red-400">{profileMsg}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 block">Email</label>
                <div className="px-3.5 py-2.5 bg-white/[0.03] rounded-lg border border-white/[0.04] text-sm text-gray-500">{user.email}</div>
              </div>

              {/* Character */}
              <div className="mb-5">
                <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-2 block">Personaje</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map((g) => {
                    const active = characterGender === g;
                    const c = g === 'male' ? '#22d3ee' : '#f472b6';
                    return (
                      <button key={g} onClick={() => handleChangeGender(g)}
                        className="relative py-3.5 rounded-xl border transition-all flex flex-col items-center gap-1.5"
                        style={{ borderColor: active ? `${c}80` : 'rgba(255,255,255,0.05)', background: active ? `${c}0d` : 'rgba(255,255,255,0.02)', boxShadow: active ? `0 0 16px ${c}15` : 'none' }}>
                        <span style={{ color: active ? c : '#6b7280' }}>{g === 'male' ? <IcoMale /> : <IcoFemale />}</span>
                        <span className="text-[11px] font-bold tracking-wider" style={{ color: active ? c : '#6b7280' }}>
                          {g === 'male' ? 'MASCULINO' : 'FEMENINO'}
                        </span>
                        {active && (
                          <motion.div layoutId="gcheck" className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: c }}>
                            <IcoCheck />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {genderMsg && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`text-xs text-center mt-2 font-medium ${genderMsg === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {genderMsg === 'ok' ? 'Personaje actualizado — se aplicará al recargar la escena' : genderMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={() => setShowConfirm('logout')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-300 bg-red-500/[0.05] hover:bg-red-500/[0.1] border border-red-500/10 transition-all flex items-center justify-center gap-2">
                <IcoLogout /> Cerrar Sesión
              </button>
            </Card>
          )}

          {/* ═══ AUDIO ═══ */}
          <Card delay={0.1}>
            <SectionHead icon={<IcoVolume />} title="Audio" right={
              <button onClick={toggleMute}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                  isMuted ? 'bg-red-500/15 text-red-400 border border-red-500/15' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/15'
                }`}>
                {isMuted ? <><IcoMute /> MUTE</> : <><IcoVolume /> ON</>}
              </button>
            } />
            <div className="space-y-5">
              {[
                { label: 'Volumen General', value: masterVolume, set: setMasterVolume, color: '#a78bfa', ico: <IcoVolume /> },
                { label: 'Música', value: musicVolume, set: setMusicVolume, color: '#f472b6', ico: <IcoMusic /> },
                { label: 'Efectos', value: sfxVolume, set: setSfxVolume, color: '#34d399', ico: <IcoWave /> },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center gap-2"><span style={{ color: s.color }}>{s.ico}</span>{s.label}</span>
                    <span className="text-xs font-mono font-bold tabular-nums" style={{ color: s.color }}>{s.value}%</span>
                  </div>
                  <Slider value={s.value} onChange={s.set} accent={s.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* ═══ GAME ═══ */}
          <Card delay={0.15}>
            <SectionHead icon={<IcoGamepad />} title="Juego" />
            <div className="space-y-0.5">
              {[
                { label: 'Dificultad', value: 'Normal', color: '#a78bfa' },
                { label: 'Auto-guardado', value: 'Activado', color: '#34d399' },
                { label: 'Tutoriales', value: 'Activado', color: '#34d399' },
                { label: 'Controles', value: 'WASD + Mouse', color: '#94a3b8' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <button onClick={() => setShowConfirm('reset')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-amber-400/60 hover:text-amber-300 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] border border-amber-500/10 transition-all flex items-center justify-center gap-2">
                <IcoRefresh /> Restablecer Configuración
              </button>
            </div>
          </Card>

          {/* Footer */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center text-[10px] font-mono text-gray-700 pt-2">
            LEGENDS v1.0 · Purple City, 2015
          </motion.p>
        </div>
      </div>

      {/* ═══ CONFIRM MODAL ═══ */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/[0.06] p-6"
                style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.95), rgba(10,6,22,0.98))', backdropFilter: 'blur(24px)', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
                <h3 className="text-base font-bold text-white mb-2">
                  {showConfirm === 'logout' ? 'Cerrar Sesión' : 'Restablecer'}
                </h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                  {showConfirm === 'logout'
                    ? 'Asegúrate de guardar tu partida antes de cerrar sesión.'
                    : 'Se restablecerá la configuración de audio a los valores predeterminados.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] transition-colors">Cancelar</button>
                  <button onClick={showConfirm === 'logout' ? handleLogout : handleReset}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${showConfirm === 'logout' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SettingsScreen;
