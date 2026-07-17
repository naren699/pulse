import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const sharedSrc = fileURLToPath(new URL('../shared/src', import.meta.url))
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Firebase credentials live in the repo-root .env.local so web and mobile
  // read one set of values.
  envDir: repoRoot,
  resolve: {
    // Alias straight at the source so Vite treats @pulse/shared as first-party
    // code (transformed, hot-reloaded) rather than a prebundled dependency.
    alias: [{ find: /^@pulse\/shared(\/.*)?$/, replacement: `${sharedSrc}$1` }],
  },
  server: {
    // shared/ sits outside this package's root.
    fs: { allow: [repoRoot] },
  },
  optimizeDeps: {
    // Pre-bundle animation/icon libs together with React so the dep
    // optimizer never serves them against a stale React copy.
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    exclude: ['@pulse/shared'],
  },
})
