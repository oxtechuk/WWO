import { cpSync } from 'node:fs';

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  format: ['cjs', 'esm'],
  onSuccess: async () => {
    cpSync('src/utils/translations', 'dist/translations', { recursive: true });
    try {
      cpSync('src/docs', 'dist/docs', { recursive: true });
    } catch (e) {}
  },
  loader: {
    '.json': 'file',
    '.yml': 'file',
    '.yaml': 'file',
  },
});
