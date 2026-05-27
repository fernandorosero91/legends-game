/**
 * 🎮 LEGENDS: Badge Component
 * Componente de badge para etiquetas y estados
 */

import type { BadgeProps } from '@/types/ui';

const Badge = ({ variant = 'purple', children, className = '' }: BadgeProps) => {
  // Clases base
  const baseClasses = 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full border';

  // Clases por variante
  const variantClasses = {
    gold: 'bg-gold-500/20 text-gold-500 border-gold-500/30',
    green: 'bg-green-500/20 text-green-500 border-green-500/30',
    red: 'bg-red-500/20 text-red-500 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30',
  };

  // Combinar clases
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <span className={badgeClasses}>{children}</span>;
};

export default Badge;
