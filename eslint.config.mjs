import { FlatCompat } from '@eslint/eslintrc';
import js from "@eslint/js";

// Initialize FlatCompat with recommended config
const compat = new FlatCompat({
  baseDirectory: import.meta.url,
  recommendedConfig: js.configs.recommended,
});

export default [
  // Convert ESLint recommended rules
  ...compat.extends('eslint:recommended'),

  {
    files: ["soanr test.jsx"], // Match your project files
    languageOptions: {
      ecmaVersion: 2015, // ECMAScript version you are using
      sourceType: "module", // Use "script" if not using modules
      globals: {
        // Define Extendscript-specific global variables
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        "$": "readonly",
        app: "readonly",
        document: "readonly",
        // Add more globals as needed
      },
    },
    rules: {
      // Customize your rules
      "no-console": "off", // Allow the use of console
      "no-undef": "off",
      "no-unused-vars": ["error", { "vars": "all", "args": "none", "ignoreRestSiblings": false, "caughtErrors": "all", "caughtErrorsIgnorePattern": "^(err|e)" }],// Disallow undefined variables
      "semi": "off", // Require semicolons
      "quotes": "off",
      // Enforce double quotes
      // Add more rules as needed
    },
  },
];