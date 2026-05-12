/**
 * 🎮 LEGENDS: Rhythm System
 * Sistema del minijuego rítmico (grabación de canciones)
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { getQualityFromScore, getBaseListenersFromQuality, getBeatById } from '../data/songs';
import { getRhythmDifficulty } from '../data/levels';
import type { SongQuality } from '../types/game';

export interface Note {
  id: string;
  lane: number; // 0-3 (A, S, D, F)
  time: number; // Tiempo en ms desde el inicio
  hit: boolean;
  hitTime?: number;
  accuracy?: 'perfect' | 'good' | 'ok' | 'miss';
}

export interface RhythmGameState {
  beatId: string;
  notes: Note[];
  currentTime: number;
  score: number;
  combo: number;
  maxCombo: number;
  perfectHits: number;
  goodHits: number;
  okHits: number;
  misses: number;
  isPlaying: boolean;
  isComplete: boolean;
}

export class RhythmSystem {
  private static gameState: RhythmGameState | null = null;

  /**
   * Genera notas para un beat según el nivel actual
   */
  static generateNotes(beatId: string, duration: number): Note[] {
    const currentLevel = useGameStore.getState().currentLevel;
    const difficulty = getRhythmDifficulty(currentLevel);
    
    if (!difficulty) {
      console.error('[Rhythm] No difficulty config for level:', currentLevel);
      return [];
    }

    const notes: Note[] = [];
    const { notesPerBeat, patterns } = difficulty;
    const beatsPerSecond = 2; // Ajustable según el tempo del beat
    const totalBeats = Math.floor((duration / 1000) * beatsPerSecond);

    for (let beat = 0; beat < totalBeats; beat++) {
      const beatTime = (beat / beatsPerSecond) * 1000;
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      // Generar notas según el patrón
      switch (pattern) {
        case 'single':
          notes.push(this.createNote(beatTime, Math.floor(Math.random() * 4)));
          break;
        case 'double':
          notes.push(
            this.createNote(beatTime, Math.floor(Math.random() * 4)),
            this.createNote(beatTime + 100, Math.floor(Math.random() * 4))
          );
          break;
        case 'triple':
          notes.push(
            this.createNote(beatTime, Math.floor(Math.random() * 4)),
            this.createNote(beatTime + 100, Math.floor(Math.random() * 4)),
            this.createNote(beatTime + 200, Math.floor(Math.random() * 4))
          );
          break;
        case 'quad':
          notes.push(
            this.createNote(beatTime, 0),
            this.createNote(beatTime, 1),
            this.createNote(beatTime, 2),
            this.createNote(beatTime, 3)
          );
          break;
        case 'syncopated':
          notes.push(
            this.createNote(beatTime, Math.floor(Math.random() * 4)),
            this.createNote(beatTime + 150, Math.floor(Math.random() * 4)),
            this.createNote(beatTime + 350, Math.floor(Math.random() * 4))
          );
          break;
        case 'complex':
        case 'expert':
          // Patrones más complejos para niveles altos
          for (let i = 0; i < notesPerBeat; i++) {
            notes.push(
              this.createNote(
                beatTime + (i * (500 / notesPerBeat)),
                Math.floor(Math.random() * 4)
              )
            );
          }
          break;
      }
    }

    return notes.sort((a, b) => a.time - b.time);
  }

  /**
   * Crea una nota individual
   */
  private static createNote(time: number, lane: number): Note {
    return {
      id: `note-${time}-${lane}-${Math.random()}`,
      lane,
      time,
      hit: false,
    };
  }

  /**
   * Inicia una sesión de grabación
   */
  static startRecording(beatId: string): RhythmGameState {
    const beat = getBeatById(beatId);
    if (!beat) {
      throw new Error(`Beat not found: ${beatId}`);
    }

    // Duración del beat (30 segundos de gameplay activo)
    const duration = 30000;

    this.gameState = {
      beatId,
      notes: this.generateNotes(beatId, duration),
      currentTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectHits: 0,
      goodHits: 0,
      okHits: 0,
      misses: 0,
      isPlaying: true,
      isComplete: false,
    };

    useGameStore.getState().setGamePhase('rhythm_game');
    console.log('[Rhythm] Started recording:', beatId, 'Notes:', this.gameState.notes.length);

    return this.gameState;
  }

  /**
   * Procesa un input del jugador
   */
  static processInput(lane: number, inputTime: number): {
    hit: boolean;
    accuracy?: 'perfect' | 'good' | 'ok' | 'miss';
    points: number;
  } {
    if (!this.gameState || !this.gameState.isPlaying) {
      return { hit: false, points: 0 };
    }

    const currentLevel = useGameStore.getState().currentLevel;
    const difficulty = getRhythmDifficulty(currentLevel);
    
    if (!difficulty) {
      return { hit: false, points: 0 };
    }

    const { perfectWindow, goodWindow, okWindow } = difficulty;

    // Buscar la nota más cercana en el carril
    const note = this.gameState.notes.find(
      (n) => n.lane === lane && !n.hit && Math.abs(n.time - inputTime) <= okWindow
    );

    if (!note) {
      // Miss - rompe el combo
      this.gameState.combo = 0;
      this.gameState.misses++;
      return { hit: false, accuracy: 'miss', points: 0 };
    }

    // Calcular precisión
    const timeDiff = Math.abs(note.time - inputTime);
    let accuracy: 'perfect' | 'good' | 'ok';
    let points: number;

    if (timeDiff <= perfectWindow) {
      accuracy = 'perfect';
      points = 100;
      this.gameState.perfectHits++;
    } else if (timeDiff <= goodWindow) {
      accuracy = 'good';
      points = 75;
      this.gameState.goodHits++;
    } else {
      accuracy = 'ok';
      points = 50;
      this.gameState.okHits++;
    }

    // Aplicar combo multiplier
    this.gameState.combo++;
    if (this.gameState.combo > this.gameState.maxCombo) {
      this.gameState.maxCombo = this.gameState.combo;
    }

    const comboMultiplier = 1 + Math.floor(this.gameState.combo / 10) * 0.1;
    points = Math.floor(points * comboMultiplier);

    // Marcar nota como golpeada
    note.hit = true;
    note.hitTime = inputTime;
    note.accuracy = accuracy;

    // Actualizar score
    this.gameState.score += points;

    return { hit: true, accuracy, points };
  }

  /**
   * Actualiza el tiempo actual del juego
   */
  static updateTime(currentTime: number): void {
    if (!this.gameState) return;

    this.gameState.currentTime = currentTime;

    // Marcar notas perdidas (pasaron sin ser golpeadas)
    const missedNotes = this.gameState.notes.filter(
      (note) => !note.hit && note.time < currentTime - 200
    );

    missedNotes.forEach((note) => {
      if (!note.hit) {
        note.hit = true;
        note.accuracy = 'miss';
        this.gameState!.misses++;
        this.gameState!.combo = 0;
      }
    });
  }

  /**
   * Finaliza la sesión de grabación y calcula resultados
   */
  static finishRecording(): {
    quality: SongQuality;
    rhythmScore: number;
    listenersGenerated: number;
    songId: string;
  } {
    if (!this.gameState) {
      throw new Error('No active rhythm game');
    }

    const totalNotes = this.gameState.notes.length;
    const hitNotes = this.gameState.perfectHits + this.gameState.goodHits + this.gameState.okHits;

    // Calcular score final (0-100)
    const rhythmScore = totalNotes > 0 ? Math.floor((hitNotes / totalNotes) * 100) : 0;

    // Determinar calidad
    const quality = getQualityFromScore(rhythmScore);

    // Calcular oyentes base
    const baseListeners = getBaseListenersFromQuality(quality);

    // Aplicar multiplicadores
    const currentLevel = useGameStore.getState().currentLevel;
    const { reputation, inventory } = usePlayerStore.getState();

    // Multiplicador de nivel (de levels.ts)
    const levelMultipliers = [1.0, 1.2, 1.5, 1.8, 2.2, 2.5];
    const levelMultiplier = levelMultipliers[currentLevel - 1] || 1.0;

    // Multiplicador de reputación (1 + reputación/100)
    const reputationMultiplier = 1 + reputation / 100;

    // Bonus de equipamiento (calculado desde el inventario)
    const equipmentBonus = this.calculateEquipmentBonus(inventory);

    // Calcular oyentes finales
    const listenersGenerated = Math.floor(
      baseListeners * levelMultiplier * reputationMultiplier * (1 + equipmentBonus / 100)
    );

    // Crear la canción
    const { currentDay } = useGameStore.getState();
    const songId = `song-${Date.now()}`;
    const songTitle = this.generateSongTitle();

    const song = {
      id: songId,
      title: songTitle,
      beatId: this.gameState.beatId,
      quality,
      rhythmScore,
      listenersGenerated,
      revenueGenerated: 0,
      dayRecorded: currentDay,
      level: currentLevel,
      isCollaboration: false,
    };

    // Agregar canción al jugador
    usePlayerStore.getState().addSong(song);

    // Agregar oyentes
    usePlayerStore.getState().addListeners(listenersGenerated);

    // Notificación
    useUIStore.getState().addNotification(
      'success',
      `🎵 Canción grabada: "${songTitle}" (${quality}) - +${listenersGenerated} oyentes`
    );

    // Limpiar estado
    this.gameState.isComplete = true;
    this.gameState.isPlaying = false;

    console.log('[Rhythm] Recording finished:', {
      quality,
      rhythmScore,
      listenersGenerated,
      songTitle,
    });

    return { quality, rhythmScore, listenersGenerated, songId };
  }

  /**
   * Calcula el bonus de equipamiento
   */
  private static calculateEquipmentBonus(inventory: any[]): number {
    const equipmentItems = [
      'basic_mic',
      'pro_mic',
      'studio_headphones',
      'studio_monitor',
      'audio_interface',
      'midi_controller',
      'soundproofing',
    ];

    const bonuses: Record<string, number> = {
      basic_mic: 5,
      pro_mic: 15,
      studio_headphones: 8,
      studio_monitor: 12,
      audio_interface: 18,
      midi_controller: 10,
      soundproofing: 10,
    };

    let totalBonus = 0;
    inventory.forEach((item) => {
      if (equipmentItems.includes(item.itemId) && item.equipped) {
        totalBonus += bonuses[item.itemId] || 0;
      }
    });

    return totalBonus;
  }

  /**
   * Genera un título aleatorio para la canción
   */
  private static generateSongTitle(): string {
    const titles = [
      'Purple Dreams',
      'City Nights',
      'Hustle Hard',
      'Gold Chains',
      'Street Poetry',
      'Midnight Flow',
      'Urban Legend',
      'Rise Up',
      'No Sleep',
      'Purple City Anthem',
      'Struggle & Success',
      'From Zero',
      'The Climb',
      'Rent Money',
      'Studio Sessions',
      'Late Night Grind',
      'Purple Rain',
      'City Lights',
      'Underground King',
      'Legendary',
    ];

    return titles[Math.floor(Math.random() * titles.length)];
  }

  /**
   * Obtiene el estado actual del juego
   */
  static getGameState(): RhythmGameState | null {
    return this.gameState;
  }

  /**
   * Cancela la sesión de grabación
   */
  static cancelRecording(): void {
    if (this.gameState) {
      this.gameState.isPlaying = false;
      this.gameState = null;
      useGameStore.getState().setGamePhase('playing');
      console.log('[Rhythm] Recording cancelled');
    }
  }

  /**
   * Obtiene estadísticas del juego actual
   */
  static getStats(): {
    accuracy: number;
    perfectPercentage: number;
    goodPercentage: number;
    okPercentage: number;
    missPercentage: number;
  } | null {
    if (!this.gameState) return null;

    const totalNotes = this.gameState.notes.length;
    if (totalNotes === 0) return null;

    return {
      accuracy: Math.floor(
        ((this.gameState.perfectHits + this.gameState.goodHits + this.gameState.okHits) /
          totalNotes) *
          100
      ),
      perfectPercentage: Math.floor((this.gameState.perfectHits / totalNotes) * 100),
      goodPercentage: Math.floor((this.gameState.goodHits / totalNotes) * 100),
      okPercentage: Math.floor((this.gameState.okHits / totalNotes) * 100),
      missPercentage: Math.floor((this.gameState.misses / totalNotes) * 100),
    };
  }
}
