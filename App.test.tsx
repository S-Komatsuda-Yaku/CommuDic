import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as geminiService from './services/geminiService';
import { AnalysisResult } from './types';

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

// Mock Supabase client
vi.mock('./services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'test-log-id' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

// Mock geminiService
vi.mock('./services/geminiService', () => ({
  analyzePersonality: vi.fn(),
}));

describe('App Integration Tests', () => {
  const mockAnalysisResult: AnalysisResult = {
    catchphrase: 'Integration test catchphrase',
    summary: 'Integration test summary',
    scores: {
      sociability: 4,
      logic: 3,
      curiosity: 5,
      cooperation: 4,
      action: 3,
    },
    businessAptitude: {
      workStyle: 'Collaborative and innovative',
      strengths: ['Communication', 'Problem-solving'],
      suitableRoles: ['Product Manager', 'Team Lead'],
    },
    personCommunity: {
      socialStyle: 'Outgoing and friendly',
      values: ['Teamwork', 'Innovation'],
      interactionTips: 'Be direct and honest',
      optimalPlace: 'Open office environment',
    },
    type: 'Leader',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(geminiService.analyzePersonality).mockResolvedValue(mockAnalysisResult);
  });

  it('renders the app with input section', () => {
    render(<App />);
    
    expect(screen.getByText('CommuDic')).toBeInTheDocument();
    expect(screen.getByText(/複合解析を開始する/i)).toBeInTheDocument();
  });

  it('completes full analysis flow from input to results', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Enter text
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'I am a creative problem solver');

    // Step 2: Submit analysis
    const submitButton = screen.getByText(/複合解析を開始する/i);
    await user.click(submitButton);

    // Step 3: Wait for analysis to complete
    await waitFor(
      () => {
        expect(screen.getByText('"Integration test catchphrase"')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Step 4: Verify results are displayed
    expect(screen.getByText('Integration test summary')).toBeInTheDocument();
    expect(screen.getByText('Collaborative and innovative')).toBeInTheDocument();
  });

  it('handles reset flow correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Submit analysis
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'Test input');
    await user.click(screen.getByText(/複合解析を開始する/i));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('"Integration test catchphrase"')).toBeInTheDocument();
    });

    // Click reset button
    const resetButton = screen.getByText('再試行');
    await user.click(resetButton);

    // Verify we're back at input section
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/自分の強みや価値観/)).toBeInTheDocument();
    });
  });

  it('displays error message when analysis fails', async () => {
    const user = userEvent.setup();
    vi.mocked(geminiService.analyzePersonality).mockRejectedValue(
      new Error('API Error')
    );

    render(<App />);

    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'Test input');
    await user.click(screen.getByText(/複合解析を開始する/i));

    await waitFor(() => {
      expect(screen.getByText(/複合解析中にエラーが発生しました/)).toBeInTheDocument();
    });
  });

  it('shows loading state during analysis', async () => {
    const user = userEvent.setup();
    
    // Make the analysis take longer
    vi.mocked(geminiService.analyzePersonality).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockAnalysisResult), 100))
    );

    render(<App />);

    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'Test input');
    await user.click(screen.getByText(/複合解析を開始する/i));

    // Check for loading state
    expect(screen.getByText(/Synthesizing/i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('"Integration test catchphrase"')).toBeInTheDocument();
    });
  });

  it('calls geminiService.analyzePersonality with correct input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const testText = 'My personality description';
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, testText);
    await user.click(screen.getByText(/複合解析を開始する/i));

    await waitFor(() => {
      expect(geminiService.analyzePersonality).toHaveBeenCalledWith({
        text: testText,
        files: [],
      });
    });
  });
});
