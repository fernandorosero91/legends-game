/**
 * 🎮 LEGENDS: Jobs Hook
 * Hook para trabajos
 * Autor: Felipe (Systems Developer)
 */

import { useCallback, useEffect } from 'react';
import { useJobStore } from '../store/jobStore';
import { useGameStore } from '../store/gameStore';
import { JobSystem } from '../systems/jobSystem';

export const useJobs = () => {
  const {
    availableJobs,
    currentJob,
    jobProgress,
  } = useJobStore();

  const { currentLevel } = useGameStore();

  // Refrescar trabajos cuando cambia el nivel
  useEffect(() => {
    JobSystem.getAvailableJobs();
  }, [currentLevel]);

  // Iniciar trabajo
  const startJob = useCallback((jobId: string) => {
    return JobSystem.startJob(jobId);
  }, []);

  // Actualizar progreso
  const updateProgress = useCallback((progress: number) => {
    JobSystem.updateProgress(progress);
  }, []);

  // Completar trabajo
  const completeJob = useCallback(() => {
    return JobSystem.completeJob();
  }, []);

  // Cancelar trabajo
  const cancelJob = useCallback(() => {
    JobSystem.cancelJob();
  }, []);

  // Obtener trabajos por tipo
  const onlineJobs = JobSystem.getOnlineJobs();
  const physicalJobs = JobSystem.getPhysicalJobs();

  // Mejor trabajo por eficiencia
  const bestJob = JobSystem.getBestJobByEfficiency();

  // Verificar si hay trabajo en progreso
  const isJobInProgress = JobSystem.isJobInProgress();

  // Stats
  const jobStats = JobSystem.getJobStats();

  return {
    // Trabajos
    availableJobs,
    onlineJobs,
    physicalJobs,
    currentJob,
    jobProgress,
    bestJob,

    // Estado
    isJobInProgress,

    // Acciones
    startJob,
    updateProgress,
    completeJob,
    cancelJob,

    // Stats
    jobStats,
  };
};
