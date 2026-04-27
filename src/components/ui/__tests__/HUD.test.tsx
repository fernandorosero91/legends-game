import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HUD from '../HUD';

describe('HUD Component', () => {
  const defaultProps = {
    money: 5000,
    energy: 75,
    hunger: 60,
    listeners: 1500,
  };

  it('renders all resource bars', () => {
    render(<HUD {...defaultProps} />);
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('hides reputation when showReputation is false', () => {
    render(<HUD {...defaultProps} reputation={50} showReputation={false} />);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('shows reputation when showReputation is true', () => {
    render(<HUD {...defaultProps} reputation={50} showReputation />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('formats large money values correctly', () => {
    render(<HUD {...defaultProps} money={25000} />);
    expect(screen.getByText('$25,000')).toBeInTheDocument();
  });

  it('formats large listener values correctly', () => {
    render(<HUD {...defaultProps} listeners={10000} />);
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });
});
