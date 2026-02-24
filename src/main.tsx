// ─── App Entry Point ──────────────────────────────────────────────────────────
// Import mockEnv FIRST so the Telegram mock is set up before any component
// tries to access window.Telegram.WebApp.

import "./mockEnv";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// ─── Telegram WebApp Init ─────────────────────────────────────────────────────
// The telegram-web-app.js script is loaded synchronously in index.html.
// Inside real Telegram: window.Telegram.WebApp is the real SDK object.
// In browser:          window.Telegram.WebApp is our mock from mockEnv.ts.

function initTelegram() {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready(); // Hides the Telegram loading spinner
      tg.expand(); // Expand to full height
    }
  } catch (err) {
    console.warn("Telegram WebApp init failed:", err);
  }
}

initTelegram();

// ─── React Query Client ───────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Render ───────────────────────────────────────────────────────────────────

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
