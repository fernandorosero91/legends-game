import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface MapTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MapTutorial({ isOpen, onClose }: MapTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '🗺️ Bienvenido a Purple City',
      content: 'Usa el mapa para navegar por la ciudad y descubrir nuevos lugares.',
      highlight: 'mini-map'
    },
    {
      title: '🏠 Tu Apartamento',
      content: 'Aquí puedes descansar, grabar música y trabajar online. Es tu base de operaciones.',
      highlight: 'apartment'
    },
    {
      title: '💼 Lugares de Trabajo',
      content: 'Visita diferentes establecimientos para trabajar y ganar dinero. Cada trabajo tiene diferentes pagos y costos de energía.',
      highlight: 'jobs'
    },
    {
      title: '🎵 Purple Sound Shop',
      content: 'Compra equipamiento musical para mejorar la calidad de tus canciones.',
      highlight: 'shop'
    },
    {
      title: '⚡ Gestión de Energía',
      content: 'Viajar consume energía. Planifica tus movimientos sabiamente.',
      highlight: 'energy'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-500 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-purple-300 mb-2">
                <span>Tutorial</span>
                <span>{currentStep + 1} / {steps.length}</span>
              </div>
              <div className="w-full bg-purple-900/50 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {steps[currentStep].content}
              </p>
            </div>

            {/* Visual indicator */}
            <div className="flex justify-center mb-8">
              <motion.div
                key={currentStep}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg"
              >
                {getStepIcon(steps[currentStep].highlight)}
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${currentStep === 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-700 text-white hover:bg-purple-600'
                  }
                `}
              >
                Anterior
              </button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-2 h-2 rounded-full transition-all
                      ${index === currentStep ? 'bg-white' : 'bg-white/30'}
                    `}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-medium hover:from-purple-500 hover:to-purple-400 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
              </button>
            </div>

            {/* Skip button */}
            <div className="text-center mt-4">
              <button
                onClick={onClose}
                className="text-sm text-purple-300 hover:text-white transition-colors"
              >
                Saltar tutorial
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getStepIcon(highlight: string): string {
  const icons: Record<string, string> = {
    'mini-map': '🗺️',
    'apartment': '🏠',
    'jobs': '💼',
    'shop': '🎵',
    'energy': '⚡'
  };
  return icons[highlight] || '📍';
}