/**
 * 🎮 LEGENDS: Movement System
 * Sistema de movimiento y colisiones 3D
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Vector3 } from 'three';

interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface CollisionBox {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  type: 'wall' | 'object' | 'interactable';
  interactId?: string;
}

export class MovementSystem {
  // Límites del apartamento
  static readonly APARTMENT_BOUNDS: Bounds = {
    minX: -5,
    maxX: 5,
    minZ: -5,
    maxZ: 5,
  };

  // Velocidades
  static readonly WALK_SPEED = 0.05;
  static readonly RUN_SPEED = 0.1;

  /**
   * Mueve al jugador a una nueva posición
   */
  static movePlayer(
    direction: { x: number; z: number },
    isRunning: boolean = false
  ): boolean {
    const { position } = usePlayerStore.getState();
    const speed = isRunning ? this.RUN_SPEED : this.WALK_SPEED;

    // Calcular nueva posición
    const newX = position.x + direction.x * speed;
    const newZ = position.z + direction.z * speed;

    // Verificar límites
    if (!this.isWithinBounds(newX, newZ)) {
      return false;
    }

    // Verificar colisiones
    if (this.checkCollision(newX, newZ)) {
      return false;
    }

    // Actualizar posición
    usePlayerStore.getState().setPosition({ x: newX, y: position.y, z: newZ });

    return true;
  }

  /**
   * Verifica si una posición está dentro de los límites
   */
  static isWithinBounds(x: number, z: number): boolean {
    return (
      x >= this.APARTMENT_BOUNDS.minX &&
      x <= this.APARTMENT_BOUNDS.maxX &&
      z >= this.APARTMENT_BOUNDS.minZ &&
      z <= this.APARTMENT_BOUNDS.maxZ
    );
  }

  /**
   * Verifica colisiones con objetos
   */
  static checkCollision(x: number, z: number): boolean {
    const { wallBoxes } = usePlayerStore.getState();

    for (const box of wallBoxes) {
      if (
        x >= box.minX &&
        x <= box.maxX &&
        z >= box.minZ &&
        z <= box.maxZ
      ) {
        return true; // Hay colisión
      }
    }

    return false; // No hay colisión
  }

  /**
   * Teletransporta al jugador a una posición específica
   */
  static teleportPlayer(position: { x: number; y: number; z: number }): void {
    usePlayerStore.getState().setPosition(position);
  }

  /**
   * Obtiene la posición actual del jugador
   */
  static getPlayerPosition(): { x: number; y: number; z: number } {
    return usePlayerStore.getState().position;
  }

  /**
   * Verifica si el jugador está cerca de un objeto interactuable
   */
  static getNearbyInteractable(radius: number = 1.5): string | null {
    const { position, wallBoxes } = usePlayerStore.getState();

    for (const box of wallBoxes) {
      if (box.type !== 'interactable' || !box.interactId) continue;

      // Calcular centro del objeto
      const centerX = (box.minX + box.maxX) / 2;
      const centerZ = (box.minZ + box.maxZ) / 2;

      // Calcular distancia
      const distance = Math.sqrt(
        Math.pow(position.x - centerX, 2) + Math.pow(position.z - centerZ, 2)
      );

      if (distance <= radius) {
        return box.interactId;
      }
    }

    return null;
  }

  /**
   * Interactúa con un objeto cercano
   */
  static interact(): boolean {
    const interactableId = this.getNearbyInteractable();
    if (!interactableId) return false;

    console.log('[Movement] Interacting with:', interactableId);

    // Procesar interacción según el objeto
    switch (interactableId) {
      case 'bed':
        this.interactWithBed();
        break;

      case 'computer':
        this.interactWithComputer();
        break;

      case 'door':
        this.interactWithDoor();
        break;

      case 'studio':
        this.interactWithStudio();
        break;

      default:
        console.warn('[Movement] Unknown interactable:', interactableId);
        return false;
    }

    return true;
  }

  /**
   * Interacción con la cama (dormir)
   */
  private static interactWithBed(): void {
    const { timeOfDay } = useGameStore.getState();

    if (timeOfDay !== 'night') {
      useUIStore
        .getState()
        .addNotification('warning', '⏰ Solo puedes dormir por la noche.');
      return;
    }

    // Dormir (implementado en energySystem)
    import('../systems/energySystem').then(({ EnergySystem }) => {
      EnergySystem.sleep();
    });
  }

  /**
   * Interacción con el computador (trabajos online)
   */
  private static interactWithComputer(): void {
    const { currentLevel } = useGameStore.getState();

    if (currentLevel < 2) {
      useUIStore
        .getState()
        .addNotification(
          'info',
          '🔒 Los trabajos online se desbloquean en el Nivel 2.'
        );
      return;
    }

    // Abrir pantalla de trabajos
    useUIStore.getState().setScreen('job_select');
  }

  /**
   * Interacción con la puerta (salir a Purple City)
   */
  private static interactWithDoor(): void {
    useUIStore
      .getState()
      .addNotification('info', '🚪 Saliendo a Purple City...');

    // TODO: Cambiar a escena de ciudad
    console.log('[Movement] Going to city scene');
  }

  /**
   * Interacción con el estudio (grabar música)
   */
  private static interactWithStudio(): void {
    const { energy } = usePlayerStore.getState();

    if (energy < 30) {
      useUIStore
        .getState()
        .addNotification(
          'warning',
          '⚡ No tienes suficiente energía para grabar (necesitas 30).'
        );
      return;
    }

    // Iniciar minijuego rítmico
    useGameStore.getState().setGamePhase('rhythm_game');
  }

  /**
   * Calcula la dirección de movimiento desde input
   */
  static getDirectionFromInput(keys: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }): { x: number; z: number } {
    let x = 0;
    let z = 0;

    if (keys.forward) z -= 1;
    if (keys.backward) z += 1;
    if (keys.left) x -= 1;
    if (keys.right) x += 1;

    // Normalizar diagonal
    if (x !== 0 && z !== 0) {
      const length = Math.sqrt(x * x + z * z);
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  /**
   * Obtiene la animación apropiada según el movimiento
   */
  static getAnimationForMovement(
    isMoving: boolean,
    isRunning: boolean
  ): string {
    if (!isMoving) return 'Idle_Neutral';
    if (isRunning) return 'Run';
    return 'Walk';
  }

  /**
   * Agrega una caja de colisión
   */
  static addCollisionBox(box: CollisionBox): void {
    usePlayerStore.getState().addWallBox(box);
  }

  /**
   * Elimina una caja de colisión
   */
  static removeCollisionBox(id: string): void {
    usePlayerStore.getState().removeWallBox(id);
  }

  /**
   * Limpia todas las cajas de colisión
   */
  static clearCollisionBoxes(): void {
    usePlayerStore.getState().clearWallBoxes();
  }

  /**
   * Obtiene estadísticas de movimiento
   */
  static getMovementStats() {
    const { position, wallBoxes } = usePlayerStore.getState();
    const nearbyInteractable = this.getNearbyInteractable();

    return {
      position,
      collisionBoxCount: wallBoxes.length,
      nearbyInteractable,
      isWithinBounds: this.isWithinBounds(position.x, position.z),
    };
  }
}

// Importar useUIStore para notificaciones
import { useUIStore } from '../store/uiStore';
