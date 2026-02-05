import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputSection from './InputSection';
import { AnalysisInput } from '../types';

describe('InputSection', () => {
  const mockOnAnalyze = vi.fn();

  it('renders input section with all elements', () => {
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    expect(screen.getByText(/Composite Multi-Input Analysis/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/自分の強みや価値観/)).toBeInTheDocument();
    expect(screen.getByText(/複合解析を開始する/i)).toBeInTheDocument();
  });

  it('handles text input changes', async () => {
    const user = userEvent.setup();
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'Test personality description');
    
    expect(textarea).toHaveValue('Test personality description');
  });

  it('enables submit button when text is entered', async () => {
    const user = userEvent.setup();
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /複合解析を開始する/i });
    expect(button).toBeDisabled();
    
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'Test text');
    
    expect(button).not.toBeDisabled();
  });

  it('calls onAnalyze with text input when submitted', async () => {
    const user = userEvent.setup();
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    const textarea = screen.getByPlaceholderText(/自分の強みや価値観/);
    await user.type(textarea, 'My personality traits');
    
    const button = screen.getByRole('button', { name: /複合解析を開始する/i });
    await user.click(button);
    
    expect(mockOnAnalyze).toHaveBeenCalledWith({
      text: 'My personality traits',
      files: [],
    });
  });

  it('handles file upload', async () => {
    const { container } = render(<InputSection onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (input) {
      await userEvent.upload(input, file);
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });
    }
  });

  it('disables submit button while loading', () => {
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /Synthesizing/i });
    expect(button).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<InputSection onAnalyze={mockOnAnalyze} isLoading={true} />);
    
    expect(screen.getByText(/Synthesizing/i)).toBeInTheDocument();
  });
});
