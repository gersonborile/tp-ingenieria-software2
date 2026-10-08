import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // NestJS necesita `emitDecoratorMetadata` para la inyección por constructor,
    // algo que esbuild (el transformador por defecto de Vite) no emite.
    swc.vite({ module: { type: 'es6' } }),
  ],
  // Resolves the path aliases declared in tsconfig.json.
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.spec.ts'],
  },
});