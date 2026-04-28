import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Chowrest-Property/',
  plugins: [react()],

  resolve: {
    alias: {
      // @/store/authStore  → src/store/authStore
      // @/lib/utils        → src/lib/utils
      // @/types            → src/types
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Keeps index.html at the project root for the static public site.
  // The React SPA entry point lives at src/main.tsx.
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  server: {
    port: 5173,
    open: true,
  },
})
