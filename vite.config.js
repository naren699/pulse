import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle animation/icon libs together with React so the dep
    // optimizer never serves them against a stale React copy.
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
})
