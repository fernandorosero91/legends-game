import { Suspense } from 'react';
import { Player } from '../components/game/Player';
import { CameraRig } from '../components/game/CameraRig';
import { InteractableZone } from '../components/game/InteractableZone';
import { RestaurantLevel1 } from '../components/game/RestaurantLevel1';
import { ChefNPC } from '../components/game/ChefNPC';
import { CustomerNPC } from '../components/game/CustomerNPC';
import { SeatMarker } from '../components/game/SeatMarker';
import { ReadyDishOnCounter } from '../components/game/ReadyDishOnCounter';
import { RestaurantCustomersManager } from '../components/game/RestaurantCustomersManager';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { useRestaurantStore } from '../store/restaurantStore';
import { RESTAURANT_SEATS } from '../data/restaurantConfig';

export function RestaurantScene() {
  const setCurrentScene = useGameStore(state => state.setCurrentScene);
  const currentDay = useGameStore(state => state.currentDay);
  const energy = usePlayerStore(state => state.energy);
  const addMoney = usePlayerStore(state => state.addMoney);
  const consumeEnergy = usePlayerStore(state => state.consumeEnergy);
  const addJobRecord = usePlayerStore(state => state.addJobRecord);
  const advanceTime = useGameStore(state => state.advanceTime);
  const addNotification = useUIStore(state => state.addNotification);
  const showDialogue = useUIStore(state => state.showDialogue);
  const queueDialogue = useUIStore(state => state.queueDialogue);
  const dialogueActive = useUIStore(state => state.dialogueActive);

  // Lista reactiva de clientes presentes en escena.
  const customers = useRestaurantStore(s => s.customers);

  const handleWork = () => {
    if (energy < 25) {
      addNotification('warning', 'No tienes suficiente energía para trabajar');
      return;
    }

    // Trabajar como mesero
    addMoney(400);
    consumeEnergy(25);
    advanceTime();
    addJobRecord({ jobId: 'mesero', dayCompleted: currentDay, moneyEarned: 400 });

    addNotification('success', '¡Trabajo completado! +$400');
  };

  const handleTalkToChef = () => {
    if (dialogueActive) return;

    const portrait = '/models/chef_image.png';

    showDialogue({
      id: 'chef-carlos-greet',
      speaker: 'Chef Carlos',
      text: '¡Bienvenido al restaurante, mesero! Antes de empezar tu turno, déjame explicarte cómo funciona esto.',
      portrait,
    });

    queueDialogue({
      id: 'chef-carlos-tutorial',
      speaker: 'Chef Carlos',
      text:
        'Cómo funciona el turno:\n' +
        '1. Los clientes entran por la puerta y esperan ahí.\n' +
        '2. Haz click en un cliente para seleccionarlo y luego click en una silla libre. El cliente irá y se sentará.\n' +
        '3. Cuando esté listo, levantará la mano y mostrará una burbuja con el plato que pidió.\n' +
        '4. Haz click en el cliente para tomar la orden y luego ven a verme para darme el pedido.\n' +
        '5. Yo tardaré 15 segundos en preparar el plato. Cuando esté listo, haz click sobre el plato para llevarlo al cliente.\n' +
        '6. El cliente comerá, se levantará y dejará tu propina sobre la mesa. ¡Recógela!\n\n' +
        'Cada cliente atendido te da $250. ¡Vamos a trabajar!',
      portrait,
    });
  };

  const handleExit = () => {
    setCurrentScene('apartment');
    addNotification('info', 'Volviste al apartamento');
  };

  return (
    <>
      <CameraRig />

      {/* 3D Environment — loaded from restaurant.json + GLB files */}
      <Suspense fallback={null}>
        <RestaurantLevel1 />
      </Suspense>

      {/* Manager de spawn de clientes (sin mesh) */}
      <RestaurantCustomersManager />

      {/* Chef NPC animado dentro del restaurante (detrás de la barra) */}
      <Suspense fallback={null}>
        <ChefNPC
          position={[2, 0.2, -4]}
          rotation={[0, Math.PI / 7, 0]}
          scale={1}
          name="Chef Carlos"
          onInteract={handleTalkToChef}
          labelOffset={[0, 2.4, 0]}
          nameOffset={[0, 2.8, 0]}
        />
      </Suspense>

      {/* Marcadores de sillas (sólo visibles con cliente seleccionado) */}
      {RESTAURANT_SEATS.map((seat) => (
        <SeatMarker key={seat.id} seat={seat} />
      ))}

      {/* Clientes activos */}
      <Suspense fallback={null}>
        {customers.map((c) => (
          <CustomerNPC key={c.id} id={c.id} />
        ))}
      </Suspense>

      {/* Plato listo en la barra del chef + countdown de cocina */}
      <Suspense fallback={null}>
        <ReadyDishOnCounter />
      </Suspense>

      {/* Estación de mesero (queda como atajo opcional) */}
      <InteractableZone
        position={[-3, 1.5, -7]}
        size={[2.5, 1.5, 1.5]}
        label="Trabajar como Mesero ($400)"
        icon="🍽️"
        onInteract={handleWork}
        tooltipOffset={[0, 2, 0]}
      />

      {/* Puerta de salida */}
      <InteractableZone
        position={[0, 1, 8]}
        size={[3, 2.5, 1]}
        label="Volver al Apartamento"
        icon="🚪"
        onInteract={handleExit}
      />

      {/* Jugador */}
      <Player position={[0, 0.4, 5]} />
    </>
  );
}
