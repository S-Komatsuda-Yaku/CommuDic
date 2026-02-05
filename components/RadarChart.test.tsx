import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RadarChart from './RadarChart';
import { PersonalityScores } from '../types';

// Mock Recharts to avoid ResponsiveContainer issues in jsdom
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div className="recharts-responsive-container" style={{ width: 800, height: 800 }}>
        {children}
      </div>
    ),
    RadarChart: ({ children }: any) => <div className="recharts-radar-chart">{children}</div>,
    PolarGrid: () => <div className="recharts-polar-grid" />,
    PolarAngleAxis: () => <div className="recharts-polar-angle-axis" />,
    PolarRadiusAxis: () => <div className="recharts-polar-radius-axis" />,
    Radar: () => <div className="recharts-radar" />,
  };
});

describe('RadarChart', () => {
  const mockScores: PersonalityScores = {
    sociability: 4,
    logic: 3,
    curiosity: 5,
    cooperation: 4,
    action: 3,
  };

  it('renders without crashing', () => {
    const { container } = render(<RadarChart scores={mockScores} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders ResponsiveContainer component', () => {
    const { container } = render(<RadarChart scores={mockScores} />);
    const chartContainer = container.querySelector('.recharts-responsive-container');
    expect(chartContainer).toBeTruthy();
  });

  it('handles edge case values (all zeros)', () => {
    const zeroScores: PersonalityScores = {
      sociability: 0,
      logic: 0,
      curiosity: 0,
      cooperation: 0,
      action: 0,
    };
    
    const { container } = render(<RadarChart scores={zeroScores} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('handles edge case values (all max)', () => {
    const maxScores: PersonalityScores = {
      sociability: 5,
      logic: 5,
      curiosity: 5,
      cooperation: 5,
      action: 5,
    };
    
    const { container } = render(<RadarChart scores={maxScores} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
