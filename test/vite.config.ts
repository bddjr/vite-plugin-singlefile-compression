import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Import singleFileCompression
import singleFileCompression from 'vite-plugin-singlefile-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Add singleFileCompression
    singleFileCompression(),
  ],
  build: {
    // Not use old syntax, make file smaller.
    target: 'esnext',
    // Disable reporting compressed chunk sizes, slightly improve build speed.
    reportCompressedSize: false
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
