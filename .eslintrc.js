module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "import", "snakecasejs"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      typescript: {}
    },
    "snakecasejs/filter": ["TSModuleDeclaration"],
    "snakecasejs/whitelist": ["getUsed", "defineProperty", "_HasName", "_HasId", "WeakMap"]
  },
  rules: {
    // plugin rules
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit"
      }
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-shadow": [
      "error",
      {
        hoist: "all"
      }
    ],
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/space-within-parens": ["off", "never"],
    "@typescript-eslint/unified-signatures": "error",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-for-in-array": "off",
    "@typescript-eslint/member-ordering": ["error", {
      "default": {
        "memberTypes": [
          // Index signature
          "signature",
          "call-signature",
          // Fields
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-decorated-field",
          "protected-decorated-field",
          "private-decorated-field",
          "public-instance-field",
          "protected-instance-field",
          "private-instance-field",
          "public-abstract-field",
          "protected-abstract-field",
          "private-abstract-field",
          "public-field",
          "protected-field",
          "private-field",
          "static-field",
          "instance-field",
          "abstract-field",
          "decorated-field",
          "field",
          // Constructors
          "public-constructor",
          "protected-constructor",
          "private-constructor",
          "constructor",
          // Methods
          "public-static-method",
          "protected-static-method",
          "private-static-method",
          "public-decorated-method",
          "protected-decorated-method",
          "private-decorated-method",
          "public-instance-method",
          "protected-instance-method",
          "private-instance-method",
          "public-abstract-method",
          "protected-abstract-method",
          "private-abstract-method",
          "public-method",
          "protected-method",
          "private-method",
          "static-method",
          "instance-method",
          "abstract-method",
          "decorated-method",
          "method"
        ],
        "order": "alphabetically"
      }
    }],
    "snakecasejs/snakecasejs": "error",
    // normal eslint rules
    "arrow-parens": ["off", "as-needed"],
    "camelcase": "off",
    "complexity": "off",
    "dot-notation": "error",
    "eol-last": "off",
    "eqeqeq": ["error", "smart"],
    "guard-for-in": "off",
    "id-blacklist": ["error", "any", "Number", "number", "String", "string", "Boolean", "boolean", "Undefined"],
    "id-match": "error",
    "linebreak-style": "off",
    "max-classes-per-file": ["error", 1],
    "new-parens": "off",
    "newline-per-chained-call": "off",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "off",
    "no-eval": "error",
    "no-invalid-this": "off",
    "no-multiple-empty-lines": "off",
    "no-new-wrappers": "error",
    "no-shadow": "off",
    "no-throw-literal": "error",
    "no-trailing-spaces": "off",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "quote-props": "off",
    "radix": "error",
    "sort-imports": "off",
    "spaced-comment": "error",
  }
};
