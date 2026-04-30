/**
 * 🎮 LEGENDS: Settings Screen
 * Pantalla de configuración del juego
 * Autor: Kiro AI Assistant
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '../../store/audioStore';
import { useUIStore } from '../../store/uiStore';
import { Icon } from '../atoms';

export function SettingsScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    isMuted,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
  } = useAudioStore();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleBack = () => {
    setScreen('main_menu');
  };

  const handleResetSettings = () => {
    setMasterVolume(100);
    setMusicVolume(80);
    setSfxVolume(70);
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-lg transition-colors"
          >
            <Icon name="arrow-left" size="sm" />
            <span className="text-white font-semibold">Volver</span>
          </button>
          <h1 className="text-3xl font-black text-white tracking-wider">
            ⚙️ CONFIGURACIÓN
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="h-full flex items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl space-y-6"
        >
          {/* Audio Settings Card */}
          <div className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">🔊 Audio</h2>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMuted ? '🔇 Silenciado' : '🔊 Activo'}
              </button>
            </div>

            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold">Volumen General</label>
                <span className="text-cyan-400 font-mono">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold">Música</label>
                <span className="text-cyan-400 font-mono">{musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* SFX Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold">Efectos de Sonido</label>
                <span className="text-cyan-400 font-mono">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Game Settings Card */}
          <div className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">🎮 Juego</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-800/30 rounded-lg">
                <span className="text-white font-semibold">Dificultad</span>
                <span className="text-cyan-400">Normal</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-800/30 rounded-lg">
                <span className="text-white font-semibold">Auto-guardado</span>
                <span className="text-green-400">✓ Activado</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-800/30 rounded-lg">
                <span className="text-white font-semibold">Tutoriales</span>
                <span className="text-green-400">✓ Activado</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 px-6 py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              🔄 Restablecer Configuración
            </button>
          </div>

          {/* Info */}
          <div className="text-center text-purple-300 text-sm">
            <p>Los cambios se guardan automáticamente</p>
          </div>
        </motion.div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-900 border-2 border-purple-500 rounded-2xl p-6 max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              ⚠️ Confirmar Restablecimiento
            </h3>
            <p className="text-purple-200 mb-6">
              ¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetSettings}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Restablecer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default SettingsScreen;
