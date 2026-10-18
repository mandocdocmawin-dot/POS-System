import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { execFileSync } from 'node:child_process'
let gitHash = 'unknown'
try { gitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim() } catch { /* Source archives may not include Git. */ }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...(process.env.ANALYZE ? [visualizer({filename:'.phase-tools/bundle.html',gzipSize:true})] : [])],
  resolve: { alias: [{find: /^apexcharts(?:\/client)?$/, replacement: fileURLToPath(new URL('./src/components/charts/apex.ts', import.meta.url))}] },
  build: { manifest: true, chunkSizeWarningLimit: 700 },
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()), __GIT_HASH__: JSON.stringify(gitHash) },
})


