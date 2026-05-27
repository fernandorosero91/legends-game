/**
 * 🎮 LEGENDS: Job Store
 * Estado de trabajos (disponibles, en progreso)
 * Autor: Felipe (Systems Developer)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ALL_JOBS, getAvailableJobs, getOnlineJobs, getPhysicalJobs } from '../data/jobs';
import type { Job } from '../types/jobs';

interface JobState {
  // Trabajos
  availableJobs: Job[];
  currentJob: Job | null;
  jobProgress: number;
  jobStartTime: number | null;

  // Acciones
  refreshAvailableJobs: (currentLevel: number) => void;
  getOnlineJobsList: (currentLevel: number) => Job[];
  getPhysicalJobsList: (currentLevel: number) => Job[];
  startJob: (job: Job) => void;
  updateJobProgress: (progress: number) => void;
  completeJob: () => Job | null;
  cancelJob: () => void;
  isJobInProgress: () => boolean;
}

export const useJobStore = create<JobState>()(
  devtools(
    (set, get) => ({
      availableJobs: ALL_JOBS,
      currentJob: null,
      jobProgress: 0,
      jobStartTime: null,

      refreshAvailableJobs: (currentLevel: number) => {
        const jobs = getAvailableJobs(currentLevel);
        set({ availableJobs: jobs });
      },

      getOnlineJobsList: (currentLevel: number) => {
        return getOnlineJobs(currentLevel);
      },

      getPhysicalJobsList: (currentLevel: number) => {
        return getPhysicalJobs(currentLevel);
      },

      startJob: (job: Job) => {
        set({
          currentJob: job,
          jobProgress: 0,
          jobStartTime: Date.now(),
        });
      },

      updateJobProgress: (progress: number) => {
        set({ jobProgress: Math.max(0, Math.min(100, progress)) });
      },

      completeJob: () => {
        const { currentJob } = get();
        set({
          currentJob: null,
          jobProgress: 0,
          jobStartTime: null,
        });
        return currentJob;
      },

      cancelJob: () => {
        set({
          currentJob: null,
          jobProgress: 0,
          jobStartTime: null,
        });
      },

      isJobInProgress: () => {
        return get().currentJob !== null;
      },
    }),
    { name: 'JobStore' }
  )
);

// Selectores útiles
export const selectAvailableJobs = (state: JobState) => state.availableJobs;
export const selectCurrentJob = (state: JobState) => state.currentJob;
export const selectJobProgress = (state: JobState) => state.jobProgress;
export const selectIsJobInProgress = (state: JobState) => state.isJobInProgress();
