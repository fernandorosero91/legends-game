/**
 * LEGENDS: SettingsProfilePanel — Ajustes y Perfil del artista
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useAudioStore } from '../../store/audioStore';
import { useUIStore } from '../../store/uiStore';
import { useInsForge } from '../../hooks/useInsForge';

const ARTIST_NAME_KEY = 'legends-artist-name';

interface SettingsProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsProfilePanel({ isOpen, onClose }: SettingsProfilePanelProps) {
  const [tab, setTab] = useState<'settings' | 'profile'>('settings');
  const [artistName, setArtistName] = useState(() => localStorage.getItem(ARTIST_NAME_KEY) || 'MC Purple');
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const musicVolume = useAudioStore(s => s.musicVolume);
  const sfxVolume = useAudioStore(s => s.sfxVolume);
  const setMusicVolume = useAudioStore(s => s.setMusicVolume);
  const setSfxVolume = useAudioStore(s => s.setSfxVolume);

  const { user, logout } = useInsForge();

  const money = usePlayerStore(s => s.money);
  const monthlyListeners = usePlayerStore(s => s.monthlyListeners);
  const songs = usePlayerStore(s => s.songs);
  const currentDay = useGameStore(s => s.currentDay);
  const currentLevel = useGameStore(s => s.currentLevel);
  const addNotification = useUIStore(s => s.addNotification);

  // Save artist name
  useEffect(() => {
    localStorage.setItem(ARTIST_NAME_KEY, artistName);
  }, [artistName]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Save game
  const handleSave = () => {
    addNotification('success', '💾 Partida guardada');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">⚙️ Ajustes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setTab('settings')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === 'settings' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            ⚙️ Ajustes
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === 'profile' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            🎤 Perfil
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              {/* Volumen Música */}
              <div>
                <label className="text-sm text-gray-300 flex justify-between mb-2">
                  <span>🎵 Música</span>
                  <span className="text-purple-400">{Math.round(musicVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Volumen SFX */}
              <div>
                <label className="text-sm text-gray-300 flex justify-between mb-2">
                  <span>🔊 Efectos</span>
                  <span className="text-purple-400">{Math.round(sfxVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Pantalla completa */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">🖥️ Pantalla completa</span>
                <button
                  onClick={toggleFullscreen}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isFullscreen ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isFullscreen ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-700" />

              {/* Guardar / Cargar */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  💾 Guardar
                </button>
                <button
                  onClick={() => { addNotification('info', '📂 Cargando partida...'); onClose(); }}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  📂 Cargar
                </button>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-700" />

              {/* Cuenta */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Cuenta</h3>
                <div className="bg-gray-800 rounded-lg p-3">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {user.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.username}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await logout();
                          addNotification('info', '👋 Sesión cerrada');
                          onClose();
                          window.location.reload();
                        }}
                        className="w-full py-2 bg-red-900/40 hover:bg-red-800/50 text-red-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">No hay sesión activa</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              {/* Nombre del artista */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nombre artístico</label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Estadísticas */}
              <div>
                <h3 className="text-sm text-gray-400 mb-3">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{currentDay}</p>
                    <p className="text-xs text-gray-400">Días jugados</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-400">${money.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Dinero actual</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{monthlyListeners.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Oyentes</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-400">{songs?.length || 0}</p>
                    <p className="text-xs text-gray-400">Canciones</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center col-span-2">
                    <p className="text-2xl font-bold text-green-400">Nivel {currentLevel}</p>
                    <p className="text-xs text-gray-400">Nivel actual</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
