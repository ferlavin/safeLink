import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function packageExtensionPlugin() {
  const pack = () => {
    const script = path.resolve(rootDir, '../scripts/package-extension.mjs')
    const result = spawnSync(process.execPath, [script], { stdio: 'inherit' })
    if (result.status !== 0) {
      throw new Error('No se pudo generar safelink-extension.zip')
    }
  }
  return {
    name: 'package-safelink-extension',
    buildStart: pack,
    configureServer: pack,
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [packageExtensionPlugin(), react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
