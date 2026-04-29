/**
 * 🎮 LEGENDS: DialogBox Component
 * Caja de diálogo mejorada con información contextual
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogOption {
  id: string;
  text: string;
  disabled?: boolean;
  consequence?: string;
}

interface DialogBoxProps {
  isOpen: boolean;
  character: string;
  text: string;
  portrait?: string;
  options?: DialogOption[];
  onNext?: () => void;
  onSelectOption?: (optionId: string) => void;
  showContinueIndicator?: boolean;
}

export function DialogBox({
  isOpen,
  character,
  text,
  portrait,
  options,
  onNext,
  onSelectOption,
  showContinueIndicator = true,
}: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Efecto typewriter mejorado
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTyping(true);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingSpeed = 25; // ms por carácter

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, isOpen]);

  // Saltar animación de typing al hacer click
  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onNext && !options) {
      onNext();
    }
  };

  // Obtener información del personaje
  const getCharacterInfo = (characterName: string) => {
    const characters: Record<string, { role: string; color: string; emoji: string }> = {
      'DJ Sonic': { role: 'Mentor Musical', color: '#a855f7', emoji: '🎧' },
      'El de la Renta': { role: 'Cobrador', color: '#ef4444', emoji: '💰' },
      'Luna': { role: 'Fan #1', color: '#06b6d4', emoji: '🌙' },
      'El Critico': { role: 'Crítico Musical', color: '#f59e0b', emoji: '📝' },
      'Mama': { role: 'Familia', color: '#22c55e', emoji: '❤️' },
      'Marco': { role: 'Jefe del Café', color: '#f59e0b', emoji: '☕' },
      'Daniela': { role: 'Jefa de Tienda', color: '#22c55e', emoji: '🛍️' },
      'Vendedor': { role: 'Purple Sound Shop', color: '#a855f7', emoji: '🎵' },
      'Chef Carlos': { role: 'Chef del Restaurante', color: '#ef4444', emoji: '🍽️' },
      'Supervisor Luis': { role: 'Supervisor de Delivery', color: '#06b6d4', emoji: '🚚' },
      'Manager Rosa': { role: 'Manager del Bar', color: '#ec4899', emoji: '🎧' },
      'Director Miguel': { role: 'Director de Academia', color: '#8b5cf6', emoji: '🎓' },
    };
    return characters[characterName] || { role: 'Personaje', color: '#6b7280', emoji: '💬' };
  };

  const characterInfo = getCharacterInfo(character);

  // Manejar teclas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkipTyping();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isTyping, onNext, options]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkipTyping}
          className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4 cursor-pointer"
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl backdrop-blur-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-2 border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden cursor-default"
          >
            {/* Header del diálogo */}
            <div 
              className="px-6 py-3 border-b border-purple-500/30"
              style={{ backgroundColor: `${characterInfo.color}20` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-2"
                    style={{ 
                      backgroundColor: `${characterInfo.color}30`,
                      borderColor: `${characterInfo.color}50`
                    }}
                  >
                    <span className="text-lg">{characterInfo.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{character}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      {characterInfo.role}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de estado */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">HABLANDO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Retrato del personaje mejorado */}
                <div className="flex-shrink-0">
                  {portrait ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-3 shadow-lg"
                         style={{ borderColor: characterInfo.color }}>
                      <img src={portrait} alt={character} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-xl flex items-center justify-center text-4xl border-3 shadow-lg"
                      style={{ 
                        backgroundColor: `${characterInfo.color}20`,
                        borderColor: characterInfo.color
                      }}
                    >
                      {characterInfo.emoji}
                    </div>
                  )}
                  
                  {/* Indicador de audio */}
                  <div className="mt-2 flex justify-center">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-purple-400 rounded-full"
                          animate={{
                            height: isTyping ? [4, 12, 4] : 4,
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: isTyping ? Infinity : 0,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenido del diálogo */}
                <div className="flex-1 min-w-0">
                  {/* Burbuja de diálogo */}
                  <div className="bg-gray-800/80 rounded-2xl p-6 border border-gray-600/50 shadow-lg relative">
                    {/* Flecha de la burbuja */}
                    <div 
                      className="absolute left-0 top-6 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent"
                      style={{ borderRightColor: '#374151cc' }}
                      transform="translateX(-8px)"
                    />
                    
                    {/* Texto con efecto typewriter */}
                    <div className="min-h-[80px]">
                      <p className="text-lg text-gray-100 leading-relaxed">
                        {displayedText}
                        {isTyping && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-3 h-6 bg-purple-400 ml-1 rounded-sm"
                          />
                        )}
                      </p>
                    </div>

                    {/* Información contextual */}
                    {!isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-600/50"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Diálogo con {character}</span>
                          <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Opciones de respuesta mejoradas */}
                  {!isTyping && options && options.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-6 space-y-3"
                    >
                      <div className="text-sm text-purple-400 font-medium mb-3 flex items-center gap-2">
                        <span>💭</span>
                        <span>Elige tu respuesta:</span>
                      </div>
                      
                      {options.map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          onMouseEnter={() => setHoveredOption(option.id)}
                          onMouseLeave={() => setHoveredOption(null)}
                        >
                          <button
                            onClick={() => onSelectOption?.(option.id)}
                            disabled={option.disabled}
                            className={`
                              w-full p-4 rounded-xl border-2 transition-all text-left
                              ${option.disabled 
                                ? 'bg-gray-700/50 border-gray-600/50 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-700/80 border-purple-500/30 text-gray-100 hover:bg-purple-500/20 hover:border-purple-400/50 cursor-pointer'
                              }
                              ${hoveredOption === option.id ? 'scale-102 shadow-lg' : ''}
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-purple-400 text-lg mt-1">▸</span>
                              <div className="flex-1">
                                <div className="font-medium">{option.text}</div>
                                {option.consequence && hoveredOption === option.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2 text-sm text-gray-400 italic"
                                  >
                                    Consecuencia: {option.consequence}
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Indicador de continuar mejorado */}
                  {!isTyping && showContinueIndicator && !options && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-purple-500/20 border border-purple-500/50 rounded-xl px-6 py-3 flex items-center gap-3"
                      >
                        <span className="text-purple-400 text-lg">▼</span>
                        <div className="text-sm text-purple-300">
                          <div className="font-medium">Continuar conversación</div>
                          <div className="text-xs text-purple-400">Click o presiona Espacio</div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con controles */}
            <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-600/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span>💬 Sistema de Diálogos</span>
                  <span>•</span>
                  <span>LEGENDS: Purple City</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Espacio: Continuar</span>
                  <span>•</span>
                  <span>Click: Saltar texto</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DialogBox;