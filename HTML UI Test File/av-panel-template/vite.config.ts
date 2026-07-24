import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative, not root-absolute — a CH5 App UI project on a real panel is
  // served from its own project subfolder, not the panel's web root. Root
  // paths (the default) 404 there even though they work fine in a normal
  // browser/dev server, where everything genuinely is served from "/".
  base: './',
  plugins: [react()],
});
