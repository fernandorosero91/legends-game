/**
 * LEGENDS: MapTutorial — Tutorial interactivo de bienvenida
 * Modal centrado con fondo semi-transparente, no fullscreen.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MapTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  content: string;
  icon: string;
  tip: string;
  accentColor: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Bienvenido a Purple City',
    subtitle: 'Tu aventura comienza aquí',
    content: 'Eres un rapero emergente con un sueño: vivir de la música. Tienes 45 días para convertirte en leyenda y alcanzar 10,000 oyentes.',
    icon: '🏙️',
    tip: '"Si algo vale la pena, vale la pena la lucha."',
    accentColor: '#a78bfa',
  },
  {
    title: 'Tu Apartamento',
    subtitle: 'Base de operaciones',
    content: 'Aquí puedes grabar canciones en el estudio, dormir para recuperar energía, y trabajar online desde el computador. Es tu hogar.',
    icon: '🏠',
    tip: '💡 Usa WASD para moverte e interactúa con los objetos brillantes.',
    accentColor: '#60a5fa',
  },
  {
    title: 'Graba Canciones',
    subtitle: 'El corazón del juego',
    content: 'Acércate al escritorio del estudio y graba beats. Un minijuego rítmico determinará la calidad de tu canción. Mejor precisión = más oyentes.',
    icon: '🎤',
    tip: '🎵 Compra equipamiento en la tienda para mejorar la calidad.',
    accentColor: '#22d3ee',
  },
  {
    title: 'Trabaja para Sobrevivir',
    subtitle: 'La renta no se paga sola',
    content: 'Usa el computador para trabajos online o viaja al Almacén/Restaurante para trabajos físicos. Gana dinero para pagar la renta y comprar equipo.',
    icon: '💼',
    tip: '⚠️ La renta es $1,000 diarios. 3 días sin pagar = Game Over.',
    accentColor: '#fbbf24',
  },
  {
    title: 'Cuida tus Recursos',
    subtitle: 'Energía, hambre y dinero',
    content: 'Cada acción consume energía y hambre. Duerme para recuperar energía. Compra comida en la tienda. Si tu hambre llega a 0, la energía se gasta el doble.',
    icon: '⚡',
    tip: '🍽️ Abre la tienda → pestaña "Comida" para comer.',
    accentColor: '#34d399',
  },
  {
    title: '¡A por los 10,000!',
    subtitle: 'Tu meta es ser leyenda',
    content: 'Graba canciones, sube de nivel, desbloquea nuevo equipamiento y escenas. Equilibra trabajo y arte. ¡Buena suerte!',
    icon: '🚀',
    tip: '🗺️ Presiona M o el botón del mapa para viajar entre ubicaciones.',
    accentColor: '#f472b6',
  },
];

export function MapTutorial({ isOpen, onClose }: MapTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = STEPS[currentStep];

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, currentStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop oscuro semi-transparente */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950 via-[#1a0a2e] to-indigo-950 shadow-2xl overflow-hidden"
          >
            {/* Decorative orb */}
            <div
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${step.accentColor}60, transparent 70%)` }}
            />

            {/* Header: step counter + skip */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              {/* Step dots */}
              <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === currentStep ? 28 : 10,
                      height: 10,
                      backgroundColor: i === currentStep ? step.accentColor : 'rgba(255,255,255,0.15)',
                    }}
                    layout
                  />
                ))}
              </div>

              {/* Skip button — grande y visible */}
              <button
                onClick={onClose}
                className="text-base font-semibold text-purple-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Saltar tutorial →
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 60 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-center"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="mx-auto mb-5 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${step.accentColor}30, ${step.accentColor}10)`, border: `2px solid ${step.accentColor}50` }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                    {step.title}
                  </h2>

                  {/* Subtitle */}
                  <p
                    className="text-base font-semibold uppercase tracking-wide mb-4"
                    style={{ color: step.accentColor }}
                  >
                    {step.subtitle}
                  </p>

                  {/* Content */}
                  <p className="text-lg text-white/85 leading-relaxed mb-5">
                    {step.content}
                  </p>

                  {/* Tip box */}
                  <div
                    className="mx-auto max-w-md rounded-xl px-5 py-3 text-base text-white/80 leading-relaxed"
                    style={{ background: `${step.accentColor}15`, border: `1px solid ${step.accentColor}30` }}
                  >
                    {step.tip}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between px-6 pb-5 pt-2 border-t border-white/5">
              <button
                onClick={prev}
                disabled={currentStep === 0}
                className={`px-5 py-3 rounded-xl font-semibold text-base transition-all ${
                  currentStep === 0
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                ← Anterior
              </button>

              {/* Step indicator text */}
              <span className="text-sm text-white/40 font-medium">
                {currentStep + 1} / {STEPS.length}
              </span>

              <button
                onClick={next}
                className="px-7 py-3 rounded-xl font-bold text-base text-white transition-all shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${step.accentColor}, ${step.accentColor}cc)`,
                  boxShadow: `0 4px 20px ${step.accentColor}40`,
                }}
              >
                {currentStep === STEPS.length - 1 ? '¡Comenzar! 🎮' : 'Siguiente →'}
              </button>
            </div>

            {/* Keyboard hint — más visible */}
            <p className="text-center text-sm text-white/35 pb-4">
              ← → navegar • Enter avanzar • Esc saltar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
