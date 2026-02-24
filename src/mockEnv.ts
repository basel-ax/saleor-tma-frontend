// ─── Mock Telegram Environment ────────────────────────────────────────────────
// When running outside of Telegram (browser, Cloudflare Pages preview, etc.),
// the window.Telegram.WebApp object is not injected by the Telegram client.
// We set up a lightweight mock so the app doesn't crash in a browser.
//
// Inside real Telegram, the telegram-web-app.js script (loaded in index.html)
// provides the real window.Telegram.WebApp — this mock is skipped entirely.

if (!window.Telegram?.WebApp) {
  // Build a minimal mock that satisfies the app's usage of the WebApp API
  const noop = () => {};
  const noopOff = () => {};

  const mockWebApp = {
    initData: "",
    initDataUnsafe: {
      user: {
        id: 0,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
      },
    },
    platform: "tdesktop",
    version: "8.0",
    colorScheme: "light" as const,
    themeParams: {
      bg_color: "#ffffff",
      text_color: "#000000",
      hint_color: "#999999",
      link_color: "#3390ec",
      button_color: "#3390ec",
      button_text_color: "#ffffff",
      secondary_bg_color: "#f0f0f0",
      header_bg_color: "#ffffff",
      accent_text_color: "#3390ec",
      section_bg_color: "#ffffff",
      section_header_text_color: "#3390ec",
      subtitle_text_color: "#999999",
      destructive_text_color: "#e53935",
    },
    ready: noop,
    expand: noop,
    close: noop,
    showAlert: (message: string, callback?: () => void) => {
      window.alert(message);
      callback?.();
    },
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => {
      callback(window.confirm(message));
    },
    sendData: noop,
    BackButton: {
      isVisible: false,
      show: noop,
      hide: noop,
      onClick: (_fn: () => void) => noopOff,
      offClick: noop,
    },
    MainButton: {
      text: "",
      color: "#3390ec",
      textColor: "#ffffff",
      isVisible: false,
      isActive: true,
      show: noop,
      hide: noop,
      enable: noop,
      disable: noop,
      setText: noop,
      onClick: (_fn: () => void) => noopOff,
      offClick: noop,
      showProgress: noop,
      hideProgress: noop,
    },
    HapticFeedback: {
      impactOccurred: noop,
      notificationOccurred: noop,
      selectionChanged: noop,
    },
  };

  // Apply mock CSS theme variables so Tailwind tg-* colors work in browser
  const root = document.documentElement;
  root.style.setProperty("--tg-theme-bg-color", "#ffffff");
  root.style.setProperty("--tg-theme-text-color", "#000000");
  root.style.setProperty("--tg-theme-hint-color", "#999999");
  root.style.setProperty("--tg-theme-link-color", "#3390ec");
  root.style.setProperty("--tg-theme-button-color", "#3390ec");
  root.style.setProperty("--tg-theme-button-text-color", "#ffffff");
  root.style.setProperty("--tg-theme-secondary-bg-color", "#f0f0f0");
  root.style.setProperty("--tg-theme-header-bg-color", "#ffffff");
  root.style.setProperty("--tg-theme-bottom-bar-bg-color", "#f0f0f0");
  root.style.setProperty("--tg-theme-accent-text-color", "#3390ec");
  root.style.setProperty("--tg-theme-section-bg-color", "#ffffff");
  root.style.setProperty("--tg-theme-section-header-text-color", "#3390ec");
  root.style.setProperty("--tg-theme-subtitle-text-color", "#999999");
  root.style.setProperty("--tg-theme-destructive-text-color", "#e53935");

  // Inject mock into window
  if (!window.Telegram) {
    (window as unknown as Record<string, unknown>)["Telegram"] = {
      WebApp: mockWebApp,
    };
  }
}
