import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['tests/visual/**', 'node_modules/**', 'dist/**'],
    pool: 'threads',
    maxWorkers: 1,
    isolate: false,
    unstubEnvs: true,
  },
});
