/**
 * 🧪 LEGENDS: Badge Component Tests
 * Tests unitarios para el componente Badge
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies gold variant styles', () => {
    const { container } = render(<Badge variant="gold">Gold</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-gold-500');
  });

  it('applies green variant styles', () => {
    const { container } = render(<Badge variant="green">Green</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green-500');
  });

  it('applies red variant styles', () => {
    const { container } = render(<Badge variant="red">Red</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-red-500');
  });

  it('applies purple variant styles', () => {
    const { container } = render(<Badge variant="purple">Purple</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-purple-500');
  });

  it('applies cyan variant styles', () => {
    const { container } = render(<Badge variant="cyan">Cyan</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-cyan-400');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('custom-class');
  });

  it('defaults to purple variant when no variant specified', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-purple-500');
  });
});
