import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Silence the harmless "use client" directive warnings emitted by
        // @tanstack/react-query v5 when bundled with Vite 4 / Rollup.
        // These directives are Next.js / RSC annotations and have no effect
        // in a pure client-side Vite bundle.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"')
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
