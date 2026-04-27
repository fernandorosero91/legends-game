/**
 * 🎮 LEGENDS: SaveLoadScreen Component
 * Pantalla para cargar partidas guardadas
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button, Icon } from '@/components/atoms';
import { useUIStore } from '../../store/uiStore';
import { useSaveSlots } from '../../hooks/useInsForge';

const SaveLoadScreen = () => {
  const { saves, loadGame, deleteSave } = useSaveSlots();
  const setScreen = useUIStore((s) => s.setScreen);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);

  const handleLoadGame = async (saveId: string) => {
    setIsLoading(true);
    try {
      const result = await loadGame(saveId);
      if (result.success) {
        setScreen('game');
      } else {
        console.error('Error loading game:', result.error);
        // TODO: Mostrar notificación de error
      }
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta partida?')) {
      const result = await deleteSave(saveId);
      if (!result.success) {
        console.error('Error deleting save:', result.error);
        // TODO: Mostrar notificación de error
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-purple-400">Cargar Partida</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScreen('main_menu')}
          >
            <Icon name="close" size="sm" />
            Volver
          </Button>
        </div>

        {/* Lista de partidas guardadas */}
        {saves.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="save" size="lg" className="text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg mb-4">No hay partidas guardadas</p>
            <Button
              variant="primary"
              onClick={() => setScreen('main_menu')}
            >
              Volver al Menú
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {saves.map((save) => (
              <motion.div
                key={save.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedSave === save.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'
                }`}
                onClick={() => setSelectedSave(save.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {save.slotName}
                    </h3>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Día {save.gameData.currentDay} - Nivel {save.gameData.currentLevel}</p>
                      <p>Oyentes: {save.gameData.monthlyListeners.toLocaleString()}</p>
                      <p>Dinero: ${save.gameData.money.toLocaleString()}</p>
                      <p>Guardado: {formatDate(save.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLoadGame(save.id)}
                      disabled={isLoading}
                    >
                      <Icon name="play" size="sm" />
                      Cargar
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSave(save.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Icon name="x" size="sm" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-700">
          <Button
            variant="secondary"
            onClick={() => setScreen('main_menu')}
          >
            Cancelar
          </Button>
          
          {selectedSave && (
            <Button
              variant="primary"
              onClick={() => handleLoadGame(selectedSave)}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Cargar Partida Seleccionada'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SaveLoadScreen;