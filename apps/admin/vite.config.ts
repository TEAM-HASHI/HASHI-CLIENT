import { defineConfig } from 'vite'
import { alias, plugins } from './vite.shared'

export default defineConfig({
  resolve: {
    alias,
  },
  plugins,
})
