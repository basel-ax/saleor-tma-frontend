import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the modules that could interfere with our test setup
vi.mock('../mockEnv', () => ({}));
vi.mock('../utils/initData', () => ({
  generateMockInitData: vi.fn(() => 
    'query_id=test&user=%7B%22id%22%3A0%7D&auth_date=1700000000&hash=dummy'
  ),
}));

describe('getTelegramInitHeader', () => {
  beforeEach(() => {
    // Reset all mocks and modules
    vi.resetModules();
    vi.clearAllMocks();
    
    // Stub import.meta.env to a fresh object each time
    vi.stubGlobal('import.meta.env', {
      VITE_DEV_INIT_DATA: '',
      DEV: true,
      PROD: false,
    });
    
    // Set up window.Telegram.WebApp mock
    if (!window.Telegram) {
      (window as any).Telegram = {};
    }
    (window as any).Telegram.WebApp = {
      initData: 'window_init_data',
      initDataUnsafe: { user: { id: 0, first_name: 'Test' } },
    };
  });

  it('should return VITE_DEV_INIT_DATA when set', async () => {
    // Override env for this test
    vi.stubGlobal('import.meta.env', {
      VITE_DEV_INIT_DATA: 'test_dev_data',
      DEV: true,
      PROD: false,
    });
    
    // Re-import to pick up new env stub
    vi.resetModules();
    const { getTelegramInitHeader } = await import('../api/index');
    
    const result = getTelegramInitHeader();
    expect(result).toBe('test_dev_data');
  });

  it('should return window.Telegram.WebApp.initData when VITE_DEV_INIT_DATA is not set', async () => {
    // VITE_DEV_INIT_DATA is already '' from beforeEach
    vi.resetModules();
    const { getTelegramInitHeader } = await import('../api/index');
    
    const result = getTelegramInitHeader();
    expect(result).toBe('window_init_data');
  });

  it('should return empty string when both sources are empty', async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_DEV_INIT_DATA: '',
      DEV: true,
      PROD: false,
    });
    (window as any).Telegram.WebApp.initData = '';
    
    vi.resetModules();
    const { getTelegramInitHeader } = await import('../api/index');
    
    const result = getTelegramInitHeader();
    expect(result).toBe('');
  });

  it('should not modify the init data format', async () => {
    const rawData = 'query_id=test&user=testuser&auth_date=1700000000&hash=abc';
    (window as any).Telegram.WebApp.initData = rawData;
    
    vi.stubGlobal('import.meta.env', {
      VITE_DEV_INIT_DATA: '',
      DEV: true,
      PROD: false,
    });
    
    vi.resetModules();
    const { getTelegramInitHeader } = await import('../api/index');
    
    const result = getTelegramInitHeader();
    expect(result).toBe(rawData);
    expect(result).not.toContain('{');
    expect(result).not.toContain('}');
    expect(result).toContain('=');
    expect(result).toContain('&');
  });
});