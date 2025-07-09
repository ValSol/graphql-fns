import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  target: 'node22',
});
