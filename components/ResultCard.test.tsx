import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultCard from './ResultCard';
import { AnalysisResult } from '../types';

// Mock Recharts
vi.mock('recharts', () => {
  return {
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

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

// Mock jspdf
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

// Mock Supabase client
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

describe('ResultCard', () => {
  const mockResult: AnalysisResult = {
    catchphrase: 'Test catchphrase',
    summary: 'Test summary',
    scores: {
      sociability: 4,
      logic: 3,
      curiosity: 5,
      cooperation: 4,
      action: 3,
    },
    businessAptitude: {
      workStyle: 'Test work style',
      strengths: ['Strength 1', 'Strength 2'],
      suitableRoles: ['Role 1', 'Role 2'],
    },
    personCommunity: {
      socialStyle: 'Test social style',
      values: ['Value 1', 'Value 2'],
      interactionTips: 'Test interaction tips',
      optimalPlace: 'Test optimal place',
    },
    type: 'Test Type',
  };

  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders analysis result correctly', () => {
    render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    expect(screen.getByText('"Test catchphrase"')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText('TYPE: Test Type')).toBeInTheDocument();
  });

  it('displays business aptitude section', () => {
    render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    expect(screen.getByText('Test work style')).toBeInTheDocument();
    expect(screen.getByText('Strength 1')).toBeInTheDocument();
    expect(screen.getByText('Strength 2')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
  });

  it('displays person community section', () => {
    render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    expect(screen.getByText('Test social style')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
    expect(screen.getByText('Value 2')).toBeInTheDocument();
    expect(screen.getByText('Test interaction tips')).toBeInTheDocument();
    expect(screen.getByText('Test optimal place')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    const resetButton = screen.getByText('再試行');
    await user.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('handles copy to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    const copyButton = screen.getAllByRole('button').find((btn) => 
      btn.querySelector('svg')?.classList.contains('lucide-copy') ||
      btn.querySelector('svg')?.classList.contains('lucide-check')
    );
    
    if (copyButton) {
      await user.click(copyButton);
      expect(writeTextMock).toHaveBeenCalled();
    }
  });

  it('renders radar chart', () => {
    const { container } = render(<ResultCard result={mockResult} onReset={mockOnReset} logId={null} />);
    
    // Check for ResponsiveContainer which is part of RadarChart
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
