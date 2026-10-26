import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-svg': 'react-native-web',
      'react-native-safe-area-context': path.resolve(__dirname, 'src/shims/safe-area.tsx'),
      'react-native-vector-icons/MaterialCommunityIcons': path.resolve(__dirname, 'src/shims/vector-icons.tsx'),
      'react-native-vector-icons/MaterialIcons': path.resolve(__dirname, 'src/shims/vector-icons.tsx'),
      'react-native-vector-icons': path.resolve(__dirname, 'src/shims/vector-icons.tsx'),
    },
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.mjs',
      '.js',
      '.mts',
      '.ts',
      '.jsx',
      '.tsx',
      '.json'
    ]
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
});
