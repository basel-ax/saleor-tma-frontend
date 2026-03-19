import { describe, it, vi, beforeEach } from 'vitest';

describe('debug mockEnv.ts', () => {
  const originalEnv = { ...import.meta.env };
  const originalWindowTelegram = window.Telegram;

  beforeEach(() => {
    console.log('Before each: Resetting state');
    // Reset to original state before each test
    vi.stubGlobal('import.meta.env', originalEnv);
    window.Telegram = originalWindowTelegram;
    delete window.Telegram; // Ensure clean state
    vi.resetModules();
    console.log('After reset, window.Telegram:', window.Telegram);
  });

  it('should show what window.Telegram is before import', async () => {
    console.log('Before import, window.Telegram:', window.Telegram);
    if (window.Telegram?.WebApp) {
      console.log('Before import, initData:', window.Telegram.WebApp.initData);
    }
    
    // Import mockEnv.ts (this will run the initialization code)
    await import('../mockEnv');
    
    console.log('After import, window.Telegram:', window.Telegram);
    if (window.Telegram?.WebApp) {
      console.log('After import, initData:', window.Telegram.WebApp.initData);
    }
  });
});