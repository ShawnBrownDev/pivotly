// https://docs.expo.dev/guides/using-eslint/
const path = require('path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'apps/api/**',
      'packages/**',
      '**/dist/**',
      '**/.expo/**',
    ],
  },
  // Resolve modules from apps/mobile (tsconfig paths + node) when linting mobile app
  {
    files: ['apps/mobile/**/*.ts', 'apps/mobile/**/*.tsx'],
    settings: {
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'apps/mobile/tsconfig.json'),
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
]);
