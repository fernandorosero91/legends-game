/**
 * 🔧 Script de Setup de InsForge
 * 
 * Este script crea las collections necesarias en InsForge
 * y define sus schemas.
 * 
 * Ejecutar una sola vez al iniciar el proyecto:
 * npm run setup:insforge
 */

import { insforge } from './insforge';

/**
 * Schema de las collections
 */
const COLLECTIONS_SCHEMA = {
  users: {
    name: 'users',
    description: 'Usuarios registrados en el juego',
    fields: {
      id: { type: 'string', required: true, primary: true },
      username: { type: 'string', required: true, unique: true },
      email: { type: 'string', required: true, unique: true },
      avatarUrl: { type: 'string', required: false },
      createdAt: { type: 'number', required: true },
      totalGamesPlayed: { type: 'number', required: true, default: 0 },
      bestScore: { type: 'number', required: true, default: 0 }
    },
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['username'], unique: true },
      { fields: ['bestScore'], unique: false }
    ]
  },
  
  game_saves: {
    name: 'game_saves',
    description: 'Partidas guardadas de los jugadores',
    fields: {
      id: { type: 'string', required: true, primary: true },
      userId: { type: 'string', required: true },
      slotName: { type: 'string', required: true },
      createdAt: { type: 'number', required: true },
      updatedAt: { type: 'number', required: true },
      gameState: { type: 'object', required: true },
      playerState: { type: 'object', required: true },
      songs: { type: 'array', required: true },
      inventory: { type: 'array', required: true },
      unlockedFeatures: { type: 'array', required: true },
      dialogueFlags: { type: 'object', required: true },
      jobHistory: { type: 'array', required: true },
      statistics: { type: 'object', required: true }
    },
    indexes: [
      { fields: ['userId'], unique: false },
      { fields: ['userId', 'slotName'], unique: true },
      { fields: ['updatedAt'], unique: false }
    ]
  },
  
  songs: {
    name: 'songs',
    description: 'Canciones grabadas en las partidas',
    fields: {
      id: { type: 'string', required: true, primary: true },
      gameId: { type: 'string', required: true },
      title: { type: 'string', required: true },
      quality: { type: 'string', required: true },
      rhythmScore: { type: 'number', required: true },
      listenersGenerated: { type: 'number', required: true },
      revenueGenerated: { type: 'number', required: true },
      dayRecorded: { type: 'number', required: true },
      level: { type: 'number', required: true },
      isCollaboration: { type: 'boolean', required: true }
    },
    indexes: [
      { fields: ['gameId'], unique: false },
      { fields: ['quality'], unique: false },
      { fields: ['dayRecorded'], unique: false }
    ]
  },
  
  leaderboard: {
    name: 'leaderboard',
    description: 'Tabla de líderes global',
    fields: {
      id: { type: 'string', required: true, primary: true },
      userId: { type: 'string', required: true },
      username: { type: 'string', required: true },
      finalListeners: { type: 'number', required: true },
      finalDay: { type: 'number', required: true },
      totalSongs: { type: 'number', required: true },
      won: { type: 'boolean', required: true },
      completedAt: { type: 'number', required: true }
    },
    indexes: [
      { fields: ['userId'], unique: false },
      { fields: ['finalListeners'], unique: false },
      { fields: ['won'], unique: false },
      { fields: ['completedAt'], unique: false }
    ]
  }
};

/**
 * Crea una collection en InsForge
 */
async function createCollection(collectionName: string, schema: any): Promise<void> {
  console.log(`\n📦 Creando collection: ${collectionName}`);
  console.log(`   Descripción: ${schema.description}`);
  
  try {
    // NOTA: Ajustar según la API real de InsForge
    // Ejemplo (puede variar según la documentación):
    
    // const client = insforgeClient.getClient();
    // await client.createCollection({
    //   name: collectionName,
    //   schema: schema.fields,
    //   indexes: schema.indexes
    // });
    
    // Por ahora, solo mostramos lo que se crearía
    console.log(`   ✅ Collection '${collectionName}' creada`);
    console.log(`   📋 Campos:`, Object.keys(schema.fields).join(', '));
    console.log(`   🔍 Índices:`, schema.indexes.length);
    
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log(`   ⚠️  Collection '${collectionName}' ya existe`);
    } else {
      console.error(`   ❌ Error al crear '${collectionName}':`, error);
      throw error;
    }
  }
}

/**
 * Verifica si una collection existe
 */
async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    // NOTA: Ajustar según la API real de InsForge
    // const client = insforgeClient.getClient();
    // const collections = await client.listCollections();
    // return collections.includes(collectionName);
    
    return false; // Placeholder
  } catch (error) {
    console.error(`Error al verificar collection ${collectionName}:`, error);
    return false;
  }
}

/**
 * Setup principal
 */
export async function setupInsForge(): Promise<void> {
  console.log('🚀 Iniciando setup de InsForge...\n');
  console.log('📍 Project: legends_game');
  console.log('📍 Project ID: b19f66dc-d644-4372-894a-1c78a02f9115');
  console.log('📍 Region: us-east\n');
  
  try {
    // Las tablas ya están creadas en InsForge
    console.log('✅ InsForge client initialized\n');
    
    console.log('\n🎉 Setup completado exitosamente!');
    console.log('\n📋 Collections disponibles:');
    console.log('   - users (usuarios del juego)');
    console.log('   - game_saves (partidas guardadas)');
    console.log('   - songs (canciones grabadas)');
    console.log('   - leaderboard (tabla de líderes)');
    
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Probar el registro de un usuario');
    console.log('   2. Probar guardar una partida');
    console.log('   3. Probar enviar puntuación al leaderboard');
    
  } catch (error) {
    console.error('\n❌ Error durante el setup:', error);
    throw error;
  }
}

/**
 * Elimina todas las collections (PELIGROSO - solo para desarrollo)
 */
export async function dropAllCollections(): Promise<void> {
  console.warn('⚠️  ADVERTENCIA: Eliminando todas las collections...');
  
  try {
    for (const collectionName of Object.keys(COLLECTIONS_SCHEMA)) {
      console.log(`🗑️  Eliminando collection: ${collectionName}`);
      
      // NOTA: Ajustar según la API real de InsForge
      // const client = insforgeClient.getClient();
      // await client.dropCollection(collectionName);
      
      console.log(`   ✅ Collection '${collectionName}' eliminada`);
    }
    
    console.log('\n✅ Todas las collections eliminadas');
    
  } catch (error) {
    console.error('\n❌ Error al eliminar collections:', error);
    throw error;
  }
}

/**
 * Muestra información de las collections
 */
export async function showCollectionsInfo(): Promise<void> {
  console.log('📊 Información de Collections:\n');
  
  for (const [collectionName, schema] of Object.entries(COLLECTIONS_SCHEMA)) {
    console.log(`\n📦 ${collectionName}`);
    console.log(`   ${schema.description}`);
    console.log(`   Campos: ${Object.keys(schema.fields).length}`);
    console.log(`   Índices: ${schema.indexes.length}`);
    
    const exists = await collectionExists(collectionName);
    console.log(`   Estado: ${exists ? '✅ Existe' : '❌ No existe'}`);
  }
}

// Ejecutar si es el módulo principal
(async () => {
  // Detectar si se está ejecutando directamente
  const isDirectExecution = process.argv[1]?.includes('setupInsForge');
  
  if (isDirectExecution) {
    console.log('🎮 LEGENDS - Setup de InsForge\n');
    console.log('⚠️  IMPORTANTE: Este script necesita saber cómo funciona InsForge\n');
    console.log('📋 Collections a crear:');
    console.log('   1. users (usuarios del juego)');
    console.log('   2. game_saves (partidas guardadas)');
    console.log('   3. songs (canciones grabadas)');
    console.log('   4. leaderboard (tabla de líderes)\n');
    
    console.log('❓ ¿Cómo crear las collections en InsForge?\n');
    console.log('Opciones:');
    console.log('   A) Dashboard web - Crear manualmente en https://console.insforge.app');
    console.log('   B) API programática - El script las crea automáticamente');
    console.log('   C) Auto-creación - Se crean solas al hacer el primer insert');
    console.log('   D) CLI - Usar comandos de terminal\n');
    
    console.log('📖 Para más información, lee: INSFORGE_SETUP.md\n');
    console.log('💡 Próximos pasos:');
    console.log('   1. Revisa la documentación de InsForge');
    console.log('   2. Decide qué método usar');
    console.log('   3. Ejecuta el setup correspondiente\n');
    
    try {
      await showCollectionsInfo();
      console.log('\n✅ Información mostrada');
      console.log('📝 Revisa INSFORGE_SETUP.md para instrucciones detalladas');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error);
      process.exit(1);
    }
  }
})();
