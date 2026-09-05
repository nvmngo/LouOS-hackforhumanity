import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ],
  // The Base44 vite plugin only wires its /api proxy when VITE_BASE44_APP_BASE_URL
  // is set (which `base44 dev` does). It does NOT, however, bind the dev server to
  // 0.0.0.0 or allow arbitrary hosts outside its own sandbox mode — both of which
  // are required for the containerized preview. Add them here so the same proxy
  // works while the server is reachable through the preview's external hostname.
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
