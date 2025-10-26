import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'components'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@styles': path.resolve(__dirname, 'styles'),
      '@hooks': path.resolve(__dirname, 'hooks'),
      '@assets': path.resolve(__dirname, 'assets'),
    },
  },
  server: {
    port: 5173,
  },
});
