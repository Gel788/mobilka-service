import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/services": "http://localhost:4000",
      "/intents": "http://localhost:4000",
      "/health": "http://localhost:4000"
    }
  }
})
