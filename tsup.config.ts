import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client/index.ts'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: {
    entry: ['src/index.ts', 'src/client/index.ts'],
  },
  format: ['esm', 'cjs'],
  target: 'node22',
});
