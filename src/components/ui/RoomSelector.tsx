/**
 * LEGENDS: RoomSelector — Menu para cambiar de habitación en el apartamento
 * Se desbloquea en Nivel 3 (room_level2 y studio_level_3)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type ApartmentRoom } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';

interface RoomOption {
  id: ApartmentRoom;
  name: string;
  icon: string;
  description: string;
  levelRequired: number;
}

const ROOM_OPTIONS: RoomOption[] = [
  {
    id: 'room_level1',
    name: 'Habitación Principal',
    icon: 'bedroom',
    description: 'Tu primera habitación con cama, escritorio y sofá.',
    levelRequired: 1,
  },
  {
    id: 'studio_level_3',
    name: 'Estudio de Grabación',
    icon: 'studio',
    description: 'Estudio profesional con piano, monitores y equipo de producción.',
    levelRequired: 3,
  },
];

/** SVG icons for room types */
function RoomIcon({ type, className = '' }: { type: string; className?: string }) {
  if (type === 'bedroom') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" />
        <path d="M3 15h18" />
        <path d="M7 15V9h10v6" />
        <path d="M5 21h14" />
        <path d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2" />
      </svg>
    );
  }
  if (type === 'studio') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
      </svg>
    );
  }
  return <span className={className}>🏠</span>;
}

export function RoomSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const currentScene = useGameStore((s) => s.currentScene);
  const setCurrentRoom = useGameStore((s) => s.setCurrentRoom);
  const addNotification = useUIStore((s) => s.addNotification);

  // Solo mostrar si estamos en el apartamento y nivel >= 3
  if (currentScene !== 'apartment' || currentLevel < 3) return null;

  const handleSelectRoom = (room: RoomOption) => {
    if (room.levelRequired > currentLevel) {
      addNotification('warning', `🔒 Necesitas nivel ${room.levelRequired} para desbloquear esta habitación`);
      return;
    }
    if (room.id === currentRoom) {
      setIsOpen(false);
      return;
    }
    setCurrentRoom(room.id);
    setIsOpen(false);
    addNotification('success', `🚪 Cambiaste a: ${room.name}`);
    // Remove focus from button to restore keyboard control to game
    (document.activeElement as HTMLElement)?.blur();
  };

  const currentRoomData = ROOM_OPTIONS.find((r) => r.id === currentRoom);

  return (
    <>
      {/* Botón flotante para abrir selector */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={-1}
        className="fixed bottom-[72px] left-4 z-40 flex items-center gap-3 px-4 py-2.5 w-[220px] rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 text-white shadow-lg border border-purple-500/50 hover:border-purple-400 transition-all"
        title="Cambiar habitación"
      >
        <RoomIcon type={currentRoomData?.icon || 'bedroom'} className="w-5 h-5 text-purple-200" />
        <span className="text-sm font-bold">{currentRoomData?.name || 'Habitación'}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      {/* Panel de selección */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-36 left-4 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-purple-500/20 bg-purple-900/30">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🚪 Cambiar Habitación
                </h3>
                <p className="text-xs text-purple-300 mt-0.5">Selecciona una habitación del apartamento</p>
              </div>

              {/* Room list */}
              <div className="p-2 space-y-1">
                {ROOM_OPTIONS.map((room) => {
                  const isLocked = room.levelRequired > currentLevel;
                  const isActive = room.id === currentRoom;

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      disabled={isLocked}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                        isActive
                          ? 'bg-purple-600/30 border border-purple-500/60 shadow-md'
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed bg-gray-800/30'
                          : 'hover:bg-purple-800/30 border border-transparent hover:border-purple-500/30'
                      }`}
                    >
                      {isLocked ? (
                        <span className="text-2xl mt-0.5">🔒</span>
                      ) : (
                        <RoomIcon type={room.icon} className="w-6 h-6 mt-0.5 text-purple-300" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {room.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-bold">
                              ACTUAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {isLocked ? `Desbloquea en Nivel ${room.levelRequired}` : room.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
