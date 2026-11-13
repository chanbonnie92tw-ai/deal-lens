import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build can be dropped into a portfolio subfolder and iframed.
export default defineConfig({
  plugins: [react()],
  base: './',
})
