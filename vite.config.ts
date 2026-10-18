import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { execFileSync } from 'node:child_process'
let gitHash = 'unknown'
try { gitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim() } catch { /* Source archives may not include Git. */ }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()), __GIT_HASH__: JSON.stringify(gitHash) },
})
