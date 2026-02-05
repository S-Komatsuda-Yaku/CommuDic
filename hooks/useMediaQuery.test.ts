import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  it('returns initial value based on media query', () => {
    // Mock matchMedia to return matches: true
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(true);
  });

  it('returns false when media query does not match', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', () => {
    let matchesValue = false;
    let changeListener: ((e: any) => void) | null = null;

    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, callback: (e: any) => void) => {
        if (event === 'change') {
          changeListener = callback;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result, rerender } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(result.current).toBe(false);

    // Simulate media query change
    matchesValue = true;
    if (changeListener) {
      act(() => {
        changeListener({ matches: true });
      });
    }
    
    // Rerender the hook to pick up new value
    rerender();

    expect(result.current).toBe(true);
  });
});
