/**
 * 🎮 LEGENDS: Jobs Data
 * Definición completa de trabajos online y físicos
 * Autor: Yeraldin (Narrative Designer)
 */

import type { Job } from '../types/jobs';

// ===== TRABAJOS ONLINE (DESDE EL APARTAMENTO) =====

export const ONLINE_JOBS: Job[] = [
  {
    id: 'email_writing',
    name: 'Redacción de Correos',
    location: 'online',
    type: 'online',
    description: 'Redacta correos profesionales para empresas remotas',
    pay: 250,
    energyCost: 12,
    turnsCost: 1,
    levelRequired: 2,
    icon: '/icons/email.svg',
    npcName: undefined,
    npcDialogue: undefined,
  },
  {
    id: 'data_entry',
    name: 'Fichas Técnicas',
    location: 'online',
    type: 'online',
    description: 'Ingresa datos y crea fichas técnicas para bases de datos',
    pay: 400,
    energyCost: 18,
    turnsCost: 1,
    levelRequired: 2,
    icon: '/icons/data.svg',
    npcName: undefined,
    npcDialogue: undefined,
  },
  {
    id: 'logo_design',
    name: 'Diseño de Logos',
    location: 'online',
    type: 'online',
    description: 'Diseña logos simples para pequeños negocios',
    pay: 600,
    energyCost: 22,
    turnsCost: 2,
    levelRequired: 3,
    icon: '/icons/design.svg',
    npcName: undefined,
    npcDialogue: undefined,
  },
  {
    id: 'video_editing',
    name: 'Edición de Video',
    location: 'online',
    type: 'online',
    description: 'Edita videos cortos para redes sociales',
    pay: 850,
    energyCost: 28,
    turnsCost: 2,
    levelRequired: 4,
    icon: '/icons/video.svg',
    npcName: undefined,
    npcDialogue: undefined,
  },
  {
    id: 'web_dev',
    name: 'Desarrollo Web Freelance',
    location: 'online',
    type: 'online',
    description: 'Desarrolla páginas web simples para clientes',
    pay: 1200,
    energyCost: 35,
    turnsCost: 3,
    levelRequired: 5,
    icon: '/icons/code.svg',
    npcName: undefined,
    npcDialogue: undefined,
  },
];

// ===== TRABAJOS FÍSICOS (EN PURPLE CITY) =====

export const PHYSICAL_JOBS: Job[] = [
  {
    id: 'barista',
    name: 'Barista',
    location: 'cafe',
    type: 'physical',
    description: 'Prepara café y atiende clientes en Café Purple Beans',
    pay: 350,
    energyCost: 18,
    turnsCost: 1,
    levelRequired: 2,
    icon: '/icons/coffee_job.svg',
    npcName: 'Marco',
    npcDialogue: '¿Buscas trabajo? Necesito un barista para el turno. El pago es $350 y te tomará un turno.',
  },
  {
    id: 'cashier',
    name: 'Cajero',
    location: 'store',
    type: 'physical',
    description: 'Atiende la caja en Almacén StreetWear',
    pay: 400,
    energyCost: 18,
    turnsCost: 1,
    levelRequired: 2,
    icon: '/icons/cashier.svg',
    npcName: 'Daniela',
    npcDialogue: 'Hola, ¿vienes por el trabajo de cajero? Paga $400 por turno.',
  },
  {
    id: 'waiter',
    name: 'Mesero',
    location: 'restaurant',
    type: 'physical',
    description: 'Sirve mesas en Restaurante La Esquina',
    pay: 500,
    energyCost: 22,
    turnsCost: 1,
    levelRequired: 3,
    icon: '/icons/waiter.svg',
    npcName: 'Carlos',
    npcDialogue: 'Necesito un mesero para el turno de hoy. $500 y propinas.',
  },
  {
    id: 'delivery',
    name: 'Repartidor',
    location: 'delivery',
    type: 'physical',
    description: 'Entrega paquetes por Purple City para Delivery Express',
    pay: 650,
    energyCost: 26,
    turnsCost: 2,
    levelRequired: 3,
    icon: '/icons/delivery.svg',
    npcName: 'Luis',
    npcDialogue: 'Tengo varias entregas hoy. Te pago $650 si las haces todas.',
  },
  {
    id: 'bar_dj',
    name: 'DJ en Bar',
    location: 'bar',
    type: 'physical',
    description: 'Pon música en Bar Neon Nights',
    pay: 750,
    energyCost: 22,
    turnsCost: 2,
    levelRequired: 4,
    icon: '/icons/dj.svg',
    npcName: 'Sofía',
    npcDialogue: 'Oye, ¿sabes poner música? Necesito un DJ para esta noche. $750.',
  },
  {
    id: 'music_teacher',
    name: 'Instructor de Música',
    location: 'academy',
    type: 'physical',
    description: 'Enseña fundamentos de música en Academia SoundWave',
    pay: 950,
    energyCost: 18,
    turnsCost: 2,
    levelRequired: 5,
    icon: '/icons/teacher.svg',
    npcName: 'Profesor Martínez',
    npcDialogue: 'Busco un instructor de música para clases particulares. $950 por sesión.',
  },
];

// ===== EXPORTAR TODOS LOS TRABAJOS =====

export const ALL_JOBS: Job[] = [
  ...ONLINE_JOBS,
  ...PHYSICAL_JOBS,
];

// ===== HELPER FUNCTIONS =====

export const getJobById = (id: string): Job | undefined => {
  return ALL_JOBS.find(job => job.id === id);
};

export const getOnlineJobs = (currentLevel: number): Job[] => {
  return ONLINE_JOBS.filter(job => job.levelRequired <= currentLevel);
};

export const getPhysicalJobs = (currentLevel: number): Job[] => {
  return PHYSICAL_JOBS.filter(job => job.levelRequired <= currentLevel);
};

export const getAvailableJobs = (currentLevel: number): Job[] => {
  return ALL_JOBS.filter(job => job.levelRequired <= currentLevel);
};

export const getJobsByLocation = (location: Job['location']): Job[] => {
  return ALL_JOBS.filter(job => job.location === location);
};

export const canDoJob = (jobId: string, playerEnergy: number, currentLevel: number): boolean => {
  const job = getJobById(jobId);
  if (!job) return false;
  
  return (
    playerEnergy >= job.energyCost &&
    currentLevel >= job.levelRequired
  );
};

export const getJobPay = (jobId: string): number => {
  const job = getJobById(jobId);
  return job?.pay || 0;
};

export const getJobEnergyCost = (jobId: string): number => {
  const job = getJobById(jobId);
  return job?.energyCost || 0;
};

export const getJobTurnsCost = (jobId: string): number => {
  const job = getJobById(jobId);
  return job?.turnsCost || 0;
};

export const isOnlineJob = (jobId: string): boolean => {
  return ONLINE_JOBS.some(job => job.id === jobId);
};

export const isPhysicalJob = (jobId: string): boolean => {
  return PHYSICAL_JOBS.some(job => job.id === jobId);
};

// ===== LOCACIONES DE TRABAJOS FÍSICOS =====

export interface JobLocation {
  id: Job['location'];
  name: string;
  address: string;
  description: string;
  icon: string;
  position?: { x: number; y: number; z: number };
}

export const JOB_LOCATIONS: JobLocation[] = [
  {
    id: 'cafe',
    name: 'Café Purple Beans',
    address: 'Calle Principal #123',
    description: 'Café acogedor en el corazón de Purple City',
    icon: '/icons/cafe_location.svg',
    position: { x: 10, y: 0, z: 5 },
  },
  {
    id: 'store',
    name: 'Almacén StreetWear',
    address: 'Avenida Urbana #456',
    description: 'Tienda de ropa urbana y streetwear',
    icon: '/icons/store_location.svg',
    position: { x: -8, y: 0, z: 12 },
  },
  {
    id: 'restaurant',
    name: 'Restaurante La Esquina',
    address: 'Esquina de la Calle 5ta',
    description: 'Restaurante familiar con comida casera',
    icon: '/icons/restaurant_location.svg',
    position: { x: 15, y: 0, z: -10 },
  },
  {
    id: 'delivery',
    name: 'Delivery Express',
    address: 'Zona Industrial #789',
    description: 'Empresa de entregas rápidas',
    icon: '/icons/delivery_location.svg',
    position: { x: -15, y: 0, z: -5 },
  },
  {
    id: 'bar',
    name: 'Bar Neon Nights',
    address: 'Distrito Nocturno #321',
    description: 'Bar con música en vivo y ambiente nocturno',
    icon: '/icons/bar_location.svg',
    position: { x: 20, y: 0, z: 8 },
  },
  {
    id: 'academy',
    name: 'Academia SoundWave',
    address: 'Centro Educativo #654',
    description: 'Academia de música y producción',
    icon: '/icons/academy_location.svg',
    position: { x: -12, y: 0, z: 18 },
  },
];

export const getLocationById = (id: Job['location']): JobLocation | undefined => {
  return JOB_LOCATIONS.find(loc => loc.id === id);
};

export const getLocationName = (id: Job['location']): string => {
  const location = getLocationById(id);
  return location?.name || id;
};

// ===== DIÁLOGOS DE TRABAJOS =====

export interface JobDialogue {
  jobId: string;
  greet: string;
  accept: string;
  decline: string;
  working: string;
  complete: string;
  tired: string;
  reject: string;
}

export const JOB_DIALOGUES: JobDialogue[] = [
  {
    jobId: 'barista',
    greet: '¿Buscas trabajo? Necesito un barista para el turno. El pago es $350 y te tomará un turno.',
    accept: 'Perfecto. Ponte el delantal y comencemos.',
    decline: 'No hay problema. Vuelve cuando quieras.',
    working: 'Buen ritmo, sigue así.',
    complete: 'Buen trabajo hoy. Aquí está tu pago.',
    tired: 'Se te ve cansado, ¿estás bien para trabajar?',
    reject: 'Vuelve cuando estés descansado, no puedes trabajar así.',
  },
  {
    jobId: 'cashier',
    greet: 'Hola, ¿vienes por el trabajo de cajero? Paga $400 por turno.',
    accept: 'Genial. La caja es tuya.',
    decline: 'Está bien. Nos vemos.',
    working: 'Atiende bien a los clientes, por favor.',
    complete: 'Perfecto. Te veo mañana si quieres más turnos.',
    tired: 'Oye, pareces agotado. Cuídate.',
    reject: 'No puedo tenerte así en caja. Descansa primero.',
  },
  {
    jobId: 'waiter',
    greet: 'Necesito un mesero para el turno de hoy. $500 y propinas.',
    accept: '¡Excelente! Toma este delantal.',
    decline: 'Bueno, si cambias de opinión, aquí estaré.',
    working: 'Mesa 5 necesita atención.',
    complete: 'Buen servicio. Aquí está tu pago más las propinas.',
    tired: 'Oye, ¿estás bien? Te ves cansado.',
    reject: 'Mejor descansa. No puedes atender mesas así.',
  },
  {
    jobId: 'delivery',
    greet: 'Tengo varias entregas hoy. Te pago $650 si las haces todas.',
    accept: 'Perfecto. Aquí está la lista de direcciones.',
    decline: 'Ok, no hay problema.',
    working: 'Siguiente entrega: Calle 8va #234.',
    complete: 'Todas las entregas completadas. Buen trabajo.',
    tired: 'Oye, ¿puedes manejar esto? Te ves cansado.',
    reject: 'No puedes hacer entregas así. Descansa primero.',
  },
  {
    jobId: 'bar_dj',
    greet: 'Oye, ¿sabes poner música? Necesito un DJ para esta noche. $750.',
    accept: '¡Genial! La cabina es tuya.',
    decline: 'Ok, buscaré a alguien más.',
    working: 'Esa canción está funcionando bien.',
    complete: 'Buena sesión. La gente bailó toda la noche.',
    tired: 'Oye, ¿estás bien para esto?',
    reject: 'No puedes estar en la cabina así. Descansa.',
  },
  {
    jobId: 'music_teacher',
    greet: 'Busco un instructor de música para clases particulares. $950 por sesión.',
    accept: 'Excelente. Los estudiantes te esperan.',
    decline: 'Entiendo. Gracias de todas formas.',
    working: 'Los estudiantes están aprendiendo mucho.',
    complete: 'Excelente clase. Aquí está tu pago.',
    tired: 'Profesor, ¿está bien? Se ve cansado.',
    reject: 'No puede dar clases en ese estado. Descanse.',
  },
];

export const getJobDialogue = (jobId: string): JobDialogue | undefined => {
  return JOB_DIALOGUES.find(dialogue => dialogue.jobId === jobId);
};

// ===== ESTADÍSTICAS DE TRABAJOS =====

export interface JobStats {
  totalJobsCompleted: number;
  totalMoneyEarned: number;
  onlineJobsCompleted: number;
  physicalJobsCompleted: number;
  favoriteJob?: string;
  mostProfitableJob?: string;
}

export const calculateJobStats = (jobHistory: Array<{ jobId: string; moneyEarned: number }>): JobStats => {
  const stats: JobStats = {
    totalJobsCompleted: jobHistory.length,
    totalMoneyEarned: jobHistory.reduce((sum, record) => sum + record.moneyEarned, 0),
    onlineJobsCompleted: jobHistory.filter(record => isOnlineJob(record.jobId)).length,
    physicalJobsCompleted: jobHistory.filter(record => isPhysicalJob(record.jobId)).length,
  };

  // Calcular trabajo favorito (más completado)
  const jobCounts = jobHistory.reduce((acc, record) => {
    acc[record.jobId] = (acc[record.jobId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteJobEntry = Object.entries(jobCounts).sort((a, b) => b[1] - a[1])[0];
  stats.favoriteJob = favoriteJobEntry?.[0];

  // Calcular trabajo más rentable (más dinero ganado en total)
  const jobEarnings = jobHistory.reduce((acc, record) => {
    acc[record.jobId] = (acc[record.jobId] || 0) + record.moneyEarned;
    return acc;
  }, {} as Record<string, number>);

  const mostProfitableEntry = Object.entries(jobEarnings).sort((a, b) => b[1] - a[1])[0];
  stats.mostProfitableJob = mostProfitableEntry?.[0];

  return stats;
};
