/**
 * 🧪 LEGENDS: Auth Test Screen
 * Pantalla de prueba para verificar la integración de InsForge
 * Autor: Felipe (Integration)
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useInsForge';

export function AuthTestScreen() {
  const { user, isAuthenticated, isLoading, register, login, logout } = useAuth();
  const [email, setEmail] = useState('test@legends.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('TestPlayer');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setMessage('Registrando...');
    const result = await register({ email, password, username });
    
    if (result.success) {
      setMessage('✅ Usuario registrado exitosamente!');
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
  };

  const handleLogin = async () => {
    setMessage('Iniciando sesión...');
    const result = await login({ email, password });
    
    if (result.success) {
      setMessage('✅ Sesión iniciada exitosamente!');
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
  };

  const handleLogout = async () => {
    setMessage('Cerrando sesión...');
    await logout();
    setMessage('✅ Sesión cerrada');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando InsForge...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-950 p-8">
      <div className="max-w-md mx-auto bg-purple-900 rounded-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">
          🧪 Test de InsForge
        </h1>

        {/* Estado actual */}
        <div className="bg-purple-800 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Estado Actual</h2>
          {isAuthenticated ? (
            <div className="text-green-400">
              ✅ Autenticado como: {user?.email}
              <br />
              ID: {user?.id}
            </div>
          ) : (
            <div className="text-red-400">❌ No autenticado</div>
          )}
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-purple-800 text-white rounded border border-purple-600 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-purple-800 text-white rounded border border-purple-600 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-purple-800 text-white rounded border border-purple-600 focus:border-purple-400"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          {!isAuthenticated ? (
            <>
              <button
                onClick={handleRegister}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium"
              >
                📝 Registrar Usuario
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
              >
                🔑 Iniciar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
            >
              🚪 Cerrar Sesión
            </button>
          )}
        </div>

        {/* Mensaje */}
        {message && (
          <div className="bg-purple-800 p-3 rounded">
            <div className="text-white text-sm">{message}</div>
          </div>
        )}

        {/* Información del proyecto */}
        <div className="bg-purple-800 p-4 rounded text-xs text-purple-300">
          <div>🔗 Project: legends_game</div>
          <div>🌍 Region: us-east</div>
          <div>🏠 Host: gnwhk273.us-east.insforge.app</div>
        </div>
      </div>
    </div>
  );
}