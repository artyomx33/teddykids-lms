/**
 * 🧪 USE CANDIDATES HOOK - TESTS
 * Tests for real-time candidate fetching and management
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCandidates } from '../useCandidates';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [
              {
                id: 'test-1',
                full_name: 'Test Candidate',
                email: 'test@example.com',
                status: 'new',
                overall_score: 85,
                passed: true,
                created_at: '2025-10-23T10:00:00Z'
              }
            ],
            error: null
          }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      unsubscribe: vi.fn()
    }))
  }
}));

describe('useCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch candidates on mount', async () => {
    const { result } = renderHook(() => useCandidates({ autoFetch: true }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.candidates).toHaveLength(1);
    expect(result.current.candidates[0].full_name).toBe('Test Candidate');
  });

  it('should calculate stats correctly', async () => {
    const { result } = renderHook(() => useCandidates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats.total).toBe(1);
    expect(result.current.stats.new).toBe(1);
    expect(result.current.stats.passed).toBe(1);
  });

  it('should handle fetch errors gracefully', async () => {
    // Mock error response
    const mockError = new Error('Network error');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
    } as any);

    const { result } = renderHook(() => useCandidates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.candidates).toEqual([]);
  });

  it('should prevent race conditions with isFetching guard', async () => {
    const { result } = renderHook(() => useCandidates({ autoFetch: false }));

    // Call refetch twice quickly
    result.current.refetch();
    result.current.refetch();

    // Second call should be skipped due to isFetching guard
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify only one fetch occurred
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

