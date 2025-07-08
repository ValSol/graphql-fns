import tseslint from 'typescript-eslint';
import path from 'path';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.vscode/**', '*.log', '.DS_Store'] },

  // Default JS support (for eslint.config.js, jest.config.js, etc.)
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Type-aware rules only for .ts/.tsx
  // ...tseslint.configs.recommendedTypeChecked.map((config) => ({
  //   ...config,
  //   files: ['**/*.ts', '**/*.tsx'],
  //   languageOptions: {
  //     ...config.languageOptions,
  //     parserOptions: {
  //       project: './configs/tsconfig.esm.json', // ⬅️ Use your actual tsconfig path
  //       tsconfigRootDir: path.resolve(), // ⬅️ Ensure it's resolved
  //     },
  //   },
  // })),

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
