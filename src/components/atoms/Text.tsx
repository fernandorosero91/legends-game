/**
 * 🎮 LEGENDS: Text Component
 * Componente de texto tipográfico reutilizable
 */

import type { TextProps } from '@/types/ui';

const Text = ({ variant = 'body', children, className = '', as: Component = 'p' }: TextProps) => {
  // Clases por variante
  const variantClasses = {
    heading: 'font-bold tracking-tight text-gray-100',
    body: 'font-normal leading-relaxed text-gray-100',
    caption: 'text-sm text-gray-400',
    mono: 'font-mono text-gray-100 tabular-nums',
  };

  // Combinar clases
  const textClasses = `${variantClasses[variant]} ${className}`;

  return <Component className={textClasses}>{children}</Component>;
};

export default Text;
