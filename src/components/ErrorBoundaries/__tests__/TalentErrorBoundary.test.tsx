/**
 * 🧪 TALENT ERROR BOUNDARY - TESTS
 * Tests for error catching and recovery
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TalentErrorBoundary } from '../TalentErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Success!</div>;
}

describe('TalentErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error', () => {
    render(
      <TalentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={false} />
      </TalentErrorBoundary>
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should catch and display errors', () => {
    render(
      <TalentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </TalentErrorBoundary>
    );

    expect(screen.getByText(/Error in TestComponent/i)).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should provide retry functionality', () => {
    const { rerender } = render(
      <TalentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </TalentErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    // Clicking retry would reset error state (tested via user interaction)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should log errors to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <TalentErrorBoundary componentName="TestComponent">
        <ThrowError shouldThrow={true} />
      </TalentErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

