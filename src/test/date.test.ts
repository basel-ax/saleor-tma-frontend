import { describe, it, expect } from 'vitest';

describe('Date.now() in test environment', () => {
  it('should return current timestamp', () => {
    const now = Date.now();
    console.log('Date.now() returned:', now);
    console.log('This is seconds:', Math.floor(now / 1000));
    expect(now).toBeGreaterThan(0);
  });
});