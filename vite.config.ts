import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { execFileSync } from 'node:child_process'
let gitHash = 'unknown'
try { gitHash = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim() } catch { /* Source archives may not include Git. */ }

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react(), VitePWA({registerType:"prompt", injectRegister:false, devOptions:{enabled:false}, workbox:{globPatterns:["**/*.{js,css,html,ico,png,svg,webp,avif,woff2}"],navigateFallback:"index.html",cleanupOutdatedCaches:true}, manifest:{name:"TindaPOS",short_name:"TindaPOS",description:"Your local demo shop workspace",display:"standalone",theme_color:"#4f46e5",background_color:"#f8fafc",start_url:"./",scope:"./",categories:["business","productivity"],shortcuts:[{name:"Open POS",url:"./pos"},{name:"Dashboard",url:"./"}],icons:[{src:"pwa-192x192.png",sizes:"192x192",type:"image/png"},{src:"pwa-512x512.png",sizes:"512x512",type:"image/png"},{src:"maskable-icon-512x512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]}}), ...(process.env.ANALYZE ? [visualizer({filename:'.phase-tools/bundle.html',gzipSize:true})] : [])],
  resolve: { alias: [{find: /^apexcharts(?:\/client)?$/, replacement: fileURLToPath(new URL('./src/components/charts/apex.ts', import.meta.url))}] },
  build: { manifest: true, chunkSizeWarningLimit: 700 },
  define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString()), __GIT_HASH__: JSON.stringify(gitHash) },
})


