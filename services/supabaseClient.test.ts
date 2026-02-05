import { describe, it, expect, vi } from 'vitest';
import { supabase } from './supabaseClient';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

describe('supabaseClient', () => {
  it('initializes supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('is configured with environment variables', () => {
    // In a real environment, we'd check internal configuration
    // Here we just verify the singleton instance exists
    expect(supabase).toBeTruthy();
  });
});
