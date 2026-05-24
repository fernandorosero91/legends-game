/**
 * 🔧 LEGENDS: InsForge Client
 * Cliente configurado para el proyecto LEGENDS
 * Autor: Fernando (Backend Developer) + Felipe (Integration)
 */

import { createClient } from '@insforge/sdk';

// Configuración del proyecto desde variables de entorno
const PROJECT_CONFIG = {
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL,
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY,
  projectId: import.meta.env.VITE_INSFORGE_PROJECT_ID,
  projectName: import.meta.env.VITE_INSFORGE_PROJECT_NAME,
  region: import.meta.env.VITE_INSFORGE_REGION,
};

// Validar que las variables de entorno estén configuradas
if (!PROJECT_CONFIG.baseUrl) {
  throw new Error('VITE_INSFORGE_BASE_URL no está configurada en las variables de entorno');
}

if (!PROJECT_CONFIG.anonKey) {
  throw new Error('VITE_INSFORGE_ANON_KEY no está configurada en las variables de entorno');
}

if (!PROJECT_CONFIG.projectId) {
  throw new Error('VITE_INSFORGE_PROJECT_ID no está configurada en las variables de entorno');
}

/**
 * Cliente InsForge configurado
 */
export const insforge = createClient({
  baseUrl: PROJECT_CONFIG.baseUrl,
  anonKey: PROJECT_CONFIG.anonKey,
});

/**
 * Types para las collections de la base de datos
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  total_games_played: number;
  best_score: number;
}

export interface GameSave {
  id: string;
  user_id: string;
  slot_name: string;
  created_at: string;
  updated_at: string;
  
  // Estado del juego
  current_day: number;
  current_level: number;
  time_of_day: string;
  game_phase: string;
  unlocked_features: string[];
  
  // Estado del jugador
  money: number;
  energy: number;
  hunger: number;
  monthly_listeners: number;
  reputation: number;
  position_x: number;
  position_y: number;
  position_z: number;
  total_songs_recorded: number;
  total_money_earned: number;
  total_money_spent: number;
  consecutive_days_without_rent: number;
  
  // Datos complejos (JSONB)
  songs: any[];
  inventory: any[];
  dialogue_flags: Record<string, any>;
  job_history: any[];
  statistics: Record<string, any>;
}

export interface Song {
  id: string;
  game_save_id: string;
  title: string;
  quality: 'low' | 'medium' | 'high' | 'masterpiece';
  rhythm_score: number;
  listeners_generated: number;
  revenue_generated: number;
  day_recorded: number;
  level: number;
  is_collaboration: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  final_listeners: number;
  final_day: number;
  total_songs: number;
  won: boolean;
  completed_at: string;
  final_money: number;
  final_reputation: number;
  total_jobs_completed: number;
  perfect_songs: number;
  collaborations: number;
}

/**
 * Helper para crear documentos
 */
export async function createDocument<T>(
  table: string,
  data: Partial<T>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await insforge.database
      .from(table)
      .insert(data)
      .select()
      .single();
    
    return {
      data: result.data as T | null,
      error: result.error
    };
  } catch (error) {
    console.error(`[InsForge] Error creating document in ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Helper para obtener un documento por ID
 */
export async function getDocument<T>(
  table: string,
  id: string
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await insforge.database
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    return {
      data: result.data as T | null,
      error: result.error
    };
  } catch (error) {
    console.error(`[InsForge] Error getting document from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Helper para actualizar un documento
 */
export async function updateDocument<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await insforge.database
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    return {
      data: result.data as T | null,
      error: result.error
    };
  } catch (error) {
    console.error(`[InsForge] Error updating document in ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Helper para eliminar un documento
 */
export async function deleteDocument(
  table: string,
  id: string
): Promise<{ error: any }> {
  try {
    const result = await insforge.database
      .from(table)
      .delete()
      .eq('id', id);
    
    return { error: result.error };
  } catch (error) {
    console.error(`[InsForge] Error deleting document from ${table}:`, error);
    return { error };
  }
}

/**
 * Helper para consultas con filtros (simplificado para InsForge)
 */
export async function queryDocuments<T>(
  table: string,
  filters?: Record<string, any>,
  options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: T[] | null; error: any; count?: number }> {
  try {
    // Construir query básico
    let query = insforge.database.from(table).select(options?.select || '*');
    
    // Aplicar filtros básicos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Para arrays, usar el primer valor por simplicidad
            query = query.eq(key, value[0]);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }
    
    // Aplicar ordenamiento si está especificado
    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending ?? true 
      });
    }
    
    // Aplicar límite si está especificado
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    // Ejecutar query
    const result = await query;
    
    return {
      data: result.data as T[] | null,
      error: result.error,
      count: result.data?.length || 0
    };
  } catch (error) {
    console.error(`[InsForge] Error querying documents from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Helper para subir archivos al storage
 */
export async function uploadFile(
  filePath: string,
  bucket: string = 'legends-assets'
): Promise<{ data: { url: string } | null; error: any }> {
  try {
    // Nota: Implementar según la API de storage de InsForge
    // Por ahora retornamos un placeholder
    console.log(`[InsForge] Uploading file to ${bucket}/${filePath}`);
    
    // TODO: Implementar upload real cuando tengamos la API de storage
    const mockUrl = `${PROJECT_CONFIG.baseUrl}/storage/${bucket}/${filePath}`;
    
    return {
      data: { url: mockUrl },
      error: null
    };
  } catch (error) {
    console.error(`[InsForge] Error uploading file:`, error);
    return { data: null, error };
  }
}

/**
 * Helper para obtener URL de archivo
 */
export function getFileUrl(
  path: string,
  bucket: string = 'legends-assets'
): string {
  return `${PROJECT_CONFIG.baseUrl}/storage/${bucket}/${path}`;
}

/**
 * Información del proyecto
 */
export const projectInfo = {
  ...PROJECT_CONFIG,
  tables: ['users', 'game_saves', 'songs', 'leaderboard'],
  buckets: ['legends-assets'],
};

console.log('[InsForge] Client initialized');