/**
 * LEGENDS: RestaurantTimer — Countdown timer for the restaurant work shift.
 *
 * Behavior:
 * 1. Listens for the chef tutorial dialogue to close.
 * 2. Once dismissed, plays the alarm bell + restaurant soundtrack simultaneously.
 * 3. Displays a 3-minute countdown with animation.
 * 4. At 6 seconds remaining, plays the bell again as warning.
 * 5. When time is up: stops music, shows Chef Carlos "turno completado" dialogue,
 *    pays the player, redirects home, and sets a 10-minute cooldown.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';

// --- Cooldown helpers (persisted in localStorage) ---
const COOLDOWN_KEY = 'legends_restaurant_cooldown_until';

export function getRestaurantCooldownUntil(): number {
  const raw = localStorage.getItem(COOLDOWN_KEY);
  return raw ? Number(raw) : 0;
}

export function isRestaurantOnCooldown(): boolean {
  return Date.now() < getRestaurantCooldownUntil();
}

export function getRestaurantCooldownRemaining(): number {
  const until = getRestaurantCooldownUntil();
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function setRestaurantCooldown(minutes: number) {
  const until = Date.now() + minutes * 60 * 1000;
  localStorage.setItem(COOLDOWN_KEY, String(until));
}

// -------------------------------------------------

export function RestaurantTimer() {
  const dialogueActive = useUIStore((s) => s.dialogueActive);
  const currentDialogue = useUIStore((s) => s.currentDialogue);
  const showDialogue = useUIStore((s) => s.showDialogue);
  const setCurrentScene = useGameStore((s) => s.setCurrentScene);
  const addMoney = usePlayerStore((s) => s.addMoney);
  const addNotification = useUIStore((s) => s.addNotification);

  const [chefTutorialSeen, setChefTutorialSeen] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [waitingForPayDialogue, setWaitingForPayDialogue] = useState(false);

  const bellRef = useRef<Howl | null>(null);
  const musicRef = useRef<Howl | null>(null);
  const intervalRef = useRef<number | null>(null);
  const bellPlayedAt6 = useRef(false);

  // Detect when the chef-carlos-tutorial dialogue is the current one
  useEffect(() => {
    if (currentDialogue?.id === 'chef-carlos-tutorial') {
      setChefTutorialSeen(true);
    }
  }, [currentDialogue]);

  // When dialogue closes AFTER the tutorial was seen, start the timer
  useEffect(() => {
    if (chefTutorialSeen && !dialogueActive && !timerActive && !waitingForPayDialogue) {
      startTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chefTutorialSeen, dialogueActive]);

  // When player dismisses the pay dialogue, redirect home
  useEffect(() => {
    if (waitingForPayDialogue && !dialogueActive) {
      setWaitingForPayDialogue(false);
      // Redirect to apartment
      setCurrentScene('apartment' as any);
      addNotification('info', 'Volviste al apartamento. Vuelve a tomar otro turno en 10 minutos.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingForPayDialogue, dialogueActive]);

  const startTimer = useCallback(() => {
    setTimerActive(true);
    setSecondsLeft(180);
    bellPlayedAt6.current = false;

    // Play alarm bell
    bellRef.current = new Howl({
      src: ['/audio/restaurant/timbre_inicio.wav'],
      volume: 0.6,
    });
    bellRef.current.play();

    // Play restaurant soundtrack (loop)
    musicRef.current = new Howl({
      src: ['/audio/restaurant/resturant_game.wav'],
      volume: 0.35,
      loop: true,
    });
    musicRef.current.play();

    // Start countdown
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        // Play bell again at 6 seconds remaining
        if (next === 6 && !bellPlayedAt6.current) {
          bellPlayedAt6.current = true;
          const warningBell = new Howl({
            src: ['/audio/restaurant/timbre_inicio.wav'],
            volume: 0.7,
          });
          warningBell.play();
        }

        if (next <= 0) {
          // Time's up
          clearInterval(intervalRef.current!);
          musicRef.current?.stop();
          setTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeUp = () => {
    // Pay the player
    addMoney(400);

    // Set 10-minute cooldown
    setRestaurantCooldown(10);

    // Show Chef dialogue
    setWaitingForPayDialogue(true);
    showDialogue({
      id: 'chef-carlos-turno-completado',
      speaker: 'Chef Carlos',
      text:
        '¡Excelente trabajo, mesero! Has completado tu turno. ' +
        'Aquí tienes tu pago de $400 por las horas trabajadas. ' +
        '¡Descansa un poco y vuelve cuando estés listo para otro turno!',
      portrait: '/models/chef_image.png',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      bellRef.current?.stop();
      musicRef.current?.stop();
    };
  }, []);

  // Format seconds as MM:SS
  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Color transitions: green > yellow > red
  const getColor = () => {
    if (secondsLeft > 90) return 'text-green-400';
    if (secondsLeft > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBorderColor = () => {
    if (secondsLeft > 90) return 'border-green-500/60';
    if (secondsLeft > 30) return 'border-yellow-500/60';
    return 'border-red-500/60';
  };

  const getGlow = () => {
    if (secondsLeft > 90) return 'shadow-green-500/30';
    if (secondsLeft > 30) return 'shadow-yellow-500/30';
    return 'shadow-red-500/40';
  };

  return (
    <AnimatePresence>
      {timerActive && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`fixed top-19 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900/90 backdrop-blur-md border-2 ${getBorderColor()} shadow-lg ${getGlow()}`}
        >
          {/* Clock icon with pulse */}
          <motion.span
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="text-2xl"
          >
            ⏱️
          </motion.span>

          {/* Timer digits */}
          <motion.span
            key={secondsLeft}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`font-mono text-3xl font-bold tracking-widest ${getColor()} drop-shadow-md`}
          >
            {formatTime(secondsLeft)}
          </motion.span>

          {/* Pulse ring when time is low */}
          {secondsLeft <= 30 && (
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute inset-0 rounded-2xl border-2 border-red-500/50 pointer-events-none"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
