/**
 * 🎮 LEGENDS: Dialogues Data
 * Todos los diálogos del juego organizados por actos
 * Autor: Yeraldin (Narrative Designer)
 */

import type { Dialogue } from '../types/dialogue';

// ===== ACTO I: EL COMIENZO (DÍAS 1-5 / NIVEL 1) =====

export const ACT1_DIALOGUES: Dialogue[] = [
  // DÍA 1 - MAÑANA
  {
    id: 'day1_morning_player',
    speaker: 'player',
    text: 'Esto es. Es ahora o nunca.',
    triggerType: 'scene',
  },
  {
    id: 'day1_dj_sonic_intro',
    speaker: 'dj_sonic',
    text: '¿Oye, qué tal? Escuché que querías hacer música. Tengo algunos beats que podrían funcionarte. ¿Qué dices? Te puedo enseñar cómo funciona esto.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
    nextDialogueId: 'day1_player_response',
  },
  {
    id: 'day1_player_response',
    speaker: 'player',
    text: 'Sí, estoy listo. Necesito hacer que esto funcione.',
    triggerType: 'scene',
  },

  // DÍA 1 - TARDE (PRIMERA GRABACIÓN - TUTORIAL MINIJUEGO)
  {
    id: 'day1_rhythm_tutorial',
    speaker: 'dj_sonic',
    text: 'Bien, hermano. Aquí está el beat. Cuando veas los cuadros caer, presiona A, S, D, F al ritmo. Cuantos menos errores, mejor la calidad de tu canción. ¿Listo?',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
  },
  {
    id: 'day1_player_ready',
    speaker: 'player',
    text: 'Creo que sí. Aquí voy.',
    triggerType: 'scene',
  },
  {
    id: 'day1_after_record',
    speaker: 'dj_sonic',
    text: 'Bien hecho. Eso fue un comienzo sólido. No es perfecto, pero tiene potencial. Sigue practicando.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
  },

  // DÍA 1 - ATARDECER (EL DE LA RENTA - PRIMERA APARICIÓN)
  {
    id: 'day1_rent_arrive',
    speaker: 'rent_collector',
    text: '¡Hola, artista! Llegó la hora del pago. Son $1,000. Espero que tengas esto la próxima renta, ¿eh?',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
  },
  {
    id: 'day1_player_pay',
    speaker: 'player',
    text: 'Sí, claro. Aquí está.',
    triggerType: 'scene',
  },
  {
    id: 'day1_rent_farewell',
    speaker: 'rent_collector',
    text: 'Bien. Nos vemos mañana. Y oye... que la música sea buena, porque si no, al menos que el dinero sea seguro, ¿entiendes?',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
  },

  // DÍA 5 - NOCHE (500 OYENTES - LUNA APARECE)
  {
    id: 'day5_luna_first',
    speaker: 'luna',
    text: '¡Esto es increíble! ¿Cuándo subes más? Necesito más de esto en mi vida. 💜',
    portrait: '/portraits/luna.png',
    triggerType: 'soundcloud_comment',
  },
  {
    id: 'day5_player_luna',
    speaker: 'player',
    text: 'Wow. Alguien realmente lo disfrutó. Tengo que seguir.',
    triggerType: 'scene',
  },
];

// ===== ACTO II: LA LUCHA (DÍAS 6-20 / NIVELES 2 Y 3) =====

export const ACT2_DIALOGUES: Dialogue[] = [
  // DÍA 6 - DESBLOQUEO TRABAJOS
  {
    id: 'day6_jobs_unlock',
    speaker: 'dj_sonic',
    text: 'Necesitas diversificar. Prueba con trabajos online mientras construyes tu audiencia. No es glamoroso, pero te mantiene en el juego.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
  },

  // DÍAS 8-10 - EL CRÍTICO (SI CALIDAD < 40%)
  {
    id: 'critic_first',
    speaker: 'the_critic',
    text: 'Este tipo de música daña la mente, no es buena para los jóvenes. ¿Por qué la música es tan soez?',
    portrait: '/portraits/critic.png',
    triggerType: 'text_message',
    effects: [{ type: 'reputation', value: -5 }],
  },
  {
    id: 'player_critic_response',
    speaker: 'player',
    text: 'No todos van a entenderlo. Tengo que seguir mejorando.',
    triggerType: 'scene',
  },

  // DÍA 13 - PUNTO DE QUIEBRE (NO PUEDE PAGAR RENTA)
  {
    id: 'day13_rent_crisis',
    speaker: 'rent_collector',
    text: '¿Esto es todo lo que tienes? No me hagas volver con abogados, artista. Esto es serio.',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
    effects: [{ type: 'reputation', value: -10 }],
  },
  {
    id: 'day13_player_crisis',
    speaker: 'player',
    text: 'Lo siento, te pagaré completo mañana. Lo prometo.',
    triggerType: 'scene',
  },
  {
    id: 'day13_dj_support',
    speaker: 'dj_sonic',
    text: 'Hermano, vi que las cosas se pusieron difíciles. Todos pasamos por esto. La diferencia entre los que lo logran y los que no es que los que lo logran no se rinden. Tú tienes talento. Sigue adelante.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
    effects: [{ type: 'energy', value: 10 }],
  },

  // DÍA 15 - DESBLOQUEO TIENDA
  {
    id: 'day15_shop_unlock',
    speaker: 'shop_vendor',
    text: '¡Bienvenido a Purple Sound Shop! Aquí encontrarás todo lo que necesitas para sonar como un profesional. Echa un vistazo.',
    portrait: '/portraits/vendor.png',
    triggerType: 'scene',
  },

  // DIÁLOGOS DEL CAFÉ (NPC MARCO)
  {
    id: 'cafe_greet',
    speaker: 'cafe_boss',
    text: '¿Buscas trabajo? Necesito un barista para el turno. El pago es $300 y te tomará un turno.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
    options: [
      { id: 'accept', text: 'Acepto el trabajo', nextDialogueId: 'cafe_accept' },
      { id: 'decline', text: 'Ahora no, gracias', nextDialogueId: 'cafe_decline' },
    ],
  },
  {
    id: 'cafe_accept',
    speaker: 'cafe_boss',
    text: 'Perfecto. Ponte el delantal y comencemos.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'cafe_decline',
    speaker: 'cafe_boss',
    text: 'No hay problema. Vuelve cuando quieras.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'cafe_working',
    speaker: 'cafe_boss',
    text: 'Buen ritmo, sigue así.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'cafe_complete',
    speaker: 'cafe_boss',
    text: 'Buen trabajo hoy. Aquí está tu pago.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
    effects: [{ type: 'money', value: 300 }],
  },
  {
    id: 'cafe_tired',
    speaker: 'cafe_boss',
    text: 'Se te ve cansado, ¿estás bien para trabajar?',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'cafe_reject',
    speaker: 'cafe_boss',
    text: 'Vuelve cuando estés descansado, no puedes trabajar así.',
    portrait: '/portraits/cafe_boss.png',
    triggerType: 'scene',
  },

  // DIÁLOGOS DEL ALMACÉN (NPC DANIELA)
  {
    id: 'store_greet',
    speaker: 'store_boss',
    text: 'Hola, ¿vienes por el trabajo de cajero? Paga $350 por turno.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
    options: [
      { id: 'accept', text: 'Sí, acepto', nextDialogueId: 'store_accept' },
      { id: 'decline', text: 'No, gracias', nextDialogueId: 'store_decline' },
    ],
  },
  {
    id: 'store_accept',
    speaker: 'store_boss',
    text: 'Genial. La caja es tuya.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'store_decline',
    speaker: 'store_boss',
    text: 'Está bien. Nos vemos.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'store_working',
    speaker: 'store_boss',
    text: 'Atiende bien a los clientes, por favor.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'store_complete',
    speaker: 'store_boss',
    text: 'Perfecto. Te veo mañana si quieres más turnos.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
    effects: [{ type: 'money', value: 350 }],
  },
  {
    id: 'store_tired',
    speaker: 'store_boss',
    text: 'Oye, pareces agotado. Cuídate.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
  },
  {
    id: 'store_reject',
    speaker: 'store_boss',
    text: 'No puedo tenerte así en caja. Descansa primero.',
    portrait: '/portraits/store_boss.png',
    triggerType: 'scene',
  },
];

// ===== ACTO III: LA ASCENSIÓN (DÍAS 21-45 / NIVELES 4, 5 Y 6) =====

export const ACT3_DIALOGUES: Dialogue[] = [
  // DÍA 21 - 1,000 OYENTES
  {
    id: 'day21_milestone',
    speaker: 'dj_sonic',
    text: '¡Lo sabía! Estás en el camino correcto. Mil personas escuchando tu música. ¿Recuerdas el Día 1? Esto lo construiste tú.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
    effects: [{ type: 'reputation', value: 5 }],
  },
  {
    id: 'day21_player',
    speaker: 'player',
    text: 'Mil oyentes... No puedo creerlo. Esto es real.',
    triggerType: 'scene',
  },

  // DÍA 28 - MENSAJE DE MAMÁ
  {
    id: 'day28_mom',
    speaker: 'mom',
    text: 'Vi que tu música está en SoundCloud. Estoy tan orgullosa de ti. Sé que esto es difícil, pero veo cuánto lo amas. Sigue adelante, mi amor. ❤️',
    portrait: '/portraits/mom.png',
    triggerType: 'text_message',
    effects: [{ type: 'energy', value: 20 }],
  },
  {
    id: 'day28_player',
    speaker: 'player',
    text: 'Gracias, mamá. Esto es por ti también.',
    triggerType: 'scene',
  },

  // DÍA 30 - 5,000 OYENTES - EL DE LA RENTA CAMBIA
  {
    id: 'day30_rent_change',
    speaker: 'rent_collector',
    text: 'Veo que las cosas te van bien. Sigue así. Aquí está tu recibo.',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
  },
  {
    id: 'day30_player',
    speaker: 'player',
    text: '¿Eso fue... un cumplido?',
    triggerType: 'scene',
  },

  // DÍA 35 - EL CRÍTICO CAMBIA
  {
    id: 'day35_critic_change',
    speaker: 'the_critic',
    text: 'Finalmente estás mejorando. Esto tiene potencial real. Sigue así.',
    portrait: '/portraits/critic.png',
    triggerType: 'text_message',
    effects: [{ type: 'reputation', value: 10 }],
  },

  // DÍA 40 - LUNA COMUNIDAD
  {
    id: 'day40_luna_community',
    speaker: 'luna',
    text: '¡Somos más de 7,000 ahora! Esta comunidad es increíble. Gracias por la música. 🎵',
    portrait: '/portraits/luna.png',
    triggerType: 'soundcloud_comment',
  },

  // DÍA 45 - VICTORIA - 10,000 OYENTES
  {
    id: 'victory_dj_1',
    speaker: 'dj_sonic',
    text: 'Bienvenido al siguiente nivel. Mira esto: diez mil oyentes. ¿Sabes qué significa eso? Significa que la gente realmente se conecta con tu música. Significa que tienes algo que decir.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
    nextDialogueId: 'victory_player',
  },
  {
    id: 'victory_player',
    speaker: 'player',
    text: 'No puedo creer que estoy aquí. Lo logré.',
    triggerType: 'scene',
    nextDialogueId: 'victory_dj_2',
  },
  {
    id: 'victory_dj_2',
    speaker: 'dj_sonic',
    text: 'Créelo. Lo hiciste. Ahora, la verdadera carrera comienza. ¿Qué sigue?',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
  },
  {
    id: 'victory_rent_final',
    speaker: 'rent_collector',
    text: 'Felicidades, artista. Sabía que lo lograrías. Ahora págame la renta. *sonríe*',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
  },
];

// ===== DIÁLOGOS ESPECIALES =====

export const SPECIAL_DIALOGUES: Dialogue[] = [
  // GAME OVER - NO PAGAR RENTA 3 DÍAS
  {
    id: 'gameover_rent',
    speaker: 'rent_collector',
    text: 'Lo siento, artista. Te di oportunidades. Ahora tengo que llamar a los abogados.',
    portrait: '/portraits/rent_collector.png',
    triggerType: 'auto_evening',
  },

  // PRIMERA MASTERPIECE
  {
    id: 'first_masterpiece',
    speaker: 'dj_sonic',
    text: '¡Eso fue perfecto! Esa canción es una obra maestra. Así se hace.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
    effects: [{ type: 'reputation', value: 15 }],
  },

  // PRIMERA COLABORACIÓN
  {
    id: 'first_collab',
    speaker: 'dj_sonic',
    text: 'Las colaboraciones son clave en esta industria. Bien hecho.',
    portrait: '/portraits/dj_sonic.png',
    triggerType: 'text_message',
  },

  // COMPRA PRIMER EQUIPO
  {
    id: 'first_equipment',
    speaker: 'shop_vendor',
    text: 'Excelente elección. Esto mejorará tu sonido significativamente.',
    portrait: '/portraits/vendor.png',
    triggerType: 'scene',
  },
];

// ===== EXPORTAR TODOS LOS DIÁLOGOS =====

export const ALL_DIALOGUES: Dialogue[] = [
  ...ACT1_DIALOGUES,
  ...ACT2_DIALOGUES,
  ...ACT3_DIALOGUES,
  ...SPECIAL_DIALOGUES,
];

// ===== HELPER FUNCTIONS =====

export const getDialogueById = (id: string): Dialogue | undefined => {
  return ALL_DIALOGUES.find(dialogue => dialogue.id === id);
};

export const getDialoguesBySpeaker = (speaker: string): Dialogue[] => {
  return ALL_DIALOGUES.filter(dialogue => dialogue.speaker === speaker);
};

export const getDialoguesByAct = (act: 1 | 2 | 3): Dialogue[] => {
  switch (act) {
    case 1:
      return ACT1_DIALOGUES;
    case 2:
      return ACT2_DIALOGUES;
    case 3:
      return ACT3_DIALOGUES;
    default:
      return [];
  }
};
