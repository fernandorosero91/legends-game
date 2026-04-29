import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResourceBar from '../ResourceBar';

describe('ResourceBar Component', () => {
  it('renders label and value', () => {
    render(<ResourceBar icon="money" label="Dinero" value={5000} />);
    expect(screen.getByText('Dinero')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('formats money with thousands separator', () => {
    render(<ResourceBar icon="money" label="Dinero" value={10000} />);
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('formats listeners with thousands separator', () => {
    render(<ResourceBar icon="listeners" label="Oyentes" value={7500} />);
    expect(screen.getByText('7,500')).toBeInTheDocument();
  });

  it('shows percentage when showPercent is true', () => {
    render(<ResourceBar icon="energy" label="Energía" value={75} max={100} showPercent />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows progress bar when showBar is true', () => {
    const { container } = render(
      <ResourceBar icon="energy" label="Energía" value={50} max={100} showBar />
    );
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('applies correct color for energy', () => {
    const { container } = render(
      <ResourceBar icon="energy" label="Energía" value={50} color="green" showBar />
    );
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('applies correct color for hunger', () => {
    const { container } = render(
      <ResourceBar icon="hunger" label="Hambre" value={50} color="orange" showBar />
    );
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });
});
