const js = require('@eslint/js');
const globals = require('globals');
const prettierConfig = require('eslint-config-prettier');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  js.configs.recommended,
  {
    // Backend (+ this config file itself, and any other root-level CommonJS tooling script):
    // CommonJS (require/module.exports), runs under Node.
    files: ['src/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Frontend: ES modules + JSX, runs in the browser -- a different module system from the
    // backend above, so it needs its own languageOptions rather than inheriting the CommonJS
    // block (that's what broke the pre-commit hook the first time this ran against frontend/).
    files: ['frontend/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Only the two long-standing, universally-applicable rules -- not the plugin's full
      // "recommended" config, which (as of v7) is tuned for the React Compiler and flags the
      // classic fetch-in-useEffect pattern this codebase uses deliberately throughout (plain
      // fetch + Context was the chosen approach, not a data-fetching library -- see README §9).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettierConfig,
  {
    ignores: ['node_modules/', 'logs/', 'frontend/node_modules/', 'frontend/dist/'],
  },
];
