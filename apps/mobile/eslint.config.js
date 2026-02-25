// Ensures import resolver works when ESLint runs from apps/mobile (e.g. IDE).
const path = require('path');
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'tsconfig.json'),
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
