import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    base: './', // Ensures assets work on GitHub Pages relative paths
    define: {
      // Polyfill process.env.API_KEY for the Gemini Service
      // Users should create a .env file with API_KEY=your_key
      // Default to empty string to prevent crash on load, requests will fail gracefully
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})