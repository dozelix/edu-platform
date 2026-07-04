import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

export default [
  { ignores: ['dist', 'dist-gh', 'release', '**/node_modules/**'] },
  js.configs.recommended,
  {
    files: ['packages/*/src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^(React|_)', argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['packages/*/src/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },
];