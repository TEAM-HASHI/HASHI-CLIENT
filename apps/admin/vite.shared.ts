import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
}

export const plugins = [react(), tailwindcss()]
