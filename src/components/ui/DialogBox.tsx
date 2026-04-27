/**
 * 🎮 LEGENDS: DialogBox Component
 * Caja de diálogo fullscreen con opciones (shell para Yeraldin)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DialogBoxProps } from '@/types/ui';
import { Button } from '@/components/atoms';

const DialogBox = ({
  isOpen,
  character,
  text,
  portrait,
  options,
  onNext,
  onSelectOption,
  showContinueIndicator = true,
}: DialogBoxProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Efecto typewriter
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      setIsTyping(true);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    const typingSpeed = 30; // ms por carácter

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkipTyping}
          className="fixed inset-0 z-70 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4 cursor-pointer"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl backdrop-blur-md bg-gray-900/95 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden cursor-default"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Retrato del personaje */}
                {portrait ? (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-500/50">
                    <img src={portrait} alt={character} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-3xl">
                    💬
                  </div>
                )}

                {/* Contenido del diálogo */}
                <div className="flex-1 min-w-0">
                  {/* Nombre del personaje */}
                  <h3 className="text-lg font-bold text-purple-400 mb-3">{character}</h3>

                  {/* Texto con efecto typewriter */}
                  <div className="min-h-[60px]">
                    <p className="text-base text-gray-100 leading-relaxed">
                      {displayedText}
                      {isTyping && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-2 h-5 bg-purple-400 ml-1"
                        />
                      )}
                    </p>
                  </div>

                  {/* Opciones de respuesta */}
                  {!isTyping && options && options.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 space-y-2"
                    >
                      {options.map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <Button
                            variant="secondary"
                            size="md"
                            onClick={() => onSelectOption?.(option.id)}
                            disabled={option.disabled}
                            className="w-full justify-start text-left"
                          >
                            <span className="text-purple-400 mr-2">▸</span>
                            {option.text}
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Indicador de continuar */}
                  {!isTyping && showContinueIndicator && !options && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mt-4 text-sm text-purple-400 flex items-center gap-2"
                    >
                      <span>▼</span>
                      <span>Click o presiona Espacio para continuar</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogBox;
