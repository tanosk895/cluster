import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    port: 5173,       // <--- Obbliga Vite a usare questa porta
    strictPort: true, // <--- Se la 5173 è occupata, Vite si ferma invece di cambiarla (così te ne accorgi)
   // allowedHosts: ['94a0-37-109-176-129.ngrok-free.app']
  }
})