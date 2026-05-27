/**
 * 🎮 LEGENDS: Job System
 * Sistema de trabajos (online y físicos)
 * Autor: Felipe (Systems Developer)
 */

import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useJobStore } from '../store/jobStore';
import { useUIStore } from '../store/uiStore';
import { EnergySystem } from './energySystem';
import { DayCycleSystem } from './dayCycleSystem';
import { getJobById, canDoJob } from '../data/jobs';
import type { Job } from '../types/jobs';

export class JobSystem {
  /**
   * Inicia un trabajo
   */
  static startJob(jobId: string): boolean {
    const job = getJobById(jobId);
    if (!job) {
      console.error('[Job] Job not found:', jobId);
      return false;
    }

    const { energy } = usePlayerStore.getState();
    const { currentLevel } = useGameStore.getState();

    // Verificar si puede hacer el trabajo
    if (!canDoJob(jobId, energy, currentLevel)) {
      if (energy < job.energyCost) {
        useUIStore.getState().addNotification(
          'error',
          '❌ No tienes suficiente energía para este trabajo.'
        );
      } else {
        useUIStore.getState().addNotification(
          'error',
          `❌ Este trabajo requiere nivel ${job.levelRequired}.`
        );
      }
      return false;
    }

    // Consumir energía
    const energyConsumed = EnergySystem.consume(job.energyCost, job.name);
    if (!energyConsumed) {
      return false;
    }

    // Iniciar trabajo en el store
    useJobStore.getState().startJob(job);

    // Cambiar fase del juego
    useGameStore.getState().setGamePhase('working');

    useUIStore.getState().addNotification(
      'info',
      `💼 Trabajando: ${job.name}...`
    );

    console.log('[Job] Started job:', job.name);

    return true;
  }

  /**
   * Actualiza el progreso del trabajo
   */
  static updateProgress(progress: number): void {
    useJobStore.getState().updateJobProgress(progress);
  }

  /**
   * Completa el trabajo actual
   */
  static completeJob(): boolean {
    const currentJob = useJobStore.getState().currentJob;
    if (!currentJob) {
      console.error('[Job] No active job to complete');
      return false;
    }

    // Completar trabajo en el store
    const job = useJobStore.getState().completeJob();
    if (!job) return false;

    // Pagar al jugador
    usePlayerStore.getState().addMoney(job.pay);

    // Registrar en historial
    const { currentDay } = useGameStore.getState();
    usePlayerStore.getState().addJobRecord({
      jobId: job.id,
      dayCompleted: currentDay,
      moneyEarned: job.pay,
    });

    // Avanzar turnos
    for (let i = 0; i < job.turnsCost; i++) {
      DayCycleSystem.advanceTurn();
    }

    // Volver a fase de juego
    useGameStore.getState().setGamePhase('playing');

    useUIStore.getState().addNotification(
      'success',
      `✅ Trabajo completado: ${job.name} - +$${job.pay}`
    );

    console.log('[Job] Completed job:', job.name, 'Earned:', job.pay);

    return true;
  }

  /**
   * Cancela el trabajo actual
   */
  static cancelJob(): void {
    const currentJob = useJobStore.getState().currentJob;
    if (!currentJob) return;

    useJobStore.getState().cancelJob();
    useGameStore.getState().setGamePhase('playing');

    useUIStore.getState().addNotification(
      'warning',
      '⚠️ Trabajo cancelado'
    );

    console.log('[Job] Cancelled job:', currentJob.name);
  }

  /**
   * Obtiene trabajos disponibles según el nivel
   */
  static getAvailableJobs(): Job[] {
    const { currentLevel } = useGameStore.getState();
    useJobStore.getState().refreshAvailableJobs(currentLevel);
    return useJobStore.getState().availableJobs;
  }

  /**
   * Obtiene trabajos online disponibles
   */
  static getOnlineJobs(): Job[] {
    const { currentLevel } = useGameStore.getState();
    return useJobStore.getState().getOnlineJobsList(currentLevel);
  }

  /**
   * Obtiene trabajos físicos disponibles
   */
  static getPhysicalJobs(): Job[] {
    const { currentLevel } = useGameStore.getState();
    return useJobStore.getState().getPhysicalJobsList(currentLevel);
  }

  /**
   * Verifica si hay un trabajo en progreso
   */
  static isJobInProgress(): boolean {
    return useJobStore.getState().isJobInProgress();
  }

  /**
   * Obtiene el trabajo actual
   */
  static getCurrentJob(): Job | null {
    return useJobStore.getState().currentJob;
  }

  /**
   * Obtiene el progreso del trabajo actual
   */
  static getJobProgress(): number {
    return useJobStore.getState().jobProgress;
  }

  /**
   * Calcula el mejor trabajo disponible por pago/energía
   */
  static getBestJobByEfficiency(): Job | null {
    const availableJobs = this.getAvailableJobs();
    const { energy } = usePlayerStore.getState();

    const affordableJobs = availableJobs.filter((job) => energy >= job.energyCost);

    if (affordableJobs.length === 0) return null;

    // Calcular eficiencia (pago / energía)
    return affordableJobs.reduce((best, job) => {
      const efficiency = job.pay / job.energyCost;
      const bestEfficiency = best.pay / best.energyCost;
      return efficiency > bestEfficiency ? job : best;
    });
  }

  /**
   * Obtiene estadísticas de trabajos
   */
  static getJobStats(): {
    totalJobsCompleted: number;
    totalMoneyEarned: number;
    onlineJobsCompleted: number;
    physicalJobsCompleted: number;
    favoriteJob: string | null;
    mostProfitableJob: string | null;
    averagePayPerJob: number;
  } {
    const { jobHistory } = usePlayerStore.getState();

    const totalJobsCompleted = jobHistory.length;
    const totalMoneyEarned = jobHistory.reduce((sum, record) => sum + record.moneyEarned, 0);

    // Contar trabajos online vs físicos
    const onlineJobIds = ['email_writing', 'data_entry', 'logo_design', 'video_editing', 'web_dev'];
    const onlineJobsCompleted = jobHistory.filter((record) =>
      onlineJobIds.includes(record.jobId)
    ).length;
    const physicalJobsCompleted = totalJobsCompleted - onlineJobsCompleted;

    // Trabajo favorito (más completado)
    const jobCounts: Record<string, number> = {};
    jobHistory.forEach((record) => {
      jobCounts[record.jobId] = (jobCounts[record.jobId] || 0) + 1;
    });
    const favoriteJobEntry = Object.entries(jobCounts).sort((a, b) => b[1] - a[1])[0];
    const favoriteJob = favoriteJobEntry ? favoriteJobEntry[0] : null;

    // Trabajo más rentable (más dinero ganado en total)
    const jobEarnings: Record<string, number> = {};
    jobHistory.forEach((record) => {
      jobEarnings[record.jobId] = (jobEarnings[record.jobId] || 0) + record.moneyEarned;
    });
    const mostProfitableEntry = Object.entries(jobEarnings).sort((a, b) => b[1] - a[1])[0];
    const mostProfitableJob = mostProfitableEntry ? mostProfitableEntry[0] : null;

    return {
      totalJobsCompleted,
      totalMoneyEarned,
      onlineJobsCompleted,
      physicalJobsCompleted,
      favoriteJob,
      mostProfitableJob,
      averagePayPerJob: totalJobsCompleted > 0 ? totalMoneyEarned / totalJobsCompleted : 0,
    };
  }

  /**
   * Simula un trabajo (para testing o auto-completado)
   */
  static simulateJob(jobId: string): boolean {
    if (!this.startJob(jobId)) {
      return false;
    }

    // Simular progreso
    for (let i = 0; i <= 100; i += 10) {
      this.updateProgress(i);
    }

    // Completar
    return this.completeJob();
  }
}
