import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
export default defineConfig({
  // Relative base so the built site works on any host/subpath,
  // including GitHub Pages: arielisliko-dev.github.io/Pokedex_week_6_assigment/
  base: './',
  plugins: [react()],
})