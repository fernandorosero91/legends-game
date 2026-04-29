import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Location {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  icon: string;
  position: { x: number; y: number };
  available: boolean;
  energyCost?: number;
  workPay?: number;
  color: string;
  type: 'home' | 'work' | 'shop' | 'entertainment';
}

interface LocationMapProps {
  currentLocation: string;
  onSelectLocation: (locationId: string) => void;
  onClose: () => void;
}

export function LocationMap({ currentLocation, onSelectLocation, onClose }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const locations: Location[] = [
    {
      id: 'apartment',
      name: 'Mi Apartamento',
      shortName: 'Hogar',
      description: 'Tu hogar en Purple City. Aquí puedes descansar, grabar música y trabajar online.',
      category: 'Residencial',
      icon: '🏠',
      position: { x: 50, y: 50 },
      available: true,
      color: '#6366f1',
      type: 'home'
    },
    {
      id: 'cafe',
      name: 'Purple Beans Café',
      shortName: 'Café',
      description: 'Café acogedor donde puedes trabajar como barista y ganar dinero.',
      category: 'Trabajo',
      icon: '☕',
      position: { x: 25, y: 25 },
      available: true,
      energyCost: 20,
      workPay: 300,
      color: '#f59e0b',
      type: 'work'
    },
    {
      id: 'shop',
      name: 'Purple Sound Shop',
      shortName: 'Tienda',
      description: 'Tienda especializada en equipamiento musical y accesorios para productores.',
      category: 'Comercio',
      icon: '🎵',
      position: { x: 75, y: 25 },
      available: true,
      color: '#8b5cf6',
      type: 'shop'
    },
    {
      id: 'store',
      name: 'StreetWear Almacén',
      shortName: 'Almacén',
      description: 'Tienda de ropa urbana donde puedes trabajar como cajero.',
      category: 'Trabajo',
      icon: '🛍️',
      position: { x: 25, y: 75 },
      available: true,
      energyCost: 20,
      workPay: 350,
      color: '#10b981',
      type: 'work'
    },
    {
      id: 'restaurant',
      name: 'Restaurante La Esquina',
      shortName: 'Restaurante',
      description: 'Restaurante familiar donde puedes trabajar como mesero.',
      category: 'Trabajo',
      icon: '🍽️',
      position: { x: 75, y: 75 },
      available: true,
      energyCost: 25,
      workPay: 400,
      color: '#ef4444',
      type: 'work'
    },
    {
      id: 'bar',
      name: 'Neon Nights Club',
      shortName: 'Bar',
      description: 'Bar nocturno con ambiente musical donde puedes trabajar como DJ.',
      category: 'Entretenimiento',
      icon: '🎧',
      position: { x: 40, y: 60 },
      available: true,
      energyCost: 25,
      workPay: 600,
      color: '#ec4899',
      type: 'entertainment'
    },
    {
      id: 'academy',
      name: 'Academia SoundWave',
      shortName: 'Academia',
      description: 'Instituto de música donde puedes trabajar como instructor.',
      category: 'Educación',
      icon: '🎓',
      position: { x: 65, y: 35 },
      available: true,
      energyCost: 20,
      workPay: 800,
      color: '#8b5cf6',
      type: 'work'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos', color: '#64748b' },
    { id: 'work', name: 'Trabajo', color: '#10b981' },
    { id: 'shop', name: 'Comercio', color: '#8b5cf6' },
    { id: 'home', name: 'Residencial', color: '#6366f1' },
    { id: 'entertainment', name: 'Ocio', color: '#ec4899' }
  ];

  const filteredLocations = filterCategory === 'all' 
    ? locations 
    : locations.filter(loc => loc.type === filterCategory);

  const handleLocationClick = (location: Location) => {
    if (location.available) {
      onSelectLocation(location.id);
      onClose();
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800"
    >
      {/* Header Limpio y Organizado */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Purple City</h1>
              <p className="text-sm text-slate-400">Mapa de Ubicaciones</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros Simples */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mapa Principal - Diseño Limpio */}
      <div className="pt-32 pb-6 px-6 h-full">
        <div className="relative w-full h-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          
          {/* Grid Sutil de Fondo */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Conexiones Simples */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {filteredLocations.map((location) => {
              if (location.id === 'apartment') return null;
              const apartment = locations.find(l => l.id === 'apartment');
              if (!apartment) return null;

              return (
                <line
                  key={`connection-${location.id}`}
                  x1={`${apartment.position.x}%`}
                  y1={`${apartment.position.y}%`}
                  x2={`${location.position.x}%`}
                  y2={`${location.position.y}%`}
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* Ubicaciones - Diseño Limpio y Organizado */}
          {filteredLocations.map((location) => {
            const isHovered = hoveredLocation === location.id;
            const isCurrent = currentLocation === location.id;
            const isSelected = selectedLocation?.id === location.id;

            return (
              <motion.div
                key={location.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${location.position.x}%`,
                  top: `${location.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => handleLocationSelect(location)}
              >
                {/* Pulso para Ubicación Actual */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.8, 0, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                {/* Círculo Principal - Limpio */}
                <div
                  className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center
                    border-2 transition-all duration-200 shadow-lg
                    ${isCurrent 
                      ? 'border-white bg-white/20' 
                      : isSelected || isHovered
                        ? 'border-white bg-white/10 scale-110'
                        : 'border-slate-500 bg-slate-700'
                    }
                  `}
                  style={{
                    borderColor: isCurrent ? '#ffffff' : location.color,
                    backgroundColor: isCurrent ? `${location.color}40` : undefined
                  }}
                >
                  <span className="text-2xl">{location.icon}</span>
                </div>

                {/* Etiqueta Simple */}
                <div 
                  className={`
                    absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                    bg-slate-900 border border-slate-600 rounded px-2 py-1 
                    whitespace-nowrap text-xs font-medium text-white
                    ${isHovered || isSelected ? 'bg-slate-800 border-slate-500' : ''}
                  `}
                >
                  {location.shortName}
                </div>

                {/* Badges de Información - Organizados */}
                {location.workPay && (
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ${location.workPay}
                  </div>
                )}
                
                {location.energyCost && (
                  <div className="absolute -top-2 -left-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{location.energyCost}⚡
                  </div>
                )}

                {/* Indicador de Ubicación Actual */}
                {isCurrent && (
                  <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ACTUAL
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Panel de Información - Diseño Limpio */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-32 right-6 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-30"
          >
            {/* Header del Panel */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center border-2"
                  style={{ 
                    backgroundColor: `${selectedLocation.color}20`,
                    borderColor: selectedLocation.color
                  }}
                >
                  <span className="text-xl">{selectedLocation.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedLocation.name}</h3>
                  <p className="text-sm text-slate-400">{selectedLocation.category}</p>
                </div>
              </div>
            </div>

            {/* Contenido del Panel */}
            <div className="p-4">
              <p className="text-sm text-slate-300 mb-4">
                {selectedLocation.description}
              </p>

              {/* Información de Trabajo */}
              {selectedLocation.workPay && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-600/20 rounded-lg p-3 border border-green-600/30">
                    <div className="text-xs text-green-400 font-bold mb-1">SALARIO</div>
                    <div className="text-xl font-bold text-green-300">${selectedLocation.workPay}</div>
                  </div>
                  <div className="bg-orange-600/20 rounded-lg p-3 border border-orange-600/30">
                    <div className="text-xs text-orange-400 font-bold mb-1">ENERGÍA</div>
                    <div className="text-xl font-bold text-orange-300">-{selectedLocation.energyCost}</div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="space-y-2">
                <button
                  onClick={() => handleLocationClick(selectedLocation)}
                  className={`
                    w-full py-3 px-4 rounded-lg font-bold text-white transition-colors
                    ${selectedLocation.id === currentLocation
                      ? 'bg-slate-600 cursor-not-allowed opacity-50'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                    }
                  `}
                  disabled={selectedLocation.id === currentLocation}
                >
                  {selectedLocation.id === currentLocation ? 'UBICACIÓN ACTUAL' : 'VIAJAR AQUÍ'}
                </button>

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="w-full py-2 px-4 rounded-lg font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Simple */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <span className="text-slate-300">Salario</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full" />
              <span className="text-slate-300">Energía</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full" />
              <span className="text-slate-300">Tu ubicación</span>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            Haz clic en una ubicación para más información
          </div>
        </div>
      </div>
    </motion.div>
  );
}