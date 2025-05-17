/* eslint-disable */
const path = require('path');
const { defineConfig } = require("eslint/config");
const globals = require("globals");

const js = require('@eslint/js');
const { includeIgnoreFile } = require("@eslint/compat");
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const eslintPluginPrettier = require('eslint-plugin-prettier');

const gitignorePath = path.resolve(__dirname, '.gitignore');

module.exports = defineConfig([
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  {
    rules: {
      ...prettier.rules,
    },
  },
]);
