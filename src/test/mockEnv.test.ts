import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('mockEnv.ts', () => {
  const originalWindowTelegram = window.Telegram;
  const fixedTime = 1700000000; // fixed timestamp in seconds

  beforeEach(() => {
    // Reset to original state before each test
    window.Telegram = originalWindowTelegram;
    delete window.Telegram; // Ensure clean state
    vi.resetModules();
    // Mock Date.now() to return fixedTime * 1000 milliseconds
    vi.setSystemTime(fixedTime * 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should use VITE_DEV_INIT_DATA when set', async () => {
    // Stub VITE_DEV_INIT_DATA environment variable
    vi.stubEnv('VITE_DEV_INIT_DATA', 'test_dev_data');

    // Import mockEnv.ts (this will run the initialization code)
    await import('../mockEnv');

    // Check that window.Telegram.WebApp.initData is set to our test data
    const initData = window.Telegram?.WebApp?.initData;
    expect(initData).toBe('test_dev_data');
  });

  it('should generate mock init data when VITE_DEV_INIT_DATA is not set', async () => {
    // Stub VITE_DEV_INIT_DATA as empty string
    vi.stubEnv('VITE_DEV_INIT_DATA', '');

    // Import mockEnv.ts (this will run the initialization code)
    await import('../mockEnv');

    // Check that window.Telegram.WebApp.initData is set and is a URL-encoded string
    const initData = window.Telegram?.WebApp?.initData ?? '';
    expect(typeof initData).toBe('string');
    expect(initData.length).toBeGreaterThan(0);

    // Verify it contains the expected fields
    expect(initData).toContain('auth_date=');
    expect(initData).toContain('user=');
    expect(initData).toContain('hash=');

    // Verify auth_date is exactly our fixed time (since we mocked the system time)
    const params = new URLSearchParams(initData);
    const authDateStr = params.get('auth_date');
    expect(authDateStr).not.toBeNull();

    const authDate = parseInt(authDateStr!, 10);
    expect(authDate).toBe(fixedTime);
  });

  it('should preserve all WebApp properties when generating mock data', async () => {
    // Stub VITE_DEV_INIT_DATA as empty string
    vi.stubEnv('VITE_DEV_INIT_DATA', '');

    // Import mockEnv.ts
    await import('../mockEnv');

    // Check that all expected WebApp properties are present
    const webApp = window.Telegram?.WebApp;
    expect(webApp).toBeDefined();
    expect(webApp?.initData).toBeDefined();
    expect(webApp?.initDataUnsafe).toBeDefined();
    expect(webApp?.initDataUnsafe?.user).toBeDefined();
    expect(webApp?.platform).toBe('tdesktop');
    expect(webApp?.version).toBe('8.0');
    expect(webApp?.colorScheme).toBe('light');
    // @ts-ignore - themeParams exists on the actual object but may not be in the type definition
    expect(webApp?.themeParams).toBeDefined();
    expect(webApp?.ready).toBeDefined();
    expect(webApp?.expand).toBeDefined();
    expect(webApp?.close).toBeDefined();
    expect(webApp?.showAlert).toBeDefined();
    expect(webApp?.showConfirm).toBeDefined();
    expect(webApp?.sendData).toBeDefined();
    expect(webApp?.BackButton).toBeDefined();
    expect(webApp?.MainButton).toBeDefined();
    expect(webApp?.HapticFeedback).toBeDefined();
  });
});