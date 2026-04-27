/**
 * 🎮 LEGENDS: ResourceBar Component
 * Componente de barra de recursos (dinero, energía, hambre, oyentes, reputación)
 */

import type { ResourceBarProps } from '@/types/ui';
import { Icon, ProgressBar } from '@/components/atoms';

const ResourceBar = ({
  icon,
  label,
  value,
  max = 100,
  color = 'green',
  showBar = true,
  showPercent = false,
  className = '',
}: ResourceBarProps) => {
  // Formatear valor según el tipo
  const formatValue = (val: number) => {
    // Si es dinero (icon === 'money'), formatear con $ y separador de miles
    if (icon === 'money') {
      return `$${val.toLocaleString('en-US')}`;
    }
    // Si es oyentes (icon === 'listeners'), formatear con separador de miles
    if (icon === 'listeners') {
      return val.toLocaleString('en-US');
    }
    // Para otros recursos, mostrar el valor directo
    return val;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm ${className}`}>
      {/* Icono del recurso */}
      <Icon name={icon} size="sm" className={getIconColor(icon)} />

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Label y valor */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-gray-400 truncate">{label}</span>
          <span className={`text-sm font-semibold tabular-nums ${getValueColor(icon)}`}>
            {formatValue(value)}
          </span>
        </div>

        {/* Barra de progreso (solo si showBar es true) */}
        {showBar && (
          <ProgressBar
            value={value}
            max={max}
            color={color}
            showPercent={showPercent}
            animated
          />
        )}
      </div>
    </div>
  );
};

// Helper: Color del icono según el tipo
const getIconColor = (icon: string): string => {
  const colors: Record<string, string> = {
    money: 'text-gold-500',
    energy: 'text-green-500',
    hunger: 'text-orange-500',
    listeners: 'text-cyan-400',
    reputation: 'text-purple-400',
  };
  return colors[icon] || 'text-gray-400';
};

// Helper: Color del valor según el tipo
const getValueColor = (icon: string): string => {
  const colors: Record<string, string> = {
    money: 'text-gold-500',
    energy: 'text-green-500',
    hunger: 'text-orange-500',
    listeners: 'text-cyan-400',
    reputation: 'text-purple-400',
  };
  return colors[icon] || 'text-gray-100';
};

export default ResourceBar;
