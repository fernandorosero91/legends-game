import { motion } from 'framer-motion';

interface MiniMapProps {
  currentLocation: string;
  onOpenFullMap: () => void;
}

export function MiniMap({ currentLocation, onOpenFullMap }: MiniMapProps) {
  const locations = [
    { id: 'apartment', name: 'Casa', emoji: '🏠', position: { x: 50, y: 50 } },
    { id: 'cafe', name: 'Café', emoji: '☕', position: { x: 25, y: 30 } },
    { id: 'store', name: 'Tienda', emoji: '🛍️', position: { x: 75, y: 30 } },
    { id: 'shop', name: 'Música', emoji: '🎵', position: { x: 50, y: 20 } },
    { id: 'restaurant', name: 'Rest.', emoji: '🍽️', position: { x: 20, y: 70 } },
    { id: 'delivery', name: 'Delivery', emoji: '🚚', position: { x: 80, y: 70 } },
    { id: 'bar', name: 'Bar', emoji: '🎧', position: { x: 35, y: 85 } },
    { id: 'academy', name: 'Academia', emoji: '🎓', position: { x: 65, y: 85 } }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-20 left-4 z-30"
    >
      <div className="bg-black/80 backdrop-blur-md border-2 border-purple-500 rounded-xl p-3 w-48 h-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-purple-400">MAPA</div>
          <button
            onClick={onOpenFullMap}
            className="text-xs text-white hover:text-purple-300 transition-colors"
            title="Abrir mapa completo"
          >
            🔍
          </button>
        </div>

        {/* Mini mapa */}
        <div className="relative w-full h-20 bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-lg overflow-hidden">
          {/* Grid de fondo */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="miniGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#miniGrid)" />
            </svg>
          </div>

          {/* Ubicaciones */}
          {locations.map((location) => {
            const isCurrent = currentLocation === location.id;
            
            return (
              <div
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${location.position.x}%`,
                  top: `${location.position.y}%`
                }}
              >
                <div
                  className={`
                    w-3 h-3 rounded-full flex items-center justify-center text-xs
                    transition-all duration-300
                    ${isCurrent 
                      ? 'bg-white text-purple-900 scale-125 shadow-lg shadow-white/50' 
                      : 'bg-purple-500/70 text-white hover:bg-purple-400/70'
                    }
                  `}
                  title={location.name}
                >
                  <span className="text-[8px]">{location.emoji}</span>
                </div>
                
                {/* Pulso para ubicación actual */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Ubicación actual */}
        <div className="mt-2 text-xs text-white">
          <span className="text-purple-400">📍</span>
          <span className="ml-1 font-medium">
            {locations.find(l => l.id === currentLocation)?.name || 'Desconocido'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}