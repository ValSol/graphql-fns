// eslint.config.js
import tseslint from 'typescript-eslint';
import promisePlugin from 'eslint-plugin-promise';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      promise: promisePlugin.default ?? promisePlugin,
    },
    rules: {
      'require-await': 'error',
      'no-return-await': 'error',
      'promise/catch-or-return': 'error',
    },
  },
];
