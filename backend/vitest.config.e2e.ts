import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Mismo motivo que en `vitest.config.ts`: metadata de decoradores para el DI de NestJS.
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
    include: ['**/*.e2e-spec.ts'],
  },
});