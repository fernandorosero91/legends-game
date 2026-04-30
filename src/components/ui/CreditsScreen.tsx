/**
 * 🎮 LEGENDS: Credits Screen
 * Pantalla de créditos del juego
 * Autor: Kiro AI Assistant
 */

import { motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { Icon } from '../atoms';

export function CreditsScreen() {
  const setScreen = useUIStore((s) => s.setScreen);

  const handleBack = () => {
    setScreen('main_menu');
  };

  const credits = [
    {
      title: '🎨 UI/UX Design & Frontend',
      team: [
        { name: 'Nicol', role: 'Frontend Lead', contributions: '42 componentes UI, Sistema de diseño, Testing' },
      ],
    },
    {
      title: '📖 Narrative Design & Content',
      team: [
        { name: 'Yeraldin', role: 'Narrative Designer', contributions: '9 personajes, 50+ diálogos, 60+ eventos, 6 beats musicales' },
      ],
    },
    {
      title: '⚙️ Systems & Game Logic',
      team: [
        { name: 'Felipe', role: 'Systems Developer', contributions: '13 sistemas de juego, 7 stores, 8 hooks, Integración 3D' },
      ],
    },
    {
      title: '🔗 Backend & Integration',
      team: [
        { name: 'Fernando', role: 'Backend Developer', contributions: 'InsForge integration, Auth, Save/Load, Leaderboard' },
      ],
    },
  ];

  const technologies = [
    { name: 'React 19', icon: '⚛️' },
    { name: 'TypeScript 6', icon: '📘' },
    { name: 'Three.js', icon: '🎮' },
    { name: 'Tailwind CSS 4', icon: '🎨' },
    { name: 'Zustand', icon: '🐻' },
    { name: 'Framer Motion', icon: '✨' },
    { name: 'Vite', icon: '⚡' },
    { name: 'InsForge', icon: '🔥' },
  ];

  const specialThanks = [
    'A todos los que creyeron en este proyecto',
    'A la comunidad de desarrolladores indie',
    'A los músicos que inspiran Purple City',
    'A ti, por jugar LEGENDS',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-purple-900 to-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 p-6 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-lg transition-colors"
          >
            <Icon name="arrow-left" size="sm" />
            <span className="text-white font-semibold">Volver</span>
          </button>
          <h1 className="text-3xl font-black text-white tracking-wider">
            🎬 CRÉDITOS
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12 space-y-12">
        {/* Game Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
            LEGENDS
          </h2>
          <p className="text-2xl text-cyan-400 font-semibold">
            The Music Career Simulator
          </p>
          <p className="text-purple-300">
            "Si algo vale la pena, vale la pena la lucha."
          </p>
        </motion.div>

        {/* Development Team */}
        {credits.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-2xl font-bold text-white">{section.title}</h3>
            {section.team.map((member) => (
              <div key={member.name} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{member.name}</p>
                    <p className="text-cyan-400 font-semibold">{member.role}</p>
                  </div>
                </div>
                <p className="text-purple-200 text-sm pl-15">
                  {member.contributions}
                </p>
              </div>
            ))}
          </motion.div>
        ))}

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-2xl font-bold text-white">🛠️ Tecnologías Utilizadas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="bg-purple-800/30 rounded-lg p-3 text-center space-y-1"
              >
                <div className="text-3xl">{tech.icon}</div>
                <p className="text-white font-semibold text-sm">{tech.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Special Thanks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-2xl font-bold text-white">💜 Agradecimientos Especiales</h3>
          <ul className="space-y-2">
            {specialThanks.map((thanks, idx) => (
              <li key={idx} className="text-purple-200 flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>{thanks}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Game Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2 py-8"
        >
          <p className="text-purple-300 text-sm">
            © 2026 LEGENDS Team. Todos los derechos reservados.
          </p>
          <p className="text-purple-400 text-xs">
            Desarrollado con ❤️ en Purple City
          </p>
          <p className="text-purple-400 text-xs font-mono">
            v1.0.0 · Build 2026.04.26
          </p>
        </motion.div>

        {/* Easter Egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-purple-500 text-xs italic">
            "Keep grinding, keep creating, keep being legendary." 🎤✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default CreditsScreen;
