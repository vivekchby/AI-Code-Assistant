module.exports = [
  {
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // ── Errors ──
      semi: "error",
      "no-undef": "error",
      "no-cond-assign": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-extra-semi": "error",
      "no-func-assign": "error",
      "no-obj-calls": "error",
      "no-sparse-arrays": "error",
      "no-unreachable": "error",
      "valid-typeof": "error",

      // ── Warnings ──
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-extra-boolean-cast": "warn",
      "no-irregular-whitespace": "warn",
      "no-redeclare": "warn",
      "no-debugger": "warn",
      "no-dupe-else-if": "warn",
      "no-setter-return": "warn",
      "use-isnan": "warn",
      "eqeqeq": "warn",
      "no-eval": "warn",
      "no-var": "warn",
      "prefer-const": "warn",
      "no-shadow-restricted-names": "warn",

      // ── Style / Info ──
      "no-trailing-spaces": "warn",
      "no-multi-spaces": "warn",
      "comma-spacing": "warn",
      "key-spacing": "warn",
      "block-spacing": "warn",
      "comma-style": "warn",
      "brace-style": "warn",
      "curly": "warn",
    }
  }
];