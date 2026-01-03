import { cn } from './utils';
import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('text-red-500', true && 'bg-blue-500', false && 'hidden');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle tailwind conflicts correctly (merge)', () => {
    // tailwind-merge should resolve this to the last one
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('should handle arrays and objects if supported by clsx', () => {
      const result = cn(['px-2', 'py-1'], { 'bg-red-500': true, 'hidden': false });
      expect(result).toBe('px-2 py-1 bg-red-500');
  });
});
