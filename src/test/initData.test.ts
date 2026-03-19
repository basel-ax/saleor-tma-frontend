import { describe, it, expect } from 'vitest';
import { generateMockInitData } from '../utils/initData';

describe('generateMockInitData', () => {
  // ─── Happy Path Tests ────────────────────────────────────────────────

  it('should return a string', () => {
    const result = generateMockInitData();
    expect(typeof result).toBe('string');
  });

  it('should contain auth_date field', () => {
    const result = generateMockInitData();
    expect(result).toContain('auth_date=');
  });

  it('should contain user field', () => {
    const result = generateMockInitData();
    expect(result).toContain('user=');
  });

  it('should contain hash field', () => {
    const result = generateMockInitData();
    expect(result).toContain('hash=');
  });

  // ─── auth_date Validation ─────────────────────────────────────────────

  it('should have auth_date as a valid timestamp within a reasonable range of current time', () => {
    const result = generateMockInitData();
    const params = new URLSearchParams(result);
    const authDateStr = params.get('auth_date');

    expect(authDateStr).not.toBeNull();
    expect(authDateStr).toBeDefined();

    const authDate = parseInt(authDateStr!, 10);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = nowSeconds - 300;

    // auth_date should be within the last 5 minutes
    expect(authDate).toBeGreaterThanOrEqual(fiveMinutesAgo);
    expect(authDate).toBeLessThanOrEqual(nowSeconds + 1);
  });

  // ─── user Field Validation ───────────────────────────────────────────

  it('should have user field containing expected test user data', () => {
    const result = generateMockInitData();
    const params = new URLSearchParams(result);
    const userStr = params.get('user');

    expect(userStr).not.toBeNull();
    expect(userStr).toBeDefined();

    // user field should be URL-decoded JSON containing expected fields
    const decodedUser = JSON.parse(decodeURIComponent(userStr!));

    expect(decodedUser.id).toBe(0);
    expect(decodedUser.first_name).toBe('Test');
    expect(decodedUser.last_name).toBe('User');
    expect(decodedUser.username).toBe('testuser');
  });

  // ─── URL-encoded Format Validation ───────────────────────────────────

  it('should be URL-encoded format (key=value&key2=value2)', () => {
    const result = generateMockInitData();

    // Should contain key=value patterns separated by &
    expect(result).toMatch(/auth_date=\d+/);
    expect(result).toMatch(/user=/);
    expect(result).toMatch(/hash=/);
    expect(result).toMatch(/&/);
  });

  it('should have three key-value pairs', () => {
    const result = generateMockInitData();
    const params = new URLSearchParams(result);

    const keys = Array.from(params.keys());
    expect(keys).toHaveLength(3);
    expect(keys).toContain('auth_date');
    expect(keys).toContain('user');
    expect(keys).toContain('hash');
  });

  // ─── Boundary Tests ──────────────────────────────────────────────────

  it('should produce consistent format across multiple calls', () => {
    const result1 = generateMockInitData();
    const result2 = generateMockInitData();

    // Both should have same structure (keys)
    const params1 = new URLSearchParams(result1);
    const params2 = new URLSearchParams(result2);

    expect(Array.from(params1.keys()).sort()).toEqual(
      Array.from(params2.keys()).sort()
    );
  });
});
