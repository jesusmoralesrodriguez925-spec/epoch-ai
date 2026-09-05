import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { KodiLogo } from './KodiLogo';
import { User } from '../types';

interface DashboardCenterGreetingProps {
  chatSeed?: string | number;
  currentTheme?: 'dark' | 'light';
  user?: User;
}

export const DashboardCenterGreeting: React.FC<DashboardCenterGreetingProps> = ({ 
  chatSeed,
  currentTheme = 'dark',
  user,
}) => {
  const isLight = currentTheme === 'light';

  const isCreator = Boolean(
    user?.email?.toLowerCase().trim() === 'jesusmoralesrodriguez925@gmail.com' ||
    (user?.displayName && /jes[uú]s\s+morales(\s+rodr[ií]guez)?/i.test(user.displayName.trim()))
  );

  const rawName = user?.displayName?.trim();
  const userName = isCreator ? 'Jesús' : (rawName && rawName !== 'Usuario' ? rawName : '');

  const greeting = useMemo(() => {
    const GREETINGS = userName 
      ? [
          `Hola ${userName}, ¿en qué podemos trabajar hoy?`,
          `Hola ${userName}, ¿qué desafío resolveremos hoy?`,
          `Hola ${userName}, estoy listo para asistirte`,
          `Hola ${userName}, pregúntame lo que desees saber`,
        ]
      : [
          'Estoy listo para resolver tus dudas',
          '¿En qué podemos trabajar hoy?',
          'Listo para responder y ayudarte en lo que necesites',
          '¿Qué desafío resolveremos hoy?',
          'Tu asistente inteligente está listo',
          'Pregúntame lo que desees saber',
        ];

    if (chatSeed !== undefined) {
      const num = typeof chatSeed === 'string' 
        ? chatSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : chatSeed;
      return GREETINGS[Math.abs(num) % GREETINGS.length];
    }
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  }, [chatSeed, userName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 select-none"
    >
      {/* Central Official KODI Hexagon Logo */}
      <div className="mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
        <KodiLogo size="lg" showText={false} />
      </div>

      {/* Dynamic Main Greeting */}
      <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight max-w-2xl leading-snug ${
        isLight ? 'text-zinc-900' : 'text-white'
      }`}>
        {greeting}
      </h1>
    </motion.div>
  );
};
