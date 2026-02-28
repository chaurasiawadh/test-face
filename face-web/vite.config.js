import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/test-face/',
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    allowedHosts: ["endurant-nonnutritively-kimber.ngrok-free.dev"],
  },
})
