/**
 * 🎮 LEGENDS: Auth Screen — Professional UI with SVG icons
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import { useAuth } from '../../hooks/useInsForge';
import { CityBackground } from './CityBackground';

/* ─── SVG Icons ─── */
const IcoMic = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IcoMail = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoUser = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoMale = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.4 5.4M19 5h-5M19 5v5"/></svg>;
const IcoFemale = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>;
const IcoBack = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoCheck = () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

type AuthMode = 'login' | 'register';
type AuthStep = 'form' | 'verify';

export function AuthScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const setStoreGender = usePlayerStore((s) => s.setCharacterGender);
  const { register, login, loginWithGoogle, verifyEmail, isLoading, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>('register');
  const [step, setStep] = useState<AuthStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [characterGender, setCharacterGender] = useState<'male' | 'female'>('male');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (mode === 'register') {
      if (!username.trim() || username.trim().length < 3) { setError('El nombre debe tener al menos 3 caracteres'); return; }
      if (!email.trim()) { setError('Ingresa tu email'); return; }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
      const result = await register({ email: email.trim(), password, username: username.trim(), characterGender });
      if (result.success) { setStoreGender(characterGender); setSuccess('¡Cuenta creada! Entrando al juego...'); setTimeout(() => setScreen('game'), 500); }
      else if ((result as any).requiresVerification) {
        // Si el userId está vacío, es un 409 (usuario ya existe) — intentar login automático
        if (!(result as any).userId) {
          const loginResult = await login({ email: email.trim(), password });
          if (loginResult.success) {
            if (user?.characterGender) setStoreGender(user.characterGender as 'male' | 'female');
            setSuccess('Sesión iniciada');
            setTimeout(() => setScreen('game'), 1000);
          } else {
            // Login falló — necesita verificación de email
            const loginErr = (loginResult.error || '').toLowerCase();
            if (loginErr.includes('verification') || loginErr.includes('verify') || loginErr.includes('403')) {
              try { await (await import('../../services/insforge')).insforge.auth.resendVerificationEmail({ email: email.trim() }); } catch { /* ignore */ }
              setPendingUserId('');
              setStep('verify');
              setError('');
              setSuccess('Debes verificar tu email primero. Te enviamos un código.');
            } else {
              setMode('login');
              setError('Ya tienes cuenta. Verifica tu email o inicia sesión con otra contraseña.');
            }
          }
        } else {
          // Registro nuevo que requiere verificación
          setPendingUserId((result as any).userId);
          setStep('verify');
          setError('');
          setSuccess('Código de verificación enviado a tu email');
        }
      }
      else setError(result.error || 'Error al registrar');
    } else {
      if (!email.trim()) { setError('Ingresa tu email'); return; }
      if (!password) { setError('Ingresa tu contraseña'); return; }
      const result = await login({ email: email.trim(), password });
      if (result.success) { if (user?.characterGender) setStoreGender(user.characterGender as 'male' | 'female'); setSuccess('Bienvenido de vuelta'); setTimeout(() => setScreen('game'), 1000); }
      else {
        const errMsg = (result.error || '').toLowerCase();
        // Si el error es por verificación de email, mostrar paso de verificación
        if (errMsg.includes('verification') || errMsg.includes('verify') || errMsg.includes('not verified')) {
          // Reenviar código de verificación
          try { await (await import('../../services/insforge')).insforge.auth.resendVerificationEmail({ email: email.trim() }); } catch { /* ignore */ }
          setPendingUserId('');
          setStep('verify');
          setError('');
          setSuccess('Debes verificar tu email. Te reenviamos el código.');
        } else {
          setError(result.error || 'Error al iniciar sesión');
        }
      }
    }
  }, [mode, email, password, username, characterGender, register, login, setScreen, setStoreGender, user]);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (verificationCode.length !== 6) { setError('El código debe tener 6 dígitos'); return; }
    const result = await verifyEmail({ email: email.trim(), otp: verificationCode, username: username.trim() || email.trim().split('@')[0], characterGender, userId: pendingUserId });
    if (result.success) { setStoreGender(characterGender); setSuccess('¡Email verificado! Entrando...'); setTimeout(() => setScreen('game'), 500); }
    else setError(result.error || 'Código inválido');
  }, [verificationCode, email, username, characterGender, pendingUserId, verifyEmail, setScreen, setStoreGender]);

  const handleBack = useCallback(() => { if (step === 'verify') { setStep('form'); setError(''); setSuccess(''); } else setScreen('main_menu'); }, [step, setScreen]);

  return (
    <div className="fixed inset-0 z-50">
      <CityBackground />
      <div className="absolute inset-0" style={{ background: 'rgba(5,3,12,0.78)', backdropFilter: 'blur(6px)' }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 overflow-y-auto py-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-black tracking-wider mb-1"
              style={{ background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 50%, #164e63 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Arial Black', 'Impact', sans-serif" }}>
              {step === 'verify' ? 'VERIFICAR EMAIL' : mode === 'register' ? 'CREAR ARTISTA' : 'INICIAR SESIÓN'}
            </h1>
            <p className="text-xs text-cyan-300/50 tracking-wider">
              {step === 'verify' ? 'Ingresa el código enviado a tu email' : mode === 'register' ? 'Crea tu perfil para comenzar' : 'Recupera tu progreso'}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.06] p-5 md:p-6"
            style={{ background: 'linear-gradient(145deg, rgba(20,10,45,0.75), rgba(10,6,22,0.85))', backdropFilter: 'blur(24px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)' }}>

            <AnimatePresence mode="wait">
              {step === 'verify' ? (
                <motion.form key="verify" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={handleVerify} className="space-y-4">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 text-cyan-400" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.15)' }}><IcoMail /></div>
                    <p className="text-sm text-gray-400">Código enviado a <span className="text-cyan-400 font-semibold">{email}</span></p>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 block">Código de verificación</label>
                    <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} autoComplete="one-time-code"
                      className="w-full px-4 py-3.5 bg-white/[0.04] text-white text-center text-xl font-mono tracking-[0.5em] rounded-xl border border-white/[0.06] focus:border-cyan-400/40 focus:outline-none transition-all" />
                  </div>
                  {error && <p className="text-xs text-red-400 text-center bg-red-500/[0.06] border border-red-500/10 rounded-lg py-2">{error}</p>}
                  {success && <p className="text-xs text-emerald-400 text-center bg-emerald-500/[0.06] border border-emerald-500/10 rounded-lg py-2">{success}</p>}
                  <button type="submit" disabled={isLoading || verificationCode.length !== 6}
                    className="w-full py-3 rounded-xl font-bold text-sm tracking-wider text-white transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                    {isLoading ? 'Verificando...' : 'VERIFICAR'}
                  </button>
                </motion.form>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  {/* Tabs */}
                  <div className="flex mb-4 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
                    {(['register', 'login'] as const).map((m) => (
                      <button key={m} type="button" onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${mode === m ? 'bg-cyan-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                        {m === 'register' ? 'REGISTRARSE' : 'INGRESAR'}
                      </button>
                    ))}
                  </div>

                  {/* Google */}
                  <button type="button" onClick={async () => { setError(''); const r = await loginWithGoogle(); if (!r.success) setError(r.error || 'Error'); }}
                    className="w-full py-2.5 rounded-xl font-semibold text-xs tracking-wider text-white/80 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2.5 mb-3">
                    <GoogleLogo /> CONTINUAR CON GOOGLE
                  </button>
                  <div className="flex items-center gap-3 mb-3"><div className="flex-1 h-px bg-white/[0.06]" /><span className="text-[10px] text-gray-600 font-bold">O</span><div className="flex-1 h-px bg-white/[0.06]" /></div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Character (register only) */}
                    <AnimatePresence mode="wait">
                      {mode === 'register' && (
                        <motion.div key="char" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                          <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-2 block">Personaje</label>
                          <div className="grid grid-cols-2 gap-2.5 mb-1">
                            {(['male', 'female'] as const).map((g) => {
                              const active = characterGender === g;
                              const c = g === 'male' ? '#22d3ee' : '#f472b6';
                              return (
                                <button key={g} type="button" onClick={() => setCharacterGender(g)}
                                  className="relative py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2"
                                  style={{ borderColor: active ? `${c}60` : 'rgba(255,255,255,0.05)', background: active ? `${c}0a` : 'transparent' }}>
                                  <span style={{ color: active ? c : '#6b7280' }}>{g === 'male' ? <IcoMale /> : <IcoFemale />}</span>
                                  <span className="text-[11px] font-bold tracking-wider" style={{ color: active ? c : '#6b7280' }}>{g === 'male' ? 'MASCULINO' : 'FEMENINO'}</span>
                                  {active && <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: c }}><IcoCheck /></span>}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Username (register only) */}
                    <AnimatePresence mode="wait">
                      {mode === 'register' && (
                        <motion.div key="uname" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                          <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 flex items-center gap-1.5 block"><IcoUser /> Nombre de artista</label>
                          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu nombre artístico..." maxLength={50} autoComplete="username"
                            className="w-full px-3.5 py-2.5 bg-white/[0.04] text-white rounded-xl border border-white/[0.06] focus:border-cyan-400/40 focus:outline-none text-sm placeholder-gray-600 transition-all" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 flex items-center gap-1.5 block"><IcoMail /> Email</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email"
                        className="w-full px-3.5 py-2.5 bg-white/[0.04] text-white rounded-xl border border-white/[0.06] focus:border-cyan-400/40 focus:outline-none text-sm placeholder-gray-600 transition-all" />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-1.5 flex items-center gap-1.5 block"><IcoLock /> Contraseña</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        className="w-full px-3.5 py-2.5 bg-white/[0.04] text-white rounded-xl border border-white/[0.06] focus:border-cyan-400/40 focus:outline-none text-sm placeholder-gray-600 transition-all" />
                    </div>

                    {error && <p className="text-xs text-red-400 text-center bg-red-500/[0.06] border border-red-500/10 rounded-lg py-2">{error}</p>}
                    {success && <p className="text-xs text-emerald-400 text-center bg-emerald-500/[0.06] border border-emerald-500/10 rounded-lg py-2">{success}</p>}

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 rounded-xl font-bold text-sm tracking-wider text-white transition-all disabled:opacity-40 relative overflow-hidden group"
                      style={{ background: 'linear-gradient(135deg, #0ea5c7, #0891b2, #0e7490)', boxShadow: '0 4px 16px rgba(14,165,199,0.25)' }}>
                      <span className="absolute inset-0 bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center justify-center gap-2">
                        <IcoMic /> {isLoading ? 'Procesando...' : mode === 'register' ? 'CREAR Y JUGAR' : 'ENTRAR'}
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back */}
          <button onClick={handleBack}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold tracking-wider text-gray-500 hover:text-gray-300 bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-all flex items-center justify-center gap-2">
            <IcoBack /> {step === 'verify' ? 'VOLVER' : 'VOLVER AL MENÚ'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthScreen;
