import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_LOCAL_FILE_MODE': JSON.stringify('true'),
  },
  build: {
    outDir: 'dist-local',
  },
})
