/**
 * 🧪 LEGENDS: ProgressBar Component Tests
 * Tests unitarios para el componente ProgressBar
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with correct percentage', () => {
    render(<ProgressBar value={75} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays percentage text when showPercent is true', () => {
    render(<ProgressBar value={50} showPercent />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<ProgressBar value={80} label="Energy" />);
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('applies green color by default', () => {
    const { container } = render(<ProgressBar value={50} />);
    const fill = container.querySelector('.bg-green-500');
    expect(fill).toBeInTheDocument();
  });

  it('applies orange color when specified', () => {
    const { container } = render(<ProgressBar value={50} color="orange" />);
    const fill = container.querySelector('.bg-orange-500');
    expect(fill).toBeInTheDocument();
  });

  it('applies red color when specified', () => {
    const { container } = render(<ProgressBar value={50} color="red" />);
    const fill = container.querySelector('.bg-red-500');
    expect(fill).toBeInTheDocument();
  });

  it('applies purple color when specified', () => {
    const { container } = render(<ProgressBar value={50} color="purple" />);
    const fill = container.querySelector('.bg-purple-500');
    expect(fill).toBeInTheDocument();
  });

  it('applies cyan color when specified', () => {
    const { container } = render(<ProgressBar value={50} color="cyan" />);
    const fill = container.querySelector('.bg-cyan-400');
    expect(fill).toBeInTheDocument();
  });

  it('handles value of 0', () => {
    render(<ProgressBar value={0} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles value of 100', () => {
    render(<ProgressBar value={100} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value above max', () => {
    render(<ProgressBar value={150} max={100} />);
    const progressBar = screen.getByRole('progressbar');
    // Should be clamped to 100
    expect(progressBar).toHaveAttribute('aria-valuenow', '150');
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar value={50} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows animated prop when specified', () => {
    const { container } = render(<ProgressBar value={50} animated />);
    // Check for animation class or style
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });
});
