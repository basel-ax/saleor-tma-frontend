import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('mockEnv.ts', () => {
  const originalEnv = { ...import.meta.env };
  const originalWindowTelegram = window.Telegram;

  beforeEach(() => {
    // Reset to original state before each test
    vi.stubGlobal('import.meta.env', originalEnv);
    window.Telegram = originalWindowTelegram;
    delete window.Telegram; // Ensure clean state
    vi.resetModules();
  });

  it('should use VITE_DEV_INIT_DATA when set', async () => {
    // Set up VITE_DEV_INIT_DATA
    vi.stubGlobal('import.meta.env', {
      ...originalEnv,
      VITE_DEV_INIT_DATA: 'test_dev_data'
    });
    
    // Import mockEnv.ts (this will run the initialization code)
    await import('../mockEnv');
    
    // Check that window.Telegram.WebApp.initData is set to our test data
    const initData = window.Telegram?.WebApp?.initData;
    expect(initData).toBe('test_dev_data');
  });

  it('should generate mock init data when VITE_DEV_INIT_DATA is not set', async () => {
    // Set up empty VITE_DEV_INIT_DATA
    vi.stubGlobal('import.meta.env', {
      ...originalEnv,
      VITE_DEV_INIT_DATA: ''
    });
    
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
    
    // Verify auth_date is a reasonable timestamp (within last 5 minutes)
    const params = new URLSearchParams(initData);
    const authDateStr = params.get('auth_date');
    expect(authDateStr).not.toBeNull();
    
    const authDate = parseInt(authDateStr!, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // 5 minutes in seconds
    
    expect(authDate).toBeLessThanOrEqual(currentTime);
    expect(authDate).toBeGreaterThan(currentTime - fiveMinutes);
  });

  it('should preserve all WebApp properties when generating mock data', async () => {
    // Set up empty VITE_DEV_INIT_DATA
    vi.stubGlobal('import.meta.env', {
      ...originalEnv,
      VITE_DEV_INIT_DATA: ''
    });
    
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
    // themeParams might not be in the type definition but should exist in the object
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